"use client";
import { useEffect } from "react";
import { haptic } from "@/lib/haptic";

// Phone behaviour of the page chrome: the header slides away while reading down and comes back on the way up; taps buzz.
export function Chrome() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header");
    const phone = window.matchMedia("(max-width: 1023px)");
    let last = window.scrollY, raf = 0;
    const tick = () => {
      raf = 0;
      const y = window.scrollY, dy = y - last;
      if (Math.abs(dy) < 6) return;
      const menuOpen = document.querySelector(".mmenu[data-open]");
      header?.toggleAttribute("data-hide", phone.matches && !menuOpen && dy > 0 && y > 160);
      last = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onTap = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("a, button, summary, label")) haptic(6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onTap);
    return () => { window.removeEventListener("scroll", onScroll); document.removeEventListener("click", onTap); cancelAnimationFrame(raf); };
  }, []);
  return null;
}
