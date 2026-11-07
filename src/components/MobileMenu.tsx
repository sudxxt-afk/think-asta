"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

type Contacts = { email: string; phone: string; telegram: string };

export function MobileMenu({ nav, contacts }: { nav: string[][]; contacts: Contacts }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("ta:sheet", close);
    return () => window.removeEventListener("ta:sheet", close);
  }, []);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", esc);
    return () => { document.documentElement.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <>
      <button type="button" className="burger" aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open} aria-controls="mmenu" data-open={open || undefined} onClick={() => setOpen((v) => !v)}>
        <i /><i />
      </button>
      <div id="mmenu" className="mmenu" data-open={open || undefined} inert={!open}>
        <nav className="container-x">
          {nav.map(([h, l], i) => (
            <Link key={h} href={h} onClick={() => setOpen(false)} className="mmenu-link" style={{ "--i": i } as React.CSSProperties}>
              <span className="chip">0{i + 1}</span>{l}
            </Link>
          ))}
        </nav>
        <div className="container-x mmenu-foot">
          <Link href="/contacts#form" onClick={() => setOpen(false)} className="btn btn-dark w-full">Обсудить проект <ArrowRight size={18} /></Link>
          <div className="mt-5 grid gap-1 text-sm font-bold">
            <a href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}>{contacts.phone}</a>
            <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
            {contacts.telegram && <a href={contacts.telegram}>Telegram →</a>}
          </div>
        </div>
      </div>
    </>
  );
}
