import { getSettings, SETTING_DEFAULTS } from "@/lib/settings";
import { PageHead } from "@/components/admin/PageHead";
import { saveSettings } from "../../actions";

export const dynamic = "force-dynamic";

const GROUPS: { id: string; title: string; text: string; keys: (k: string) => boolean; cols?: boolean }[] = [
  { id: "main", title: "Главная и «О нас»", text: "Заголовок первого экрана и тексты страниц", keys: (k) => ["hero_title", "hero_text", "about_text", "cost_text"].includes(k) },
  { id: "contacts", title: "Контакты", text: "Показываются в шапке, подвале, на странице контактов и в разметке для поисковиков", keys: (k) => ["phone", "email", "telegram", "address", "hours"].includes(k), cols: true },
  { id: "seo", title: "SEO главной", text: "Как сайт выглядит в выдаче Яндекса и Google", keys: (k) => k.startsWith("seo_") },
  { id: "legal", title: "Юридические данные", text: "Подставляются в политику, согласие и подвал сайта", keys: (k) => k.startsWith("legal_"), cols: true },
];

export default async function Settings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [s, q] = await Promise.all([getSettings(), searchParams]);
  const entries = Object.entries(SETTING_DEFAULTS);
  return (
    <>
      <PageHead title="Тексты и контакты" text="Всё, что меняется без программиста. Сохраняется сразу для всего сайта.">
        <nav className="adm-tabs !mb-0">{GROUPS.map((g) => <a key={g.id} href={`#${g.id}`}>{g.title}</a>)}</nav>
      </PageHead>
      <form action={saveSettings}>
        {GROUPS.map((g) => (
          <section key={g.id} id={g.id} className="adm-panel adm-group">
            <div className="mb-5"><h2 className="text-base font-extrabold">{g.title}</h2><p className="text-sm adm-muted">{g.text}</p></div>
            <div className="adm-fields" data-cols={g.cols || undefined}>
              {entries.filter(([k]) => g.keys(k)).map(([k, d]) => (
                <div key={k} className="field" data-long={d.long || undefined}>
                  <label htmlFor={k}>{((l) => l[0].toUpperCase() + l.slice(1))(d.label.replace(/^(Юр\.|SEO): /, ""))}</label>
                  {d.long ? <textarea id={k} name={k} className="textarea !min-h-32" defaultValue={s[k]} /> : <input id={k} name={k} className="input" defaultValue={s[k]} />}
                  {d.hint && <small>{d.hint}</small>}
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="adm-savebar">
          <span>{q.saved ? "Сохранено. Изменения уже на сайте." : "Изменения появятся на сайте сразу после сохранения."}</span>
          <button className="adm-btn adm-btn-accent">Сохранить</button>
        </div>
      </form>
    </>
  );
}
