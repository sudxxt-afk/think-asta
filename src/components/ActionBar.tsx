"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Phone, Send } from "lucide-react";

// Shows after the first screen, hides wherever a form or the footer is already on screen
export function ActionBar({ phone, telegram }: { phone: string; telegram: string }) {
  const path = usePathname();
  const [on, setOn] = useState(false);
  const off = path.startsWith("/contacts") || path.startsWith("/configurator");

  useEffect(() => {
    if (off) return;
    const blockers = new Set<Element>();
    let past = false;
    const sync = () => setOn(past && blockers.size === 0);
    const io = new IntersectionObserver((es) => {
      for (const e of es) e.isIntersecting ? blockers.add(e.target) : blockers.delete(e.target);
      sync();
    });
    document.querySelectorAll("#form, footer").forEach((el) => io.observe(el));
    const onScroll = () => { const p = window.scrollY > window.innerHeight * 0.7; if (p !== past) { past = p; sync(); } };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [off, path]);

  if (off) return null;
  return (
    <div className="abar" data-on={on || undefined} inert={!on}>
      <Link href="/contacts#form" className="abar-main">Обсудить проект <ArrowRight size={18} /></Link>
      {telegram && <a href={telegram} className="abar-icon" aria-label="Написать в Telegram"><Send size={19} /></a>}
      <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="abar-icon" aria-label="Позвонить"><Phone size={19} /></a>
    </div>
  );
}
