import type { ReactNode } from "react";

// Мини-разметка для юридических текстов из админки:
// "## Заголовок" раздел (номер ставится сам), "- пункт" список, пустая строка между абзацами, [текст](ссылка), {{email}} подставляет значение из настроек.
export const DOC_VARS = ["legal_name", "legal_reg", "legal_address", "legal_date", "email", "phone", "address", "telegram"] as const;

const LINK = "underline decoration-accent decoration-[3px] underline-offset-4";

function inline(t: string, k: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(t))) {
    if (m.index > last) out.push(t.slice(last, m.index));
    out.push(<a key={`${k}${i++}`} href={m[2]} className={LINK}>{m[1]}</a>);
    last = m.index + m[0].length;
  }
  if (last < t.length) out.push(t.slice(last));
  return out;
}

export function fillVars(text: string, s: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => s[k] ?? "");
}

export function DocBody({ text, s }: { text: string; s: Record<string, string> }) {
  const blocks = fillVars(text, s).replace(/\r/g, "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  let n = 0;
  const sections: { h?: string; items: string[][] }[] = [];
  blocks.forEach((b) => {
    const lines = b.split("\n");
    if (lines[0].startsWith("## ")) { sections.push({ h: lines[0].slice(3).trim(), items: [] }); lines.shift(); }
    if (!sections.length) sections.push({ items: [] });
    if (lines.length) sections[sections.length - 1].items.push(lines);
  });
  return (
    <>
      {sections.map((sec, si) => (
        <section key={si} className="mt-10">
          {sec.h && <h2 className="t-h3">{++n}. {sec.h}</h2>}
          <div className="prose-x mt-3 space-y-3">
            {sec.items.map((lines, bi) =>
              lines.every((l) => l.startsWith("- ")) ? (
                <ul key={bi} className="list-disc space-y-1 pl-5">{lines.map((l, li) => <li key={li}>{inline(l.slice(2), `${si}${bi}${li}`)}</li>)}</ul>
              ) : (
                <p key={bi}>{inline(lines.join(" "), `${si}${bi}`)}</p>
              ),
            )}
          </div>
        </section>
      ))}
    </>
  );
}
