#!/usr/bin/env bash
# Usage: deploy/deploy.sh user@host [domain]
# Ships the source to /opt/think-asta, replaces nginx/apache with Caddy (in compose), brings the stack up.
# First run also creates .env.prod with generated secrets on the server and loads local site content.
set -euo pipefail
TARGET="${1:?user@host}"
HOST="${TARGET#*@}"
DOMAIN="${2:-${HOST//./-}.sslip.io}"
DIR=/opt/think-asta
SUDO=""; [ "${TARGET%@*}" = root ] || SUDO="sudo"
ssh_() { ssh -o BatchMode=yes "$TARGET" "$@"; }

echo ">> server prep"
ssh_ "$SUDO bash -s" <<'REMOTE'
set -e
export DEBIAN_FRONTEND=noninteractive
if ! command -v docker >/dev/null || ! docker compose version >/dev/null 2>&1; then
  apt-get update -y && apt-get install -y docker.io docker-compose-v2 rsync || apt-get install -y docker.io docker-compose-plugin rsync
fi
command -v rsync >/dev/null || apt-get install -y rsync
systemctl enable --now docker
for s in nginx apache2 httpd; do
  if systemctl list-unit-files 2>/dev/null | grep -q "^$s.service"; then systemctl disable --now "$s" || true; fi
done
mkdir -p /opt/think-asta
REMOTE
ssh_ "$SUDO chown -R \$(id -un) $DIR"

echo ">> sync source"
rsync -az --delete --exclude node_modules --exclude .next --exclude .git --exclude .env --exclude '.env.*' --exclude uploads --exclude .agents --exclude .claude ./ "$TARGET:$DIR/"

echo ">> env"
ssh_ "cd $DIR && [ -f .env.prod ] || { 
  umask 077
  r() { head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c \$1; }
  printf 'DB_PASSWORD=%s\nSESSION_SECRET=%s\nADMIN_EMAIL=admin@think-asta.ru\nADMIN_PASSWORD=%s\nDOMAIN=$DOMAIN\nSITE_URL=https://$DOMAIN\n' \"\$(r 32)\" \"\$(r 48)\" \"\$(r 20)\" > .env.prod
  echo created
}"

echo ">> up"
ssh_ "cd $DIR && $SUDO docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build --remove-orphans"
ssh_ "cd $DIR && $SUDO docker compose -f docker-compose.prod.yml --env-file .env.prod ps"
echo ">> https://$DOMAIN"
