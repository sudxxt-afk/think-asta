"use client";
import { useState } from "react";
import { DocBody } from "@/lib/doc";
import { saveDoc } from "@/app/admin/actions";

export function DocEditor({ doc, title, initial, vars }: { doc: string; title: string; initial: string; vars: Record<string, string> }) {
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    if (text.trim() && !confirm("Заменить текст в редакторе стандартным?")) return;
    setBusy(true);
    try { setText(await (await fetch(`/admin/default/${doc}`)).text()); } finally { setBusy(false); }
  };
  return (
    <form action={saveDoc} className="grid gap-5 lg:grid-cols-2">
      <input type="hidden" name="doc" value={doc} />
      <div className="card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={load} disabled={busy} className="btn btn-ghost btn-sm">{busy ? "Загружаю…" : "Взять стандартный текст"}</button>
          <button type="button" onClick={() => confirm("Очистить поле? После сохранения на сайте вернётся стандартный текст.") && setText("")} className="btn btn-ghost btn-sm">Сбросить к стандартному</button>
        </div>
        <textarea name="text" value={text} onChange={(e) => setText(e.target.value)} spellCheck className="textarea !min-h-[34rem] font-mono text-[13px]" placeholder="Пусто: на сайте показывается стандартный текст." />
        <p className="text-xs text-ink-3">
          <code>## Заголовок</code> начинает раздел (номер ставится сам). <code>- пункт</code> делает список. Пустая строка разделяет абзацы. Ссылка: <code>[текст](/privacy)</code>. Подстановки: <code>{"{{email}} {{phone}} {{legal_name}} {{legal_reg}} {{legal_address}} {{legal_date}}"}</code>.
        </p>
        <div><button className="btn btn-primary">Сохранить</button></div>
      </div>
      <div className="card max-h-[44rem] overflow-y-auto p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Предпросмотр</div>
        <h2 className="t-h2 mt-2">{title}</h2>
        <p className="mt-2 text-sm font-semibold text-ink-2">Редакция от {vars.legal_date}</p>
        {text.trim() ? <DocBody text={text} s={vars} /> : <p className="t-body mt-6 text-sm">Поле пустое: на сайте стандартный текст. <a className="underline" href={`/${doc}`} target="_blank">Открыть на сайте ↗</a></p>}
      </div>
    </form>
  );
}
