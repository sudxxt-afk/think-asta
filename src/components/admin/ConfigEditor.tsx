"use client";
import { useState } from "react";
import { saveConfigurator, resetConfigurator } from "@/app/admin/actions";
import { CORES, GROUPS, MODULES as BASE, PRESETS as BASE_PRESETS, type ConfigOverride, type Core } from "@/components/configurator/model";

type Preset = { name: string; core: Core; mods: string[] };

export function ConfigEditor({ initial }: { initial: ConfigOverride | null }) {
  const [hidden, setHidden] = useState<string[]>(initial?.hidden ?? []);
  const [mods, setMods] = useState<Record<string, { label?: string; sub?: string }>>(initial?.mods ?? {});
  const [presets, setPresets] = useState<Preset[]>(initial?.presets?.length ? initial.presets : BASE_PRESETS.map((p) => ({ ...p, mods: [...p.mods] })));

  const shown = BASE.filter((m) => !hidden.includes(m.id));
  const config: ConfigOverride = { hidden, mods, presets };
  const setMod = (id: string, k: "label" | "sub", v: string) => setMods((o) => ({ ...o, [id]: { ...o[id], [k]: v } }));
  const setPreset = (i: number, p: Partial<Preset>) => setPresets((ps) => ps.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  return (
    <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
      <form action={saveConfigurator} className="space-y-5">
        <input type="hidden" name="config" value={JSON.stringify(config)} />
        <section className="card p-5">
          <h2 className="t-h3">Блоки</h2>
          <p className="mt-1 text-xs text-ink-3">Галочка показывает блок в конфигураторе. Подписи можно переписать.</p>
          {GROUPS.map((g) => (
            <div key={g} className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">{g}</div>
              <ul className="mt-2 space-y-2">
                {BASE.filter((m) => m.group === g).map((m) => (
                  <li key={m.id} className={`grid grid-cols-[auto_1fr_1.4fr] items-center gap-2 ${hidden.includes(m.id) ? "opacity-50" : ""}`}>
                    <input type="checkbox" checked={!hidden.includes(m.id)} onChange={() => setHidden((h) => toggle(h, m.id))} aria-label={`Показывать ${m.label}`} />
                    <input className="input !h-9" value={mods[m.id]?.label ?? ""} placeholder={m.label} onChange={(e) => setMod(m.id, "label", e.target.value)} />
                    <input className="input !h-9" value={mods[m.id]?.sub ?? ""} placeholder={m.sub} onChange={(e) => setMod(m.id, "sub", e.target.value)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
        <section className="card p-5">
          <div className="flex items-center justify-between"><h2 className="t-h3">Готовые схемы</h2><button type="button" className="btn btn-ghost btn-sm" onClick={() => setPresets((p) => [...p, { name: "Новая схема", core: "crm", mods: ["site", "notify"] }])}>Добавить</button></div>
          <ul className="mt-3 space-y-4">
            {presets.map((p, i) => (
              <li key={i} className="rounded-[var(--radius-sm)] border border-line p-3">
                <div className="flex gap-2">
                  <input className="input !h-9 flex-1" value={p.name} onChange={(e) => setPreset(i, { name: e.target.value })} />
                  <select className="select !h-9" value={p.core} onChange={(e) => setPreset(i, { core: e.target.value as Core })}>{CORES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
                  <button type="button" className="text-xs text-ink-3 hover:text-ink" onClick={() => setPresets((ps) => ps.filter((_, j) => j !== i))}>Удалить</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {shown.map((m) => <button type="button" key={m.id} onClick={() => setPreset(i, { mods: toggle(p.mods, m.id) })} className={`chip cursor-pointer ${p.mods.includes(m.id) ? "chip-accent" : ""}`}>{mods[m.id]?.label || m.label}</button>)}
                </div>
              </li>
            ))}
          </ul>
        </section>
        <div className="flex gap-3">
          <button className="btn btn-primary">Сохранить</button>
          <button type="submit" formAction={resetConfigurator} className="btn btn-ghost" onClick={(e) => { if (!confirm("Вернуть стандартные блоки и схемы?")) e.preventDefault(); }}>Сбросить к стандартным</button>
        </div>
      </form>

      <aside className="card h-fit p-5 lg:sticky lg:top-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Предпросмотр</div>
        <div className="mt-3 space-y-3">
          {GROUPS.map((g) => {
            const list = shown.filter((m) => m.group === g);
            return list.length ? (
              <div key={g}>
                <div className="text-xs font-bold">{g}</div>
                <div className="mt-1 grid gap-1.5">
                  {list.map((m) => <div key={m.id} className="rounded-[10px] border-2 border-ink px-3 py-1.5 text-sm"><b>{mods[m.id]?.label || m.label}</b><span className="block text-xs text-ink-2">{mods[m.id]?.sub || m.sub}</span></div>)}
                </div>
              </div>
            ) : null;
          })}
          <div>
            <div className="text-xs font-bold">Готовые схемы</div>
            <div className="mt-1 flex flex-wrap gap-1.5">{presets.map((p, i) => <span key={i} className="chip chip-accent" title={p.mods.filter((x) => shown.some((m) => m.id === x)).length + " блоков"}>{p.name}</span>)}</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
