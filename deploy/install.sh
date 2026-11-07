#!/usr/bin/env bash
# Think-asta: one-shot server setup. Run ON the server, as root or a sudo user:
#
#   curl -fsSL https://raw.githubusercontent.com/sudxxt-afk/think-asta/main/deploy/install.sh | bash
#   # with options:
#   curl -fsSL .../install.sh | bash -s -- --domain example.com --pubkey "ssh-ed25519 AAAA..."
#
# What it does (safe to re-run: a second run updates and rebuilds):
#   1. installs git, curl, Docker + compose (apt or dnf), adds swap on small machines
#   2. stops, disables and backs up nginx / apache, frees ports 80 and 443
#   3. opens 80/443 in ufw / firewalld if one is active
#   4. clones or updates the repo into /opt/think-asta
#   5. creates .env.prod with generated secrets (kept on re-runs)
#   6. builds and starts Postgres, the app and Caddy (automatic HTTPS, sslip.io domain by default)
#   7. waits for the site to answer over HTTPS and prints the address and admin login
#
# Two sites behind one public IP: Caddy can also front an existing site on another LAN machine
#   --legacy http://192.168.1.50:80   proxy the root sslip.io domain to that existing site
#   --scan                            list LAN machines with a web server (to find that address)
# Options / env:  --domain D  (DOMAIN, default think.<ip>.sslip.io)   --repo URL  (REPO)   --branch B  (BRANCH)
#                 --pubkey "KEY"  adds an SSH public key to this user's authorized_keys
#                 --dir PATH  (APP_DIR, default /opt/think-asta)

set -Eeuo pipefail

REPO="${REPO:-https://github.com/sudxxt-afk/think-asta.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/opt/think-asta}"
DOMAIN="${DOMAIN:-}"
PUBKEY="${PUBKEY:-}"
LEGACY="${LEGACY:-}"
LEGACY_DOMAIN="${LEGACY_DOMAIN:-}"
SCAN=0
LOG="${LOG:-/tmp/think-asta-install.log}"

while [ $# -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="${2:?--domain needs a value}"; shift 2 ;;
    --repo) REPO="${2:?}"; shift 2 ;;
    --branch) BRANCH="${2:?}"; shift 2 ;;
    --pubkey) PUBKEY="${2:?}"; shift 2 ;;
    --dir) APP_DIR="${2:?}"; shift 2 ;;
    --legacy) LEGACY="${2:?--legacy needs http://host:port}"; shift 2 ;;
    --legacy-domain) LEGACY_DOMAIN="${2:?}"; shift 2 ;;
    --scan) SCAN=1; shift ;;
    -h|--help) sed -n '2,22p' "$0" 2>/dev/null || true; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

if [ -t 1 ]; then B=$'\033[1m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; N=$'\033[0m'; else B=; G=; Y=; R=; N=; fi
exec > >(tee -a "$LOG") 2>&1

step() { echo; echo "${B}==> $*${N}"; }
ok()   { echo "${G}ok${N} $*"; }
warn() { echo "${Y}!!${N} $*" >&2; }
die()  { echo "${R}ERROR:${N} $*" >&2; exit 1; }

STEP="start"
trap 'rc=$?; echo "${R}Failed at step \"$STEP\" (line $LINENO, exit $rc): $BASH_COMMAND${N}" >&2; echo "Full log: $LOG" >&2; exit $rc' ERR

# ---- LAN scan (no changes made) --------------------------------------------
if [ "$SCAN" = 1 ]; then
  me="$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -n1)"
  [ -n "$me" ] || me="$(hostname -I | awk '{print $1}')"
  base="${me%.*}"
  echo "Scanning $base.0/24 for web servers (ports 80, 443, 3000, 8000, 8080)..."
  hits="$(seq 1 254 | xargs -P 64 -I{} sh -c 'ip="'"$base"'.{}"; for p in 80 443 3000 8000 8080; do timeout 1 bash -c "echo >/dev/tcp/$ip/$p" 2>/dev/null && echo "$ip $p"; done' | sort -t. -k4 -n)"
  [ -n "$hits" ] || { echo "nothing found"; exit 0; }
  while read -r ip port; do
    scheme=http; [ "$port" = 443 ] && scheme=https
    title="$(curl -sk -m 4 "$scheme://$ip:$port/" 2>/dev/null | tr '\n' ' ' | sed -n 's/.*<title>\([^<]*\)<\/title>.*/\1/Ip' | head -c 70)"
    [ "$ip" = "$me" ] && who=" (this machine)" || who=""
    echo "$scheme://$ip:$port$who   ${title:-no title}"
  done <<< "$hits"
  echo
  echo "Pass the right one as:  --legacy http://IP:PORT"
  exit 0
fi

# ---- privileges ------------------------------------------------------------
if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
else
  command -v sudo >/dev/null || die "not root and sudo is missing: run as root or install sudo"
  if ! sudo -n true 2>/dev/null; then
    echo "sudo needs your password once; this keeps the ticket alive:"
    sudo -v || die "sudo is not available for $(id -un)"
  fi
  SUDO="sudo"
fi
# keep the sudo ticket fresh during long builds
if [ -n "$SUDO" ]; then ( while true; do sudo -n true; sleep 50; kill -0 "$$" 2>/dev/null || exit; done ) 2>/dev/null & fi

# ---- helpers ---------------------------------------------------------------
retry() { # retry N cmd...
  local n=$1 i=1; shift
  until "$@"; do
    [ "$i" -ge "$n" ] && return 1
    warn "attempt $i/$n failed: $*; retrying in $((i * 5))s"
    sleep $((i * 5)); i=$((i + 1))
  done
}
have() { command -v "$1" >/dev/null 2>&1; }
pm=""
if have apt-get; then pm=apt; elif have dnf; then pm=dnf; else die "only apt (Debian/Ubuntu) and dnf (Fedora/RHEL) systems are supported"; fi
pkg_install() {
  if [ "$pm" = apt ]; then
    $SUDO env DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "$@"
  else
    $SUDO dnf install -y "$@"
  fi
}
rc_http() { curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$@" 2>/dev/null || true; }

# ---- 1. base packages, Docker, swap ---------------------------------------
STEP="base packages"; step "Base packages"
[ "$pm" = apt ] && retry 3 $SUDO apt-get update -y
pkg_install git curl ca-certificates openssl iproute2 >/dev/null 2>&1 || pkg_install git curl ca-certificates openssl
ok "git, curl, openssl"

STEP="docker"; step "Docker"
if ! have docker || ! $SUDO docker compose version >/dev/null 2>&1; then
  if [ "$pm" = apt ]; then
    . /etc/os-release
    case "${ID:-}" in
      debian|ubuntu|raspbian) distro="${ID/raspbian/debian}" ;;
      *) distro="${ID_LIKE:-}"; distro="${distro%% *}" ;;
    esac
    codename="${VERSION_CODENAME:-$(. /etc/os-release; echo "${UBUNTU_CODENAME:-}")}"
    if [ -n "$codename" ] && [ -n "$distro" ]; then
      $SUDO install -m 0755 -d /etc/apt/keyrings
      retry 3 sh -c "curl -fsSL https://download.docker.com/linux/$distro/gpg | $SUDO tee /etc/apt/keyrings/docker.asc >/dev/null"
      $SUDO chmod a+r /etc/apt/keyrings/docker.asc
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$distro $codename stable" | $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null
      if $SUDO apt-get update -y && pkg_install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin; then
        :
      else
        warn "Docker's repository does not work for $distro $codename; falling back to the distro packages"
        $SUDO rm -f /etc/apt/sources.list.d/docker.list
        retry 3 $SUDO apt-get update -y
        pkg_install docker.io docker-compose-v2 || pkg_install docker.io docker-compose-plugin
      fi
    else
      pkg_install docker.io docker-compose-v2 || pkg_install docker.io docker-compose-plugin
    fi
  else
    $SUDO dnf -y install dnf-plugins-core >/dev/null 2>&1 || true
    $SUDO dnf config-manager addrepo --from-repofile=https://download.docker.com/linux/fedora/docker-ce.repo >/dev/null 2>&1 || true
    pkg_install docker-ce docker-ce-cli containerd.io docker-compose-plugin || pkg_install docker moby-engine docker-compose
  fi
fi
$SUDO systemctl enable --now docker
retry 5 $SUDO docker info >/dev/null 2>&1 || die "Docker daemon does not start; see: journalctl -u docker"
DC="$SUDO docker compose"
$DC version >/dev/null 2>&1 || die "docker compose plugin is missing"
ok "$($SUDO docker --version), $($DC version --short 2>/dev/null)"

STEP="swap"; step "Memory"
mem_mb=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
swap_mb=$(awk '/SwapTotal/ {print int($2/1024)}' /proc/meminfo)
echo "RAM ${mem_mb} MB, swap ${swap_mb} MB"
if [ "$mem_mb" -lt 3000 ] && [ "$swap_mb" -lt 1024 ]; then
  if [ ! -f /swapfile ]; then
    warn "low memory: adding 2 GB swap so the Next.js build does not get killed"
    ( $SUDO fallocate -l 2G /swapfile || $SUDO dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none ) \
      && $SUDO chmod 600 /swapfile && $SUDO mkswap /swapfile >/dev/null && $SUDO swapon /swapfile \
      && { grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | $SUDO tee -a /etc/fstab >/dev/null; } \
      && ok "swap enabled" || warn "could not enable swap, continuing"
  fi
fi

# ---- 2. replace nginx / apache with Caddy ----------------------------------
STEP="free ports"; step "Ports 80 and 443"
for svc in nginx apache2 httpd lighttpd caddy; do
  if systemctl list-unit-files "$svc.service" 2>/dev/null | grep -q "$svc.service"; then
    if systemctl is-active --quiet "$svc" || systemctl is-enabled --quiet "$svc" 2>/dev/null; then
      warn "$svc found: stopping and disabling (config is backed up, package is kept)"
      case "$svc" in
        nginx) [ -d /etc/nginx ] && $SUDO tar czf "/root/nginx-backup-$(date +%F-%H%M).tgz" /etc/nginx 2>/dev/null || true ;;
        apache2) [ -d /etc/apache2 ] && $SUDO tar czf "/root/apache2-backup-$(date +%F-%H%M).tgz" /etc/apache2 2>/dev/null || true ;;
      esac
      $SUDO systemctl disable --now "$svc" || warn "could not stop $svc"
    fi
  fi
done
busy() { $SUDO ss -ltnpH "sport = :$1" 2>/dev/null | grep -v docker-proxy | grep -v 'caddy' || true; }
# leftovers of a previous run of ours hold the ports legitimately
if [ -f "$APP_DIR/docker-compose.prod.yml" ]; then $DC -f "$APP_DIR/docker-compose.prod.yml" --env-file "$APP_DIR/.env.prod" stop caddy >/dev/null 2>&1 || true; fi
for port in 80 443; do
  if [ -n "$(busy "$port")" ]; then
    echo "$(busy "$port")"
    die "port $port is still taken by the process above; stop it and re-run"
  fi
done
ok "80 and 443 are free"

STEP="firewall"; step "Firewall"
if have ufw && $SUDO ufw status 2>/dev/null | grep -q "Status: active"; then
  $SUDO ufw allow 22/tcp >/dev/null; $SUDO ufw allow 80/tcp >/dev/null; $SUDO ufw allow 443/tcp >/dev/null; $SUDO ufw allow 443/udp >/dev/null
  ok "ufw: 22, 80, 443 allowed"
elif have firewall-cmd && $SUDO firewall-cmd --state >/dev/null 2>&1; then
  for s in ssh http https; do $SUDO firewall-cmd --permanent --add-service="$s" >/dev/null; done
  $SUDO firewall-cmd --permanent --add-port=443/udp >/dev/null; $SUDO firewall-cmd --reload >/dev/null
  ok "firewalld: ssh, http, https allowed"
else
  echo "no active host firewall"
fi

# ---- optional: SSH key -----------------------------------------------------
if [ -n "$PUBKEY" ]; then
  STEP="ssh key"; step "SSH key"
  case "$PUBKEY" in ssh-ed25519\ *|ssh-rsa\ *|ecdsa-sha2-*) ;; *) die "--pubkey does not look like a public key" ;; esac
  mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"
  touch "$HOME/.ssh/authorized_keys" && chmod 600 "$HOME/.ssh/authorized_keys"
  grep -qxF "$PUBKEY" "$HOME/.ssh/authorized_keys" || echo "$PUBKEY" >> "$HOME/.ssh/authorized_keys"
  ok "key present in $HOME/.ssh/authorized_keys"
fi

# ---- 3. public address -----------------------------------------------------
STEP="address"; step "Address"
PUBIP="$(curl -fsS --max-time 8 https://api.ipify.org 2>/dev/null || curl -fsS --max-time 8 https://ifconfig.me 2>/dev/null || true)"
LANIP="$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -n1 || true)"
[ -n "$PUBIP" ] || die "cannot detect the public IP (no internet?)"
[ -n "$DOMAIN" ] || DOMAIN="think.${PUBIP//./-}.sslip.io"
[ -n "$LEGACY_DOMAIN" ] || LEGACY_DOMAIN="${PUBIP//./-}.sslip.io"
echo "public IP: $PUBIP   local IP: ${LANIP:-?}   domain: $DOMAIN"
NAT=0; [ -n "$LANIP" ] && [ "$LANIP" != "$PUBIP" ] && NAT=1

# ---- 4. code ---------------------------------------------------------------
STEP="code"; step "Code"
$SUDO mkdir -p "$APP_DIR"; $SUDO chown "$(id -un)":"$(id -gn)" "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" remote set-url origin "$REPO"
  retry 3 git -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  [ -z "$(ls -A "$APP_DIR" 2>/dev/null)" ] || die "$APP_DIR is not empty and is not a git checkout"
  retry 3 git clone --depth 1 --branch "$BRANCH" "$REPO" "$APP_DIR"
fi
ok "$(git -C "$APP_DIR" log --oneline -n1)"
cd "$APP_DIR"

# ---- 5. environment --------------------------------------------------------
STEP="env"; step "Environment"
rnd() { head -c 256 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c "$1"; }
if [ ! -f .env.prod ]; then
  ( umask 077
    cat > .env.prod <<EOF
DB_PASSWORD=$(rnd 32)
SESSION_SECRET=$(rnd 48)
ADMIN_EMAIL=admin@think-asta.ru
ADMIN_PASSWORD=$(rnd 20)
DOMAIN=$DOMAIN
SITE_URL=https://$DOMAIN
BITRIX_WEBHOOK_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF
  )
  ok ".env.prod created with generated secrets"
else
  # keep secrets, only refresh the address
  sed -i -E "s|^DOMAIN=.*|DOMAIN=$DOMAIN|; s|^SITE_URL=.*|SITE_URL=https://$DOMAIN|" .env.prod
  ok ".env.prod kept (address refreshed)"
fi
for k in DB_PASSWORD SESSION_SECRET ADMIN_PASSWORD DOMAIN; do grep -q "^$k=." .env.prod || die ".env.prod is missing $k"; done

STEP="legacy site"; step "Existing site on the root domain"
mkdir -p deploy/conf.d
if [ -n "$LEGACY" ]; then
  case "$LEGACY" in http://*|https://*) ;; *) LEGACY="http://$LEGACY" ;; esac
  {
    printf '%s {\n\tencode zstd gzip\n' "$LEGACY_DOMAIN"
    case "$LEGACY" in
      https://*) printf '\treverse_proxy %s {\n\t\ttransport http {\n\t\t\ttls_insecure_skip_verify\n\t\t}\n\t}\n' "$LEGACY" ;;
      *) printf '\treverse_proxy %s\n' "$LEGACY" ;;
    esac
    printf '}\n'
  } > deploy/conf.d/legacy.caddy
  ok "$LEGACY_DOMAIN -> $LEGACY"
elif [ -f deploy/conf.d/legacy.caddy ]; then
  ok "keeping the existing deploy/conf.d/legacy.caddy"
else
  echo "none (add one with --legacy http://IP:PORT)"
fi

# ---- 6. build and start ----------------------------------------------------
STEP="images"; step "Pulling base images (retries, then registry mirrors if Docker Hub resets the connection)"
IMAGES="postgres:16-alpine caddy:2-alpine node:22-bookworm-slim"
pull_images() { local im; for im in $IMAGES; do retry 4 $SUDO docker pull "$im" || return 1; done; }
set_mirrors() {
  have python3 || pkg_install python3 >/dev/null 2>&1 || true
  have python3 || { warn "python3 is missing, cannot configure mirrors"; return 1; }
  $SUDO python3 - <<'PY'
import json, os
p = "/etc/docker/daemon.json"
d = json.load(open(p)) if os.path.exists(p) and os.path.getsize(p) else {}
m = d.get("registry-mirrors", [])
for x in ("https://mirror.gcr.io", "https://dockerhub.timeweb.cloud"):
    if x not in m:
        m.append(x)
d["registry-mirrors"] = m
d["max-concurrent-downloads"] = 2
json.dump(d, open(p, "w"), indent=2)
PY
  $SUDO systemctl restart docker
  retry 5 $SUDO docker info >/dev/null 2>&1
}
if ! pull_images; then
  warn "Docker Hub is unreliable from here: switching Docker to registry mirrors"
  set_mirrors || die "cannot configure registry mirrors"
  pull_images || die "images still cannot be pulled; check the server's internet access to Docker Hub / mirrors"
fi
ok "base images present"

STEP="compose build"; step "Build and start (the first build takes a few minutes)"
COMPOSE="$DC -f docker-compose.prod.yml --env-file .env.prod"
$COMPOSE config -q || die "docker-compose.prod.yml is invalid"
retry 2 $COMPOSE build
STEP="compose up"
retry 3 $COMPOSE up -d --remove-orphans
ok "stack started"
$COMPOSE ps

STEP="container network"; step "Internet access from containers (needed for the HTTPS certificate)"
net_ok() { $COMPOSE exec -T caddy sh -c 'nc -z -w 6 acme-v02.api.letsencrypt.org 443' >/dev/null 2>&1; }
net_diag() {
  echo "--- diagnostics ---"
  echo "host ip_forward: $(cat /proc/sys/net/ipv4/ip_forward)"
  echo "host resolv.conf:"; grep -v '^#' /etc/resolv.conf | head -n 5 || true
  echo "caddy container routes:"; $COMPOSE exec -T caddy ip route 2>&1 | head -n 8 || true
  echo "caddy container resolv.conf:"; $COMPOSE exec -T caddy cat /etc/resolv.conf 2>&1 | head -n 5 || true
  echo "docker networks:"; $SUDO docker network ls 2>&1 | head -n 8 || true
  echo "FORWARD chain:"; { $SUDO iptables -S FORWARD 2>/dev/null || $SUDO nft list chain ip filter FORWARD 2>/dev/null; } | head -n 12 || true
  echo "-------------------"
}
if ! net_ok; then
  warn "containers cannot reach the internet: applying the usual fixes"
  echo 'net.ipv4.ip_forward=1' | $SUDO tee /etc/sysctl.d/99-think-asta.conf >/dev/null
  $SUDO sysctl -p /etc/sysctl.d/99-think-asta.conf >/dev/null || $SUDO sysctl -w net.ipv4.ip_forward=1 >/dev/null
  $COMPOSE down --remove-orphans
  $SUDO docker network prune -f >/dev/null 2>&1 || true
  $SUDO systemctl restart docker
  retry 5 $SUDO docker info >/dev/null 2>&1
  retry 3 $COMPOSE up -d --remove-orphans
  sleep 8
  if net_ok; then ok "containers reach the internet now"; else net_diag; die "containers still have no internet access (see diagnostics above); send them to whoever maintains the server"; fi
else
  ok "containers have internet access"
fi

STEP="health"; step "Waiting for the app"
for i in $(seq 1 60); do
  st="$($COMPOSE ps --format '{{.Service}} {{.Health}} {{.State}}' app 2>/dev/null | head -n1)"
  case "$st" in *healthy*) ok "app is healthy"; break ;; esac
  case "$st" in *exited*|*dead*) $COMPOSE logs --tail 60 migrate app; die "app container stopped" ;; esac
  [ "$i" -eq 60 ] && { $COMPOSE logs --tail 80 migrate app; die "app did not become healthy in 5 minutes"; }
  sleep 5
done

STEP="https"; step "HTTPS (Caddy gets the certificate on the first request; can take up to ~2 minutes)"
code=000
for i in $(seq 1 24); do
  code="$(rc_http --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/")"
  [ "$code" = 200 ] && break
  sleep 5
done
if [ "$code" != 200 ]; then
  warn "no 200 from https://$DOMAIN yet (got $code). Caddy log:"
  $COMPOSE logs --tail 40 caddy || true
  echo
  warn "most common cause: ports 80/443 are not reachable from the internet."
fi
ext="$(rc_http "https://$DOMAIN/")"

# ---- 7. summary ------------------------------------------------------------
STEP="summary"
ADMIN_EMAIL="$(grep '^ADMIN_EMAIL=' .env.prod | cut -d= -f2-)"
ADMIN_PASSWORD="$(grep '^ADMIN_PASSWORD=' .env.prod | cut -d= -f2-)"
echo
echo "${B}------------------------------------------------------------${N}"
if [ "$ext" = 200 ]; then echo "${G}${B}Site is up:${N}  https://$DOMAIN"; else echo "${Y}${B}Site runs locally on the server, but is not reachable from outside yet:${N} https://$DOMAIN"; fi
echo "Admin:        https://$DOMAIN/admin"
[ -f deploy/conf.d/legacy.caddy ] && echo "Old site:     https://$LEGACY_DOMAIN   (proxied by Caddy, see deploy/conf.d/legacy.caddy)"
echo "Login:        $ADMIN_EMAIL"
echo "Password:     $ADMIN_PASSWORD   (stored in $APP_DIR/.env.prod)"
echo "Update later: re-run this script;  logs: cd $APP_DIR && $COMPOSE logs -f"
echo "Optional:     fill BITRIX_WEBHOOK_URL / TELEGRAM_* in $APP_DIR/.env.prod, then: $COMPOSE up -d"
if [ "$ext" != 200 ]; then
  echo
  echo "${Y}Not reachable from the internet. Check:${N}"
  if [ "$NAT" = 1 ]; then
    echo " - this machine is behind NAT (local $LANIP, public $PUBIP): on the router forward TCP 80 and 443 (and UDP 443) to $LANIP"
  fi
  echo " - the provider's firewall / security group allows TCP 80 and 443"
  echo " - sslip.io resolves:  getent hosts $DOMAIN"
  echo " - then re-run this script, or watch:  $COMPOSE logs -f caddy"
fi
echo "${B}------------------------------------------------------------${N}"
