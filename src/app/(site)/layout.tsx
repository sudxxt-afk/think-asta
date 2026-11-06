import Link from "next/link";
import { getSettings } from "@/lib/settings";

const nav = [["/#services", "Услуги"], ["/projects", "Проекты"], ["/about", "О нас"], ["/blog", "Блог"], ["/contacts", "Контакты"]];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">Think<span className="text-accent">-</span>asta</Link>
          <nav className="hidden gap-7 text-sm font-medium text-ink-2 md:flex">
            {nav.map(([h, l]) => <Link key={h} href={h} className="hover:text-ink">{l}</Link>)}
          </nav>
          <Link href="/contacts#form" className="btn btn-dark btn-sm">Обсудить проект</Link>
        </div>
        <nav className="container-x flex gap-5 overflow-x-auto pb-3 text-sm font-medium text-ink-2 md:hidden">
          {nav.map(([h, l]) => <Link key={h} href={h} className="whitespace-nowrap">{l}</Link>)}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t border-line bg-sunken">
        <div className="container-x grid gap-8 py-12 md:grid-cols-3">
          <div><div className="text-lg font-semibold">Think-asta</div><p className="t-body mt-2 text-sm">Сайты, приложения, CRM, ИИ и Битрикс24.</p></div>
          <div className="t-body text-sm"><div>{s.email}</div><div>{s.phone}</div><div>{s.hours}</div></div>
          <div className="t-body text-sm"><a href={s.telegram} className="hover:text-accent">Telegram</a><div className="mt-1">{s.address}</div></div>
        </div>
      </footer>
    </>
  );
}
