import { db } from "@/lib/db";
import { PageHead } from "@/components/admin/PageHead";
import { sourceLabel } from "@/components/admin/lead-utils";

export const dynamic = "force-dynamic";

const DAYS = 30;
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10}%` : "—");

export default async function Stats() {
  const since = new Date(Date.now() - DAYS * 864e5);
  const [visits, leads, consents] = await Promise.all([
    db.visit.findMany({ where: { createdAt: { gte: since } }, select: { path: true, source: true, device: true, newVisitor: true, createdAt: true } }),
    db.lead.findMany({ where: { createdAt: { gte: since } }, select: { source: true, consentAt: true } }),
    db.consentEvent.findMany({ where: { createdAt: { gte: since } }, select: { choice: true } }),
  ]);

  const day = (d: Date) => d.toISOString().slice(0, 10);
  const perDay = new Map<string, number>();
  for (let i = DAYS - 1; i >= 0; i--) perDay.set(day(new Date(Date.now() - i * 864e5)), 0);
  visits.forEach((v) => perDay.set(day(v.createdAt), (perDay.get(day(v.createdAt)) ?? 0) + 1));
  const max = Math.max(1, ...perDay.values());

  const label = (s: string) => sourceLabel(s);
  const src = new Map<string, { visitors: number; views: number; leads: number }>();
  const row = (k: string) => src.get(k) ?? src.set(k, { visitors: 0, views: 0, leads: 0 }).get(k)!;
  visits.forEach((v) => { const r = row(label(v.source)); r.views++; if (v.newVisitor) r.visitors++; });
  leads.forEach((l) => { row(label(l.source)).leads++; });
  const sources = [...src.entries()].sort((a, b) => b[1].leads - a[1].leads || b[1].views - a[1].views);

  const pages = new Map<string, number>();
  visits.forEach((v) => pages.set(v.path, (pages.get(v.path) ?? 0) + 1));
  const top = [...pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const mobile = visits.filter((v) => v.device === "mobile").length;
  const newV = visits.filter((v) => v.newVisitor).length;
  const yes = consents.filter((c) => c.choice === "all").length;
  const no = consents.length - yes;
  const withConsent = leads.filter((l) => l.consentAt).length;

  const kpi: [string, string | number, string?][] = [
    ["Просмотры", visits.length, "только от принявших cookie"],
    ["Новые посетители", newV],
    ["Заявки", leads.length, `конверсия ${pct(leads.length, newV)}`],
    ["Приняли cookie", pct(yes, consents.length), `${yes} из ${consents.length}`],
  ];

  return (
    <>
      <PageHead title="Статистика" text={<>За {DAYS} дней. Считаются только посетители, которые приняли аналитические cookie: остальных мы не отслеживаем по закону, поэтому реальный трафик больше. Заявки считаются все.</>} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpi.map(([l, n, h]) => <div key={l} className="adm-kpi"><span className="adm-kpi-label">{l}</span><span className="adm-kpi-value">{n}</span>{h && <span className="adm-kpi-foot">{h}</span>}</div>)}
      </div>

      <section className="adm-panel mt-3">
        <h2 className="t-h3">Просмотры по дням</h2>
        <div className="mt-4 flex h-32 items-end gap-[3px]" role="img" aria-label="График просмотров по дням">
          {[...perDay.entries()].map(([d, n]) => (
            <div key={d} title={`${d}: ${n}`} className="flex-1 rounded-t-[3px] bg-ink" style={{ height: `${Math.max(n ? 4 : 1, (n / max) * 100)}%`, opacity: n ? 1 : 0.25 }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-ink-3"><span>{[...perDay.keys()][0].slice(5)}</span><span>сегодня</span></div>
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-[3fr_2fr]">
        <section className="adm-panel">
          <h2 className="t-h3">Источники заявок</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-ink-3"><tr><th className="py-2 font-semibold">Источник</th><th>Посетители</th><th>Заявки</th><th>Конверсия</th></tr></thead>
              <tbody>
                {sources.length === 0 && <tr><td colSpan={4} className="py-4 text-ink-3">Данных пока нет.</td></tr>}
                {sources.map(([k, r]) => (
                  <tr key={k} className="border-t border-line"><td className="py-2 font-semibold">{k}</td><td>{r.visitors}</td><td>{r.leads}</td><td>{pct(r.leads, r.visitors)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-3">«Не определён»: заявки от тех, кто не принимал cookie или пришёл до включения учёта. Метки UTM (utm_source, utm_medium, utm_campaign) подхватываются автоматически.</p>
        </section>

        <div className="space-y-3">
          <section className="adm-panel">
            <h2 className="t-h3">Согласие на cookie</h2>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-sunken"><div className="bg-accent" style={{ width: pct(yes, consents.length) === "—" ? 0 : `${(yes / consents.length) * 100}%` }} /></div>
            <p className="mt-2 text-sm">Принять: {yes} · Только необходимые: {no}</p>
            <p className="mt-1 text-xs text-ink-3">Заявок с записанным временем согласия: {withConsent} из {leads.length}.</p>
          </section>
          <section className="adm-panel">
            <h2 className="t-h3">Популярные страницы</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {top.length === 0 && <li className="text-ink-3">Данных пока нет.</li>}
              {top.map(([p, n]) => <li key={p} className="flex justify-between gap-3"><span className="truncate">{p}</span><b>{n}</b></li>)}
            </ul>
            <p className="mt-3 text-xs text-ink-3">С телефона: {pct(mobile, visits.length)}</p>
          </section>
        </div>
      </div>
    </>
  );
}
