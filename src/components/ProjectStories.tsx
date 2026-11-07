"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { ServiceArt } from "@/components/art/ServiceArt";
import { haptic } from "@/lib/haptic";

type Story = { slug: string; title: string; category: string; summary: string; cover: string | null };

// Phones: tapping a project card opens all projects as full-screen stories
export function ProjectStories({ items, children }: { items: Story[]; children: React.ReactNode }) {
  const [at, setAt] = useState(-1);
  const [shown, setShown] = useState(false);
  const [paused, setPaused] = useState(false);
  const press = useRef({ t: 0, x: 0, y: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const open = at >= 0;

  const show = (i: number) => { setAt(i); requestAnimationFrame(() => requestAnimationFrame(() => setShown(true))); };
  const close = () => { setShown(false); setTimeout(() => setAt(-1), 300); };
  const go = (d: number) => {
    haptic(5);
    const i = at + d;
    if (i < 0) return setAt(0);
    if (i >= items.length) return close();
    setAt(i);
  };

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    return () => { document.documentElement.style.overflow = ""; window.removeEventListener("keydown", key); };
  });

  const onCapture = (e: React.MouseEvent) => {
    // React events from the portal bubble here too; the story's own link must navigate
    if ((e.target as Element).closest(".stories")) return;
    const a = (e.target as Element).closest('a[href^="/projects/"]');
    if (!a || !window.matchMedia("(max-width: 767px)").matches) return;
    const i = items.findIndex((s) => a.getAttribute("href") === `/projects/${s.slug}`);
    if (i < 0) return;
    e.preventDefault();
    e.stopPropagation();
    haptic(10);
    show(i);
  };

  // Hold pauses, a short tap steps left or right, a pull down closes
  const down = (e: React.PointerEvent) => { press.current = { t: performance.now(), x: e.clientX, y: e.clientY }; setPaused(true); };
  const move = (e: React.PointerEvent) => {
    const dy = e.clientY - press.current.y;
    if (press.current.t && dy > 0 && stage.current) stage.current.style.transform = `translateY(${dy}px) scale(${1 - Math.min(dy, 300) / 1500})`;
  };
  const up = (e: React.PointerEvent) => {
    const { t, x, y } = press.current;
    press.current.t = 0;
    setPaused(false);
    if (stage.current) stage.current.style.transform = "";
    const dy = e.clientY - y;
    if (dy > 110) return close();
    if (performance.now() - t < 250 && Math.abs(e.clientX - x) < 12 && Math.abs(dy) < 12) go(e.clientX < window.innerWidth * 0.33 ? -1 : 1);
  };

  const s = open ? items[at] : null;
  return (
    <>
      <div onClickCapture={onCapture}>{children}</div>
      {s && createPortal(
        <div className="stories" data-shown={shown || undefined} data-paused={paused || undefined} role="dialog" aria-modal="true" aria-label="Проекты">
          <div ref={stage} className="stories-stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <div className="stories-bars">
              {items.map((x, i) => (
                <i key={x.slug} data-done={i < at || undefined}>{i === at && <b key={at} onAnimationEnd={() => go(1)} />}</i>
              ))}
            </div>
            <div className="stories-head">
              <span className="chip chip-accent">{s.category}</span>
              <button type="button" aria-label="Закрыть" onPointerDown={(e) => e.stopPropagation()} onClick={close}><X size={22} strokeWidth={2.6} /></button>
            </div>
            <div key={s.slug} className="stories-body">
              <div className="stories-art">
                {s.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ServiceArt category={s.category} />
                )}
              </div>
              <p className="stories-n">{String(at + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
              <h3>{s.title}</h3>
              <p className="stories-sum">{s.summary}</p>
            </div>
            <Link href={`/projects/${s.slug}`} className="btn btn-primary stories-cta" onPointerDown={(e) => e.stopPropagation()}>Открыть кейс <ArrowRight size={18} /></Link>
          </div>
        </div>,
        // Outside the page sections: their content-visibility would trap a fixed overlay
        document.body,
      )}
    </>
  );
}
