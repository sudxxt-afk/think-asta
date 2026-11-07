"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { haptic } from "@/lib/haptic";

// Phones: every "/contacts#form" link opens the request form as a bottom sheet instead of leaving the page
export function LeadSheet({ services }: { services: string[] }) {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href="/contacts#form"]');
      if (!a || !window.matchMedia("(max-width: 767px)").matches) return;
      // Capture phase on document, so neither next/link nor the menu ever sees the click
      e.preventDefault();
      e.stopPropagation();
      window.dispatchEvent(new Event("ta:sheet"));
      setUsed(true);
      // Mount closed first, so the panel slides up instead of appearing
      requestAnimationFrame(() => requestAnimationFrame(() => { if (panel.current) panel.current.style.transform = ""; setOpen(true); }));
      haptic(10);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", esc);
    return () => { document.documentElement.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [open]);

  // Drag the grip or the title down to dismiss: past a third of the way, or flicked
  const grab = (e: React.PointerEvent) => {
    const el = panel.current;
    if (!el) return;
    const y0 = e.clientY, t0 = performance.now();
    let dy = 0;
    el.style.transition = "none";
    const move = (ev: PointerEvent) => { dy = Math.max(0, ev.clientY - y0); el.style.transform = `translateY(${dy}px)`; };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.style.transition = "";
      const fast = dy / Math.max(1, performance.now() - t0) > 0.6;
      // Closing continues from where the finger left it; otherwise it springs back
      if (dy > el.offsetHeight / 3 || (fast && dy > 40)) { el.style.transform = "translateY(105%)"; setOpen(false); haptic(6); }
      else el.style.transform = "";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (!used) return null;
  return (
    <div className="sheet" data-open={open || undefined} inert={!open}>
      <div className="sheet-back" onClick={() => setOpen(false)} />
      <div ref={panel} className="sheet-panel" role="dialog" aria-modal="true" aria-label="Заявка">
        <div className="sheet-top" onPointerDown={grab}>
          <i className="sheet-grip" />
          <div className="flex items-center justify-between gap-4">
            <b className="font-display text-xl font-extrabold tracking-tight">Расскажите о задаче</b>
            <button type="button" aria-label="Закрыть" className="sheet-x" onPointerDown={(e) => e.stopPropagation()} onClick={() => setOpen(false)}><X size={18} strokeWidth={2.6} /></button>
          </div>
          <p className="mt-1 text-sm font-medium text-ink-2">Ответим в течение рабочего дня.</p>
        </div>
        <div className="sheet-body"><LeadForm id="sheet-" services={services} /></div>
      </div>
    </div>
  );
}
