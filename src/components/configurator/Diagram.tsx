"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { CORES, MODULES, type Core } from "./model";

type Node = { id: string; kind: "in" | "ai" | "core" | "out" | "chaos"; x: number; y: number; w: number; a: number };
type Box = { W: number; H: number; v: boolean };

function layout(core: Core, on: Set<string>, { W, H, v }: Box): Node[] {
  const pick = (c: string) => MODULES.filter((m) => m.col === c && on.has(m.id));
  const ins = pick("in"), outs = core === "none" ? [] : pick("out");
  const nodes: Node[] = [];
  const spread = (n: number, i: number, len: number, pad: number) => pad + ((len - 2 * pad) * (i + 0.5)) / n;
  if (!v) {
    const w = Math.min(196, W * 0.2);
    const l = 14 + w / 2, r = W - 20 - w / 2;
    const cx = { in: l, ai: l + (r - l) * 0.3, core: l + (r - l) * 0.68, out: r };
    ins.forEach((m, i) => nodes.push({ id: m.id, kind: "in", x: cx.in, y: spread(ins.length, i, H, 28), w, a: 1 }));
    if (on.has("ai")) nodes.push({ id: "ai", kind: "ai", x: cx.ai, y: H / 2, w, a: 1 });
    nodes.push({ id: `core:${core}`, kind: core === "none" ? "chaos" : "core", x: on.has("ai") ? cx.core : (cx.ai + cx.core) / 2, y: H / 2, w: w * 1.15, a: 1 });
    outs.forEach((m, i) => nodes.push({ id: m.id, kind: "out", x: cx.out, y: spread(outs.length, i, H, 28), w, a: 1 }));
  } else {
    const row = { in: H * 0.1, ai: H * 0.33, core: H * 0.55, out: H * 0.85 };
    const w = (n: number) => Math.min(150, (W - 16) / Math.max(n, 1) - 8);
    ins.forEach((m, i) => nodes.push({ id: m.id, kind: "in", x: spread(ins.length, i, W, 4), y: row.in, w: w(ins.length), a: 1 }));
    if (on.has("ai")) nodes.push({ id: "ai", kind: "ai", x: W / 2, y: row.ai, w: 180, a: 1 });
    nodes.push({ id: `core:${core}`, kind: core === "none" ? "chaos" : "core", x: W / 2, y: on.has("ai") ? row.core : (row.ai + row.core) / 2, w: 200, a: 1 });
    // Outputs wrap into two rows on narrow screens
    const perRow = Math.ceil(outs.length / (outs.length > 3 ? 2 : 1));
    outs.forEach((m, i) => {
      const r = Math.floor(i / perRow), k = Math.min(perRow, outs.length - r * perRow);
      nodes.push({ id: m.id, kind: "out", x: spread(k, i % perRow, W, 4), y: row.out - (outs.length > 3 ? 44 : 0) + r * 88, w: w(perRow), a: 1 });
    });
  }
  return nodes;
}

function edges(nodes: Node[]) {
  const core = nodes.find((n) => n.kind === "core" || n.kind === "chaos")!;
  const ai = nodes.find((n) => n.kind === "ai");
  const hub = ai ?? core;
  const e: [Node, Node][] = [];
  nodes.filter((n) => n.kind === "in").forEach((n) => e.push([n, hub]));
  if (ai) e.push([ai, core]);
  nodes.filter((n) => n.kind === "out").forEach((n) => e.push([core, n]));
  return e;
}

// Cubic between two node sides, horizontal or vertical
function curve(a: Node, b: Node, v: boolean, H0: number) {
  const h = H0 / 2;
  const p0 = v ? [a.x, a.y + h] : [a.x + a.w / 2, a.y];
  const p3 = v ? [b.x, b.y - h] : [b.x - b.w / 2, b.y];
  const d = v ? (p3[1] - p0[1]) / 2 : (p3[0] - p0[0]) / 2;
  const p1 = v ? [p0[0], p0[1] + d] : [p0[0] + d, p0[1]];
  const p2 = v ? [p3[0], p3[1] - d] : [p3[0] - d, p3[1]];
  return [p0, p1, p2, p3];
}
const at = (c: number[][], t: number) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * c[0][k] + 3 * u * u * t * c[1][k] + 3 * u * t * t * c[2][k] + t * t * t * c[3][k]);
};
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

// One step of a played request: the edges a packet runs along and the nodes it lights
function stepOf(id: string, es: [Node, Node][], nodes: Node[]) {
  if (id === "in") return { runs: es.filter(([a]) => a.kind === "in"), hot: es.filter(([a]) => a.kind === "in").map(([a]) => a.id) };
  if (id === "ai") return { runs: [], hot: ["ai"] };
  if (id === "core") {
    const core = nodes.find((n) => n.kind === "core" || n.kind === "chaos");
    return { runs: es.filter(([a, b]) => a.kind === "ai" && b.id === core?.id), hot: core ? [core.id] : [] };
  }
  return { runs: es.filter(([, b]) => b.id === id), hot: [id] };
}

export const STEP_MS = 1100;
export type Sim = { steps: string[]; t0: number };

export function Diagram({ core, on, sim, onStep }: { core: Core; on: Set<string>; sim?: Sim | null; onStep?: (i: number) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box>({ W: 900, H: 560, v: false });
  const target = useMemo(() => layout(core, on, box), [core, on, box]);
  const [nodes, setNodes] = useState<Node[]>(target);
  const [clock, setClock] = useState(0);
  const tween = useRef({ from: target, to: target, t0: 0 });

  useLayoutEffect(() => {
    const el = wrap.current!;
    const measure = () => {
      const W = el.clientWidth, v = W < 720;
      setBox((b) => (b.W === W ? b : { W, H: v ? 640 : Math.max(480, Math.min(620, W * 0.6)), v }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A resize snaps the scheme to its new layout; only a change of modules animates
  const lastBox = useRef(box);
  useLayoutEffect(() => {
    if (lastBox.current === box) return;
    lastBox.current = box;
    tween.current = { from: target, to: target, t0: 0 };
    setNodes(target);
  }, [box, target]);

  // Retarget: current positions become the start, newcomers fade in where they land, leavers fade out in place
  useEffect(() => {
    if (tween.current.to === target) return;
    const cur = new Map(nodes.map((n) => [n.id, n]));
    const tgt = new Map(target.map((n) => [n.id, n]));
    const from = [...target.map((n) => cur.get(n.id) ?? { ...n, a: 0 }), ...nodes.filter((n) => !tgt.has(n.id))];
    const to = [...target, ...nodes.filter((n) => !tgt.has(n.id)).map((n) => ({ ...n, a: 0 }))];
    tween.current = { from, to, t0: performance.now() };
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  const simRef = useRef(sim);
  simRef.current = sim;
  const stepRef = useRef({ i: -1, cb: onStep });
  stepRef.current.cb = onStep;

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(wrap.current!);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const { from, to, t0 } = tween.current;
      const k = still ? 1 : ease(Math.min(1, (now - t0) / 520));
      const moving = k < 1;
      const s = simRef.current;
      // The played step is reported from the same clock the packet runs on, so the list and the scheme never drift apart
      const i = s ? Math.floor((now - s.t0) / STEP_MS) : -1;
      const step = s && i < s.steps.length + 1 ? Math.min(i, s.steps.length - 1) : -1;
      if (step !== stepRef.current.i) { stepRef.current.i = step; stepRef.current.cb?.(step); }
      if (!visible && !moving && !s) return;
      setNodes(to.map((b, i) => {
        const a = from[i];
        return { ...b, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w: a.w + (b.w - a.w) * k, a: a.a + (b.a - a.a) * k };
      }).filter((n, i) => !(k === 1 && to[i].a === 0)));
      if (!still || s) setClock(now);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const NODE_H = box.v ? 64 : 70;
  const es = edges(nodes.length ? nodes : target);
  const chaos = core === "none";

  // A played request: which step it is at, how far along, what it has already passed
  const k = sim ? (clock - sim.t0) / STEP_MS : -1;
  const at_ = sim && k >= 0 && k < sim.steps.length ? Math.floor(k) : -1;
  const phase = at_ >= 0 ? ease(Math.min(1, (k - at_) / 0.8)) : 0;
  const cur = at_ >= 0 ? stepOf(sim!.steps[at_], es, nodes) : null;
  const passed = new Set<string>(), lit = new Set<string>();
  if (sim && k >= 0) sim.steps.slice(0, Math.min(sim.steps.length, Math.floor(k) + 1)).forEach((id, j) => {
    const st = stepOf(id, es, nodes);
    st.hot.forEach((h) => passed.add(h));
    if (j < at_ || at_ < 0) st.runs.forEach(([a, b]) => lit.add(`${a.id}>${b.id}`));
  });
  if (cur && phase >= 1) cur.runs.forEach(([a, b]) => lit.add(`${a.id}>${b.id}`));
  const playing = !!sim && k >= 0;

  return (
    <div ref={wrap} className="cfg-canvas" style={{ height: box.H }}>
      <svg className="cfg-svg" width={box.W} height={box.H} aria-hidden>
        {es.map(([a, b]) => {
          const c = curve(a, b, box.v, NODE_H);
          const d = `M${c[0]} C${c[1]} ${c[2]} ${c[3]}`;
          const alpha = Math.min(a.a, b.a);
          return (
            <g key={`${a.id}>${b.id}`} opacity={alpha}>
              <path d={d} className={chaos ? "cfg-edge cfg-edge-dash" : "cfg-edge"} data-lit={lit.has(`${a.id}>${b.id}`) || undefined} />
              {cur?.runs.some(([x, y]) => x === a && y === b) && phase < 1 && (() => {
                const [x, y] = at(c, phase);
                return <circle cx={x} cy={y} r={9} className="cfg-packet" />;
              })()}
              {!chaos && !playing && [0, 0.5].map((off) => {
                const [x, y] = at(c, ((clock / 2200 + off + (a.id.length + b.id.length) * 0.07) % 1));
                return <circle key={off} cx={x} cy={y} r={4.5} className="cfg-dot" />;
              })}
            </g>
          );
        })}
      </svg>
      {nodes.map((n) => {
        const m = MODULES.find((x) => x.id === n.id);
        const c = CORES.find((x) => `core:${x.id}` === n.id);
        const Icon = (m ?? c)?.icon ?? AlertTriangle;
        const label = n.kind === "chaos" ? "Почта и таблицы" : (m ?? c)!.label;
        const sub = n.kind === "chaos" ? "заявки теряются" : (m ?? c)!.sub;
        return (
          <div
            key={n.id}
            className="cfg-node"
            data-kind={n.kind}
            data-hot={cur?.hot.includes(n.id) && (cur.runs.length === 0 || phase >= 1 || n.kind === "in") ? "" : undefined}
            data-dim={playing && !passed.has(n.id) ? "" : undefined}
            data-compact={box.v && n.kind !== "core" && n.kind !== "ai" && n.kind !== "chaos" ? "" : undefined}
            style={{ left: n.x - n.w / 2, top: n.y - NODE_H / 2, width: n.w, height: NODE_H, opacity: n.a, transform: `scale(${0.85 + 0.15 * n.a})` }}
          >
            <span className="cfg-ic"><Icon size={18} strokeWidth={2.4} /></span>
            <span className="cfg-tx"><b>{label}</b><small>{sub}</small></span>
          </div>
        );
      })}
    </div>
  );
}
