import Link from "next/link";
import { getSettings } from "@/lib/settings";

const nav = [["/#services", "Услуги"], ["/projects", "Проекты"], ["/about", "О нас"], ["/blog", "Блог"], ["/contacts", "Контакты"]];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <header className="sticky top-0 z-30 border-b-2 border-ink bg-bg">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-lg font-extrabold tracking-tight">Think<span className="text-accent">-</span>asta</Link>
          <nav className="hidden gap-7 text-sm font-bold text-ink md:flex">
            {nav.map(([h, l]) => <Link key={h} href={h} className="hover:text-accent-hover">{l}</Link>)}
          </nav>
          <Link href="/contacts#form" className="btn btn-primary btn-sm">Обсудить проект</Link>
        </div>
        <nav className="container-x flex gap-5 overflow-x-auto pb-3 text-sm font-bold text-ink md:hidden">
          {nav.map(([h, l]) => <Link key={h} href={h} className="whitespace-nowrap">{l}</Link>)}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t-2 border-ink bg-ink text-white">
        <div className="container-x grid gap-8 py-12 md:grid-cols-3">
          <div><div className="font-display text-lg font-extrabold">Think<span className="text-accent">-</span>asta</div><p className="mt-2 text-sm text-white/70">Сайты, приложения, CRM, ИИ и Битрикс24.</p></div>
          <div className="text-sm text-white/70"><div>{s.email}</div><div>{s.phone}</div><div>{s.hours}</div></div>
          <div className="text-sm text-white/70"><a href={s.telegram} className="text-accent">Telegram</a><div className="mt-1">{s.address}</div></div>
        </div>
      </footer>
    </>
  );
}
