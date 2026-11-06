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
  );
}

export function HowWeWork({ steps }: { steps: Step[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = steps.length;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = still || total <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / total));
      el.style.setProperty("--p", String(p));
      setActive(Math.min(n - 1, Math.floor(p * n * 0.999)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
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
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [n]);

  const goTo = (i: number) => {
    const el = box.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + ((i + 0.5) / n) * total, behavior: "smooth" });
  };

  return (
    <div ref={box} className="how" style={{ "--p": 0, height: `${(n + 1) * 80}vh` } as CSSProperties}>
      <div className="how-sticky">
        <div className="container-x grid w-full items-center gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <div className="order-2 lg:order-1">
            <h2 className="t-h1">Как мы работаем</h2>
            <ol className="mt-6 space-y-2 lg:mt-8">
              {steps.map((st, i) => (
                <li key={st.id}>
                  <button type="button" onClick={() => goTo(i)} aria-current={i === active ? "step" : undefined} className="how-step" data-on={i === active || undefined}>
                    <span className="chip">0{i + 1}</span>
                    <span className="how-step-t">
                      <b className="font-display text-lg font-extrabold tracking-tight lg:text-xl">{st.title}</b>
                      <span className="how-step-d"><span>{st.text}</span></span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="order-1 lg:order-2"><Stage /></div>
        </div>
      </div>
    </div>
  );
}
