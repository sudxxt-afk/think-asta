"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./how.css";

type Step = { id: string; title: string; text: string };

// A piece starts scattered (dx, dy in stage units, r in degrees) and snaps into place while scroll progress passes [s, s + l].
function P({ s, l = 0.1, dx = 0, dy = 0, r = 0, x, y, w, h, grow, className = "", children }: {
  s: number; l?: number; dx?: number; dy?: number; r?: number; x?: number; y?: number; w?: number; h?: number; grow?: boolean; className?: string; children?: ReactNode;
}) {
  const style = {
    "--s": s, "--l": l, "--dx": dx, "--dy": dy, "--r": r,
    ...(x !== undefined && { left: `${x}cqw` }), ...(y !== undefined && { top: `${y}cqw` }),
    ...(w !== undefined && { width: `${w}cqw` }), ...(h !== undefined && { height: `${h}cqw` }),
  } as CSSProperties;
  return <div className={`pc${grow ? " pc-grow" : ""} ${className}`} style={style}>{children}</div>;
}

function Stage() {
  return (
    <div className="how-stage" aria-hidden>
      <div className="how-world">
        {/* 1. Разговор: реплики прилетают слева */}
        <P s={0.0} dx={-30} dy={-6} r={-10} x={2.5} y={4} w={24} className="pc-card how-bubble">Нужен сайт и CRM для заявок</P>
        <P s={0.05} dx={-30} dy={4} r={8} x={2.5} y={12.5} w={24} className="pc-card how-bubble how-us">Сколько заявок в месяц?</P>
        <P s={0.1} dx={-30} dy={10} r={-6} x={2.5} y={21} w={24} className="pc-card how-bubble">Около двухсот, теряем часть</P>

        {/* 2. Оценка: план с этапами */}
        <P s={0.2} dx={-26} dy={14} r={9} x={2.5} y={31} w={24} h={26} className="pc-card how-plan">
          <b>План работ</b>
          {[["Прототип", "1 нед", 28], ["Разработка", "4 нед", 80], ["Запуск", "1 нед", 28]].map(([n, t, w]) => (
            <div key={n as string} className="how-row"><span>{n}</span><i style={{ width: `${w}%` }} /><em>{t}</em></div>
          ))}
          <P s={0.34} l={0.05} dx={4} dy={-4} r={14} className="how-stamp">Цена и сроки ясны</P>
        </P>

        {/* 3. Прототип: каркас окна */}
        <P s={0.38} dx={28} dy={-14} r={7} x={30} y={5} w={67} h={52} className="pc-card how-win">
          <div className="how-bar"><i /><i /><i /></div>
        </P>
        <P s={0.46} dx={10} dy={-8} r={-4} x={33} y={11} w={20} h={2.4} className="how-line" />
        <P s={0.49} dx={14} dy={-6} r={3} x={33} y={17} w={30} h={5} className="how-h">РемонтПро: ремонт под ключ</P>
        <P s={0.52} dx={16} dy={-4} r={-3} x={33} y={25} w={26} h={1.6} className="how-line" />
        <P s={0.54} dx={16} dy={-2} r={2} x={33} y={28.5} w={20} h={1.6} className="how-line" />
        {[0, 1, 2].map((i) => (
          <P key={i} s={0.56 + i * 0.03} dx={8 + i * 6} dy={14} r={-6 + i * 5} x={33 + i * 20.5} y={42} w={18.5} h={11} className="how-box" />
        ))}

        {/* 4. Разработка: каркас наполняется */}
        <P s={0.66} l={0.12} grow x={61} y={14} w={32} h={24} className="how-img" />
        <P s={0.74} dx={6} dy={6} r={-8} x={33} y={34} w={17} h={5} className="how-btn">Рассчитать</P>
        {[0, 1, 2].map((i) => (
          <P key={i} s={0.78 + i * 0.03} l={0.08} grow className="how-fill" x={33 + i * 20.5} y={42} w={18.5} h={11}>
            <b>{["Каталог", "Заявки", "Отчёты"][i]}</b>
          </P>
        ))}
        <P s={0.7} dx={16} dy={10} r={10} x={72} y={38} w={22} className="pc-card how-code">
          <i style={{ width: "70%" }} /><i style={{ width: "92%" }} /><i style={{ width: "48%" }} />
        </P>

        {/* 5. Запуск */}
        <P s={0.88} dx={6} dy={-10} r={8} x={78} y={1.2} className="how-live">Онлайн</P>
        <P s={0.9} l={0.1} dx={8} dy={12} r={-6} x={76} y={43} w={22} h={15} className="pc-card how-chart">
          <b>Заявки</b>
          {[3, 5, 4, 7, 9].map((h, i) => <i key={i} className="how-b" style={{ "--h": h } as CSSProperties} />)}
        </P>
      </div>
    </div>
  );
}

// Phone camera over the stage (stage units, the window is 50 x 40 of 100 x 62): follows whatever the current step builds
const CAM: [p: number, x: number, y: number][] = [[0, -11, 0], [0.15, -11, 0], [0.24, -11, 20], [0.34, -11, 20], [0.42, 28, 2], [0.5, 28, 4], [0.62, 28, 13], [0.72, 47, 14], [0.86, 47, 14], [0.93, 48, 18], [1, 48, 18]];
function cam(p: number) {
  let i = 1;
  while (i < CAM.length - 1 && CAM[i][0] < p) i++;
  const [p0, x0, y0] = CAM[i - 1], [p1, x1, y1] = CAM[i];
  const t = p1 > p0 ? Math.min(1, Math.max(0, (p - p0) / (p1 - p0))) : 1;
  const e = t * t * (3 - 2 * t);
  return [x0 + (x1 - x0) * e, y0 + (y1 - y0) * e];
}

export function HowWeWork({ steps }: { steps: Step[] }) {
  const box = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = steps.length;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.matchMedia("(max-width: 767px)");
    const wide = window.matchMedia("(min-width: 1024px)");
    let raf = 0;
    let stage: HTMLElement | null = null;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Pinned: progress over the extra scroll height; unpinned: over the section passing from 80% of the screen to its bottom edge
      const pinned = !el.hasAttribute("data-static");
      const total = pinned ? r.height - vh : Math.max(200, r.height - vh * 0.2);
      const from = pinned ? -r.top : vh * 0.8 - r.top;
      const p = still ? 1 : Math.min(1, Math.max(0, from / total));
      el.style.setProperty("--p", String(p));
      if (phone.matches) {
        const [x, y0] = cam(p);
        const st = stage ?? (stage = el.querySelector<HTMLElement>(".how-stage"));
        const y = st ? Math.min(y0, Math.max(0, 62 - (st.clientHeight / st.clientWidth) * 50)) : y0;
        el.style.setProperty("--cx", `${-x}%`);
        el.style.setProperty("--cy", `${(-y / 62) * 100}%`);
      }
      setActive(Math.min(n - 1, Math.floor(p * n * 0.999)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    // The tallest the step list gets sizes the stage under it; if even a small stage won't fit, stop pinning
    let list = 0;
    const fit = () => {
      const t = text.current, h = head.current;
      if (!t || !h) return;
      list = Math.max(list, t.offsetHeight + h.offsetHeight + 16);
      el.style.setProperty("--list", `${list}px`);
      const room = window.innerHeight - parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hdr"));
      el.toggleAttribute("data-static", list + (wide.matches ? 16 : 64 + 180) > room);
      onScroll();
    };
    const ro = new ResizeObserver(fit);
    if (text.current) ro.observe(text.current);
    if (head.current) ro.observe(head.current);
    const onResize = () => { list = 0; fit(); };
    window.addEventListener("resize", onResize);
    // Scroll work only while the section is near the viewport; elsewhere it just settles at 0 or 1
    let live = false;
    const io = new IntersectionObserver(([e]) => {
      update();
      if (e.isIntersecting === live) return;
      live = e.isIntersecting;
      el.toggleAttribute("data-live", live);
      if (live) { window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); }
      else { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); }
    }, { rootMargin: "300px 0px" });
    io.observe(el);
    update();
    return () => { io.disconnect(); ro.disconnect(); window.removeEventListener("resize", onResize); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [n]);

  const goTo = (i: number) => {
    const el = box.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + ((i + 0.5) / n) * total, behavior: "smooth" });
  };

  return (
    <div ref={box} className="how" style={{ "--p": 0, "--n": n } as CSSProperties}>
      <div className="how-sticky">
        <div className="container-x how-grid">
          <div ref={head} className="how-head">
            <h2 className="t-h1">Как мы работаем</h2>
            <span className="how-count" aria-hidden>0{active + 1}<i>/0{n}</i></span>
          </div>
          <div className="how-art"><Stage /></div>
          <div ref={text} className="how-steps">
            {/* Narrow screens: a stepper that fills with the scroll and one card for the current step */}
            <div className="how-m">
              <ol className="how-track">
                {steps.map((st, i) => (
                  <li key={st.id}>
                    <button type="button" onClick={() => goTo(i)} aria-label={st.title} aria-current={i === active ? "step" : undefined} data-on={i === active || undefined} style={{ "--i": i } as CSSProperties}>0{i + 1}<span className="how-track-t">{st.title}</span></button>
                  </li>
                ))}
              </ol>
              <div className="how-card" aria-live="polite">
                {steps.map((st, i) => (
                  <div key={st.id} data-on={i === active || undefined} aria-hidden={i !== active}>
                    <b>{st.title}</b>
                    <p>{st.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <ol className="how-list space-y-1.5">
              {steps.map((st, i) => (
                <li key={st.id}>
                  <button type="button" onClick={() => goTo(i)} aria-current={i === active ? "step" : undefined} className="how-step" data-on={i === active || undefined}>
                    <span className="chip">0{i + 1}</span>
                    <span className="how-step-t">
                      <b className="font-display text-lg font-extrabold tracking-tight">{st.title}</b>
                      <span className="how-step-d"><span>{st.text}</span></span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
