"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Link2, RotateCcw } from "lucide-react";
import { CORES, GROUPS, MODULES, PRESETS, flow, tips, type Core } from "./model";
import { Diagram } from "./Diagram";
import "./configurator.css";

export function Configurator({ initialCore, initialMods }: { initialCore: Core; initialMods: string[] }) {
  const [core, setCore] = useState<Core>(initialCore);
  const [mods, setMods] = useState<string[]>(initialMods);
  const [copied, setCopied] = useState(false);
  const on = useMemo(() => new Set(mods), [mods]);

  // Keep the scheme in the URL so it can be shared or sent with the request
  useEffect(() => {
    const q = new URLSearchParams({ core, m: mods.join(",") });
    window.history.replaceState(null, "", `?${q}`);
  }, [core, mods]);

  const toggle = (id: string) => {
    if (id.startsWith("core:")) return setCore(id.slice(5) as Core);
    setMods((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  };
  const preset = PRESETS.find((p) => p.core === core && p.mods.length === mods.length && p.mods.every((x) => on.has(x)));

  const steps = flow(core, on);
  const advice = tips(core, on);
  const chosen = [CORES.find((c) => c.id === core)!, ...MODULES.filter((m) => on.has(m.id))].filter((x) => x.id !== "none");
  const links = MODULES.filter((m) => m.col === "in" && on.has(m.id)).length + (on.has("ai") ? 1 : 0) + (core === "none" ? 0 : MODULES.filter((m) => m.col === "out" && on.has(m.id)).length);
  const auto = ["ai", "robots", "notify", "pay", "onec", "stock"].filter((x) => on.has(x) && (x === "ai" || core !== "none")).length + (core === "none" ? 0 : 1);
  const scheme = chosen.map((x) => x.label).join(", ");

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  return (
    <div className="cfg">
      <div className="cfg-presets">
        <span className="mr-1 shrink-0 text-sm font-extrabold">Готовые схемы:</span>
        {PRESETS.map((p) => (
          <button key={p.name} type="button" className="cfg-chip" data-on={preset?.name === p.name || undefined} onClick={() => { setCore(p.core); setMods(p.mods); }}>{p.name}</button>
        ))}
        <button type="button" className="cfg-chip cfg-chip-ghost" onClick={() => { setCore("none"); setMods([]); }}><RotateCcw size={14} /> С нуля</button>
      </div>

      <div className="cfg-grid mt-6">
        <aside className="cfg-panel">
          <fieldset>
            <legend className="cfg-legend">Ядро системы</legend>
            <div className="grid gap-2">
              {CORES.map((c) => (
                <button key={c.id} type="button" role="radio" aria-checked={core === c.id} className="cfg-opt" data-on={core === c.id || undefined} onClick={() => setCore(c.id)}>
                  <span className="cfg-radio" /><span className="cfg-opt-t"><b>{c.label}</b><small>{c.sub}</small></span>
                </button>
              ))}
            </div>
          </fieldset>
          {GROUPS.map((g) => (
            <fieldset key={g}>
              <legend className="cfg-legend">{g}</legend>
              <div className="grid grid-cols-2 gap-2">
                {MODULES.filter((m) => m.group === g).map((m) => {
                  const Icon = m.icon;
                  const off = core === "none" && m.col === "out";
                  return (
                    <button key={m.id} type="button" role="checkbox" aria-checked={on.has(m.id)} className="cfg-tog" data-on={on.has(m.id) || undefined} data-off={off || undefined} onClick={() => toggle(m.id)} title={off ? "Работает, когда есть ядро системы" : undefined}>
                      <span className="cfg-box">{on.has(m.id) ? <Check size={14} strokeWidth={3} /> : <Icon size={15} strokeWidth={2.3} />}</span>
                      <b>{m.label}</b>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </aside>

          <div className="cfg-plate">
            <div className="cfg-plate-head">
              <span className="chip">Ваша система</span>
              <div className="cfg-stats">
                <span><b>{chosen.length}</b> модулей</span>
                <span><b>{links}</b> связей</span>
                <span><b>{auto}</b> шагов без ручной работы</span>
              </div>
            </div>
            <Diagram core={core} on={on} />
          </div>

          <div className="cfg-result grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="card p-6">
              <h2 className="t-h3">Как пойдёт заявка</h2>
              <ol className="cfg-flow mt-4">
                {steps.map((t, i) => <li key={t} style={{ animationDelay: `${i * 60}ms` }}><span>{i + 1}</span>{t}</li>)}
              </ol>
            </div>
            <div className="grid content-start gap-4">
              {advice.map((a) => (
                <div key={a.text} className="cfg-tip">
                  <p>{a.text}</p>
                  <button type="button" onClick={() => toggle(a.add)}>{a.label} +</button>
                </div>
              ))}
              <div className="card !bg-ink p-6 text-white">
                <p className="font-display text-lg font-extrabold leading-snug">Соберём это под ваш бизнес</p>
                <p className="mt-2 text-sm text-white/70">Отправьте схему, и на созвоне разберём, что запускать первым.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/contacts?scheme=${encodeURIComponent(scheme)}#form`} className="btn btn-primary">Обсудить эту схему <ArrowRight size={18} /></Link>
                  <button type="button" onClick={share} className="btn cfg-btn-line">{copied ? <><Check size={16} /> Ссылка скопирована</> : <><Link2 size={16} /> Ссылка на схему</>}</button>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
