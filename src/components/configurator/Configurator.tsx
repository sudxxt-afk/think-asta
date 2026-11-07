"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Check, Link2, Play, RotateCcw, Send, Square } from "lucide-react";
import { CORES, GOALS, GROUPS, MODULES, PRESETS, applyConfig, flow, goalMods, goalOn, labelOf, plan, tips, type ConfigOverride, type Core, type Goal } from "./model";
import { Diagram, type Sim } from "./Diagram";
import { LeadForm } from "@/components/LeadForm";
import "./configurator.css";

export function Configurator({ initialCore, initialMods, config, services }: { initialCore: Core; initialMods: string[]; config?: ConfigOverride | null; services: string[] }) {
  applyConfig(config);
  const [core, setCore] = useState<Core>(initialCore);
  const [mods, setMods] = useState<string[]>(initialMods);
  const [start, setStart] = useState<"goals" | "presets">("goals");
  const [tab, setTab] = useState<"flow" | "plan">("flow");
  const [copied, setCopied] = useState(false);
  const [sim, setSim] = useState<Sim | null>(null);
  const [step, setStep] = useState(-1);
  const [send, setSend] = useState<string | null>(null);
  const plate = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const form = useRef<HTMLDivElement>(null);
  const [dock, setDock] = useState(false);
  const on = useMemo(() => new Set(mods), [mods]);

  const steps = flow(core, on);
  const phases = plan(core, on);
  const advice = tips(core, on);

  // Keep the scheme in the URL so it can be shared or sent with the request; a changed scheme stops a played request
  useEffect(() => {
    const q = new URLSearchParams({ core, m: mods.join(",") });
    window.history.replaceState(null, "", `?${q}`);
    setSim(null);
  }, [core, mods]);

  // Phone: the scheme sits above the switches, so a dock keeps the counts in sight and jumps back to it
  useEffect(() => {
    const seen = { plate: true, panel: false };
    const io = new IntersectionObserver((es) => {
      for (const e of es) seen[e.target === plate.current ? "plate" : "panel"] = e.isIntersecting;
      setDock(!seen.plate && seen.panel);
    });
    if (plate.current) io.observe(plate.current);
    if (panel.current) io.observe(panel.current);
    return () => io.disconnect();
  }, []);

  // The first time the scheme is in view it plays one request by itself, so the visitor sees what the button does
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setTimeout(() => setSim((s) => s ?? { steps: flowIds.current, t0: performance.now() }), 500);
    }, { threshold: 0.6 });
    if (plate.current) io.observe(plate.current);
    return () => io.disconnect();
  }, []);
  const flowIds = useRef<string[]>([]);
  flowIds.current = steps.map((s) => s.id);

  const toggle = (id: string) => {
    if (id.startsWith("core:")) return setCore(id.slice(5) as Core);
    setMods((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  };
  // Turning a goal off removes only what no other chosen goal still needs
  const toggleGoal = (g: Goal) => {
    const need = goalMods(g);
    if (goalOn(g, core, on)) {
      const keep = new Set(GOALS.filter((x) => x !== g && goalOn(x, core, on)).flatMap(goalMods));
      return setMods((m) => m.filter((id) => !need.includes(id) || keep.has(id)));
    }
    if (g.core && core === "none") setCore("crm");
    setMods((m) => [...m, ...need.filter((id) => !m.includes(id))]);
  };
  const play = () => setSim((s) => (s ? null : { steps: steps.map((x) => x.id), t0: performance.now() }));
  const onStep = (i: number) => { setStep(i); if (i < 0) setSim(null); };

  const preset = PRESETS.find((p) => p.core === core && p.mods.length === mods.length && p.mods.every((x) => on.has(x)));
  const chosen = [CORES.find((c) => c.id === core)!, ...MODULES.filter((m) => on.has(m.id))].filter((x) => x.id !== "none");
  const links = MODULES.filter((m) => m.col === "in" && on.has(m.id)).length + (on.has("ai") ? 1 : 0) + (core === "none" ? 0 : MODULES.filter((m) => m.col === "out" && on.has(m.id)).length);
  const auto = ["ai", "robots", "notify", "pay", "onec", "stock"].filter((x) => on.has(x) && (x === "ai" || core !== "none")).length + (core === "none" ? 0 : 1);
  const scheme = chosen.map((x) => x.label).join(", ");

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  // The request carries the scheme, its launch order and a link that opens it exactly as built
  const openSend = () => {
    const order = phases.map((p, i) => `${i + 1}) ${p.title}: ${p.ids.map(labelOf).join(", ")}`).join("; ");
    setSend(`Схема из конфигуратора: ${scheme || "пока пустая"}.${order ? ` План: ${order}.` : ""} Ссылка: ${window.location.href}`);
    requestAnimationFrame(() => form.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  return (
    <div className="cfg">
      <div className="cfg-start">
        <div className="cfg-seg" role="tablist" aria-label="С чего начать">
          <button type="button" role="tab" aria-selected={start === "goals"} data-on={start === "goals" || undefined} onClick={() => setStart("goals")}>Что хотите решить</button>
          <button type="button" role="tab" aria-selected={start === "presets"} data-on={start === "presets" || undefined} onClick={() => setStart("presets")}>Готовые схемы</button>
        </div>
        <div className="cfg-presets">
          {start === "goals"
            ? GOALS.filter((g) => goalMods(g).length).map((g) => {
                const active = goalOn(g, core, on);
                return (
                  <button key={g.id} type="button" className="cfg-chip" aria-pressed={active} data-on={active || undefined} onClick={() => toggleGoal(g)}>
                    {active ? <Check size={14} strokeWidth={3} /> : <span className="cfg-plus">+</span>}{g.label}
                  </button>
                );
              })
            : PRESETS.map((p) => (
                <button key={p.name} type="button" className="cfg-chip" data-on={preset?.name === p.name || undefined} onClick={() => { setCore(p.core); setMods(p.mods); }}>{p.name}</button>
              ))}
          <button type="button" className="cfg-chip cfg-chip-ghost" onClick={() => { setCore("none"); setMods([]); }}><RotateCcw size={14} /> С нуля</button>
        </div>
      </div>

      <div className="cfg-grid mt-6">
        <aside ref={panel} className="cfg-panel">
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
                    <button key={m.id} type="button" role="checkbox" aria-checked={on.has(m.id)} className="cfg-tog" data-on={on.has(m.id) || undefined} data-off={off || undefined} onClick={() => toggle(m.id)} title={off ? "Работает, когда есть ядро системы" : m.sub}>
                      <span className="cfg-box">{on.has(m.id) ? <Check size={14} strokeWidth={3} /> : <Icon size={15} strokeWidth={2.3} />}</span>
                      <b>{m.label}</b>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </aside>

        <div ref={plate} className="cfg-plate">
          <div className="cfg-plate-head">
            <div className="cfg-stats">
              <span><b>{chosen.length}</b> модулей</span>
              <span><b>{links}</b> связей</span>
              <span><b>{auto}</b> шагов без ручной работы</span>
            </div>
            <button type="button" className="cfg-play" data-on={sim ? "" : undefined} onClick={play} disabled={!chosen.length && !mods.length}>
              {sim ? <><Square size={14} strokeWidth={3} /> Стоп</> : <><Play size={14} strokeWidth={3} /> Пустить заявку</>}
            </button>
          </div>
          <div className="cfg-cap" data-on={step >= 0 || undefined} aria-live="polite">
            <div>{step >= 0 && steps[step] && <p key={step}><span>{String(step + 1).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}</span>{steps[step].text}</p>}</div>
          </div>
          <Diagram core={core} on={on} sim={sim} onStep={onStep} />
        </div>

        <div className="cfg-result grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="card p-6">
            <div className="cfg-tabs" role="tablist" aria-label="Схема">
              <button type="button" role="tab" aria-selected={tab === "flow"} data-on={tab === "flow" || undefined} onClick={() => setTab("flow")}>Как пойдёт заявка</button>
              <button type="button" role="tab" aria-selected={tab === "plan"} data-on={tab === "plan" || undefined} onClick={() => setTab("plan")}>План запуска</button>
            </div>
            {tab === "flow" ? (
              <ol className="cfg-flow mt-5" data-playing={step >= 0 || undefined}>
                {steps.map((t, i) => <li key={t.id} data-on={i === step || undefined} data-past={(step >= 0 && i < step) || undefined} style={{ animationDelay: `${i * 60}ms` }}><span>{i + 1}</span>{t.text}</li>)}
              </ol>
            ) : phases.length ? (
              <ol className="cfg-plan mt-5">
                {phases.map((p, i) => (
                  <li key={p.title} style={{ animationDelay: `${i * 70}ms` }}>
                    <span className="cfg-plan-n">{i + 1}</span>
                    <div>
                      <b>{p.title}</b> <small>{p.note}</small>
                      <div className="cfg-plan-mods">{p.ids.map((id) => <span key={id}>{labelOf(id)}</span>)}</div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="t-body mt-5">Выберите ядро и каналы, и здесь появится порядок запуска.</p>
            )}
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
              <p className="mt-2 text-sm text-white/70">Отправьте схему с планом запуска, и на созвоне разберём, с чего начать.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={openSend} className="btn btn-primary">Отправить схему <Send size={17} /></button>
                <button type="button" onClick={share} className="btn cfg-btn-line">{copied ? <><Check size={16} /> Скопировано</> : <><Link2 size={16} /> Ссылка</>}</button>
              </div>
            </div>
          </div>
          {send !== null && (
            <div ref={form} className="cfg-send xl:col-span-2">
              <LeadForm key={send} id="cfg-" services={services} defaultMessage={send} />
            </div>
          )}
        </div>
      </div>

      <div className="cfg-dock lg:hidden" data-on={dock || undefined} inert={!dock}>
        <span><b>{chosen.length}</b> модулей · <b>{links}</b> связей</span>
        <button type="button" onClick={() => plate.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>Схема <ArrowUp size={16} strokeWidth={2.6} /></button>
      </div>
    </div>
  );
}
