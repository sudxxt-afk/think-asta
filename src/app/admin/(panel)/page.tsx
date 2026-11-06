import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, FilePlus2, FolderPlus, Inbox, Minus, Settings2, TrendingDown, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings, SETTING_DEFAULTS } from "@/lib/settings";
import { PageHead } from "@/components/admin/PageHead";
import { STATUSES, ago, avaColor, initials, sourceLabel, waitHours } from "@/components/admin/lead-utils";
import { setLeadStatus } from "../actions";

export const dynamic = "force-dynamic";

const DAY = 864e5;
const plural = (n: number, [one, few, many]: [string, string, string]) => {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
};

function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev && !now) return <span className="adm-delta" data-dir="flat"><Minus size={11} />0</span>;
  const d = prev ? Math.round(((now - prev) / prev) * 100) : 100;
  const dir = d > 0 ? "up" : d < 0 ? "down" : "flat";
  const I = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
  return <span className="adm-delta" data-dir={dir}><I size={11} />{d > 0 ? "+" : ""}{d}%</span>;
}

export default async function Dashboard() {
  const now = Date.now();
  const since30 = new Date(now - 30 * DAY);
  const [leads, visits, projects, posts, s] = await Promise.all([
    db.lead.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, contact: true, service: true, status: true, source: true, createdAt: true } }),
    db.visit.findMany({ where: { createdAt: { gte: since30 } }, select: { createdAt: true, newVisitor: true } }),
    db.project.findMany({ select: { published: true, inCarousel: true, cover: true } }),
    db.post.findMany({ select: { published: true } }),
    getSettings(),
  ]);

  const inRange = (d: Date, from: number, to: number) => d.getTime() >= now - from * DAY && d.getTime() < now - to * DAY;
  const leads7 = leads.filter((l) => inRange(l.createdAt, 7, 0)).length;
  const leadsPrev = leads.filter((l) => inRange(l.createdAt, 14, 7)).length;
  const vis7 = visits.filter((v) => v.newVisitor && inRange(v.createdAt, 7, 0)).length;
  const visPrev = visits.filter((v) => v.newVisitor && inRange(v.createdAt, 14, 7)).length;
  const leads30 = leads.filter((l) => inRange(l.createdAt, 30, 0));
  const vis30 = visits.filter((v) => v.newVisitor).length;
  const waiting = leads.filter((l) => l.status === "new");
  const overdue = waiting.filter((l) => waitHours(l.createdAt, now) >= 24).length;

  const funnel = STATUSES.map((st) => ({ ...st, n: leads.filter((l) => (l.status || "new") === st.key).length }));
  const closed = funnel[2].n + funnel[3].n;

  const days = Array.from({ length: 14 }, (_, i) => {
    const start = new Date(now - (13 - i) * DAY); start.setHours(0, 0, 0, 0);
    const end = start.getTime() + DAY;
    const within = (d: Date) => d.getTime() >= start.getTime() && d.getTime() < end;
    return { d: start, leads: leads.filter((l) => within(l.createdAt)).length, visits: visits.filter((v) => within(v.createdAt)).length };
  });
  const maxV = Math.max(1, ...days.map((d) => d.visits));
  
  const bySrc = new Map<string, number>();
  leads30.forEach((l) => bySrc.set(l.source, (bySrc.get(l.source) ?? 0) + 1));
  const topSrc = [...bySrc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxSrc = Math.max(1, ...topSrc.map(([, n]) => n));

  const noCover = projects.filter((p) => p.published && !p.cover).length;
  const checks: { ok: boolean; text: string; hint: string; href: string }[] = [
    { ok: s.phone !== SETTING_DEFAULTS.phone.value, text: "Настоящий телефон", hint: "Сейчас стоит заглушка +7 (900) 000-00-00", href: "/admin/settings#phone" },
    { ok: !!s.legal_reg, text: "ИНН или ОГРНИП оператора", hint: "Нужен в политике конфиденциальности по 152-ФЗ", href: "/admin/settings#legal_reg" },
    { ok: !!s.legal_address, text: "Адрес для обращений", hint: "Куда писать по вопросам персональных данных", href: "/admin/settings#legal_address" },
    { ok: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID), text: "Уведомления о заявках в Telegram", hint: "Переменные TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID", href: "/admin/leads" },
    { ok: !!(process.env.YM_ID || process.env.GA_ID), text: "Яндекс Метрика или Google Analytics", hint: "Переменные YM_ID или GA_ID", href: "/admin/stats" },
    { ok: !!process.env.SITE_URL && !process.env.SITE_URL.includes("localhost"), text: "Адрес сайта для SEO", hint: "Переменная SITE_URL: от неё строятся sitemap и canonical", href: "/admin/settings" },
    { ok: noCover === 0, text: "Обложки у опубликованных проектов", hint: noCover ? `Без обложки: ${noCover}. Вместо неё рисуется заглушка` : "", href: "/admin/projects" },
  ];
  const okCount = checks.filter((c) => c.ok).length;
  const hour = new Date().getHours();
  const hello = hour < 5 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
  const today = new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <PageHead title={hello} text={<>{today[0].toUpperCase() + today.slice(1)}. {waiting.length ? `${waiting.length} ${plural(waiting.length, ["заявка ждёт", "заявки ждут", "заявок ждут"])} ответа${overdue ? `, из них ${overdue} дольше суток` : ""}.` : "Все заявки разобраны."}</>}>
        <Link href="/admin/projects/new" className="adm-btn"><FolderPlus size={15} />Проект</Link>
        <Link href="/admin/posts/new" className="adm-btn"><FilePlus2 size={15} />Статья</Link>
        <Link href="/" target="_blank" className="adm-btn adm-btn-dark"><ArrowUpRight size={15} />Сайт</Link>
      </PageHead>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link href="/admin/leads" className="adm-kpi" data-hot={waiting.length > 0 || undefined}>
          <span className="adm-kpi-label"><Inbox size={14} />Ждут ответа</span>
          <span className="adm-kpi-value">{waiting.length}</span>
          <span className="adm-kpi-foot">{overdue ? `${overdue} дольше суток` : "все свежие"}</span>
        </Link>
        <Link href="/admin/leads" className="adm-kpi">
          <span className="adm-kpi-label">Заявки за 7 дней</span>
          <span className="adm-kpi-value">{leads7}</span>
          <span className="adm-kpi-foot"><Delta now={leads7} prev={leadsPrev} /> к прошлой неделе</span>
        </Link>
        <Link href="/admin/stats" className="adm-kpi">
          <span className="adm-kpi-label">Посетители за 7 дней</span>
          <span className="adm-kpi-value">{vis7}</span>
          <span className="adm-kpi-foot"><Delta now={vis7} prev={visPrev} /> принявшие cookie</span>
        </Link>
        <Link href="/admin/stats" className="adm-kpi">
          <span className="adm-kpi-label">Конверсия, 30 дней</span>
          <span className="adm-kpi-value">{vis30 ? `${Math.round((leads30.length / vis30) * 1000) / 10}%` : "—"}</span>
          <span className="adm-kpi-foot">{leads30.length} заявок на {vis30} посетителей</span>
        </Link>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <section className="adm-panel">
          <div className="adm-panel-h"><h2>Ждут ответа</h2><Link href="/admin/leads">Все заявки →</Link></div>
          {waiting.length === 0 ? (
            <p className="py-6 text-center text-sm adm-muted">Новых заявок нет. Хороший момент обновить кейсы.</p>
          ) : (
            <ul>
              {waiting.slice(0, 5).map((l) => {
                const late = waitHours(l.createdAt, now) >= 24;
                return (
                  <li key={l.id} className="adm-row">
                    <span className="kb-ava" style={{ background: avaColor(l.name) }} aria-hidden>{initials(l.name)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold">{l.name}</div>
                      <div className="kb-meta truncate">{l.contact}{l.service ? ` · ${l.service}` : ""}</div>
                    </div>
                    <span className="kb-tag" data-warn={late || undefined}>{ago(l.createdAt, now)}</span>
                    <form action={setLeadStatus.bind(null, l.id, "work")}><button className="adm-btn adm-btn-accent">В работу<ArrowRight size={14} /></button></form>
                  </li>
                );
              })}
              {waiting.length > 5 && <li className="pt-3 text-sm font-semibold adm-muted">и ещё {waiting.length - 5}</li>}
            </ul>
          )}
        </section>

        <section className="adm-panel">
          <div className="adm-panel-h"><h2>Воронка</h2><span className="text-xs font-bold adm-muted">{leads.length} всего</span></div>
          <ul className="space-y-3.5">
            {funnel.map((f) => (
              <li key={f.key} data-st={f.key}>
                <div className="mb-1.5 flex items-center gap-2 text-sm font-bold"><i className="adm-dot" />{f.label}<span className="ml-auto">{f.n}</span></div>
                <div className="adm-bar"><i style={{ width: `${leads.length ? (f.n / leads.length) * 100 : 0}%` }} /></div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-semibold adm-muted">Доля успешных среди закрытых: {closed ? `${Math.round((funnel[2].n / closed) * 100)}%` : "—"}</p>
        </section>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <section className="adm-panel">
          <div className="adm-panel-h">
            <h2>Две недели</h2>
            <div className="flex gap-3 text-xs font-bold adm-muted"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[#d6d6cd]" />просмотры</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent" />заявки</span></div>
          </div>
          <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Просмотры и заявки по дням за 14 дней">
            {days.map((d) => (
              <div key={d.d.toISOString()} className="group relative flex h-full flex-1 flex-col items-center justify-end" title={`${d.d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}: ${d.visits} просмотров, ${d.leads} заявок`}>
                {d.leads > 0 && <span className="mb-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-extrabold">{d.leads}</span>}
                <div className="w-full max-w-7 rounded-[5px] bg-[#e4e4dc] transition-colors group-hover:bg-ink" style={{ height: `${Math.max(3, (d.visits / maxV) * 78)}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-bold adm-muted">
            <span>{days[0].d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span><span>сегодня</span>
          </div>
        </section>

        <section className="adm-panel">
          <div className="adm-panel-h"><h2>Откуда заявки</h2><Link href="/admin/stats">Подробно →</Link></div>
          {topSrc.length === 0 ? <p className="py-6 text-center text-sm adm-muted">За 30 дней заявок не было.</p> : (
            <ul className="space-y-3">
              {topSrc.map(([k, n]) => (
                <li key={k || "—"}>
                  <div className="mb-1 flex justify-between text-sm font-bold"><span>{sourceLabel(k)}</span><span>{n}</span></div>
                  <div className="adm-bar"><i style={{ width: `${(n / maxSrc) * 100}%`, background: "var(--color-ink)" }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <section className="adm-panel">
          <div className="adm-panel-h"><h2>Перед запуском</h2><span className="text-xs font-bold adm-muted">{okCount} из {checks.length}</span></div>
          <div className="adm-bar mb-3" data-st="done"><i style={{ width: `${(okCount / checks.length) * 100}%` }} /></div>
          <ul>
            {[...checks].sort((a, b) => Number(a.ok) - Number(b.ok)).map((c) => (
              <li key={c.text} className="adm-check" data-ok={c.ok || undefined}>
                <span className="ic">{c.ok ? <Check size={13} strokeWidth={3} /> : <b className="text-xs">!</b>}</span>
                <div className="min-w-0 flex-1"><div className="font-bold">{c.text}</div>{!c.ok && c.hint && <div className="text-xs adm-muted">{c.hint}</div>}</div>
                {!c.ok && <Link href={c.href} className="adm-btn">Исправить</Link>}
              </li>
            ))}
          </ul>
        </section>

        <section className="adm-panel">
          <div className="adm-panel-h"><h2>Контент</h2><Link href="/admin/content"><Settings2 size={14} className="inline" /> Изменить</Link></div>
          <div className="grid grid-cols-2 gap-3">
            {([
              ["Проектов на сайте", projects.filter((p) => p.published).length, "/admin/projects"],
              ["В карусели", projects.filter((p) => p.published && p.inCarousel).length, "/admin/projects"],
              ["Статей", posts.filter((p) => p.published).length, "/admin/posts"],
              ["Черновиков", posts.filter((p) => !p.published).length + projects.filter((p) => !p.published).length, "/admin/posts"],
            ] as const).map(([l, n, h]) => (
              <Link key={l} href={h} className="rounded-[12px] bg-[var(--adm-bg)] p-3 transition-colors hover:bg-[#ebebe4]">
                <div className="font-display text-2xl font-bold tracking-tight">{n}</div>
                <div className="text-xs font-bold adm-muted">{l}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
