"use client";
import { Children, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Phones: a snap carousel with the next card peeking and a counter with dots under it. From `from` up: whatever `wide` lays out (a grid);
// "never" stays a carousel everywhere and gets arrows on wide screens.
export function Swipe({ children, label, wide, from = "md" }: { children: React.ReactNode; label: string; wide: string; from?: "md" | "lg" | "never" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const n = Children.count(children);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
      setAt(Math.min(n - 1, Math.max(0, Math.round(el.scrollLeft / step))));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    el.addEventListener("scroll", on, { passive: true });
    return () => { el.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, [n]);

  const go = (i: number) => {
    const el = ref.current, card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: "smooth" });
  };

  return (
    <div className="swipe" data-from={from}>
      <div ref={ref} className={`swipe-track ${wide}`} aria-label={label} tabIndex={0}>{children}</div>
      <div className="swipe-nav">
        <span className="swipe-count" aria-hidden>{String(at + 1).padStart(2, "0")}<i>/{String(n).padStart(2, "0")}</i></span>
        <span className="swipe-dots" aria-hidden>
          {Array.from({ length: n }, (_, i) => <button key={i} type="button" tabIndex={-1} data-on={i === at || undefined} onClick={() => go(i)} />)}
        </span>
        {from === "never" && (
          <span className="swipe-arrows">
            <button type="button" aria-label="Назад" onClick={() => go(Math.max(0, at - 1))} className="btn btn-ghost btn-sm !w-10 !px-0"><ChevronLeft size={18} /></button>
            <button type="button" aria-label="Вперёд" onClick={() => go(Math.min(n - 1, at + 1))} className="btn btn-ghost btn-sm !w-10 !px-0"><ChevronRight size={18} /></button>
          </span>
        )}
      </div>
    </div>
  );
}
