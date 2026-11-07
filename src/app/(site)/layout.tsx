import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { JsonLd, orgLd } from "@/lib/seo";
import { Analytics } from "@/components/Analytics";
import { Track } from "@/components/Track";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileMenu } from "@/components/MobileMenu";
import { ActionBar } from "@/components/ActionBar";
import { ArrowUpRight } from "lucide-react";

const nav = [["/#services", "Услуги"], ["/projects", "Проекты"], ["/configurator", "Конфигуратор"], ["/about", "О нас"], ["/blog", "Блог"], ["/contacts", "Контакты"]];

const legal = [["/privacy", "Политика конфиденциальности"], ["/consent", "Согласие на обработку данных"], ["/terms", "Пользовательское соглашение"], ["/cookies", "Cookie"]];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <JsonLd data={orgLd(s)} />
      <Analytics />
      <Track />
      <header className="sticky top-0 z-30 border-b-2 border-ink bg-bg">
        <div className="container-x flex h-[var(--hdr)] items-center justify-between gap-3">
          <Link href="/" className="relative z-50 font-display text-lg font-extrabold tracking-tight">Think<span className="text-accent">-</span>asta</Link>
          <nav className="hidden gap-7 text-sm font-bold text-ink lg:flex">
            {nav.map(([h, l]) => <Link key={h} href={h} className="hover:text-accent-hover">{l}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/contacts#form" className="btn btn-primary btn-sm max-md:!h-10 max-md:!px-3.5">Обсудить<span className="max-[380px]:hidden">&nbsp;проект</span></Link>
            <MobileMenu nav={nav} contacts={{ email: s.email, phone: s.phone, telegram: s.telegram }} />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="cv border-t-2 border-ink bg-ink text-white">
        <div className="container-x grid gap-8 pt-12 md:grid-cols-3 md:pb-4">
          <div><div className="font-display text-lg font-extrabold">Think<span className="text-accent">-</span>asta</div><p className="mt-2 text-sm text-white/70">Сайты, приложения, CRM, ИИ и Битрикс24.</p></div>
          <div className="foot-rows text-sm text-white/70">
            <a href={`mailto:${s.email}`}>{s.email}<ArrowUpRight size={18} /></a>
            <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}<ArrowUpRight size={18} /></a>
            {s.telegram && <a href={s.telegram} className="text-accent md:hidden!">Telegram<ArrowUpRight size={18} /></a>}
            <div>{s.hours}</div>
          </div>
          <div className="text-sm text-white/70"><a href={s.telegram} className="text-accent max-md:hidden">Telegram</a><div className="md:mt-1">{s.address}</div></div>
        </div>
        <div className="foot-mark" aria-hidden>Think<span>-</span>asta</div>
        <div className="border-t border-white/15">
          <div className="container-x flex flex-col gap-3 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Think-asta. {[s.legal_name, s.legal_reg, s.legal_address].filter(Boolean).join(", ")}</p>
            <nav className="flex flex-wrap gap-x-5 gap-y-2 font-semibold">
              {legal.map(([h, l]) => <Link key={h} href={h} className="hover:text-white">{l}</Link>)}
            </nav>
          </div>
        </div>
      </footer>
      <ActionBar phone={s.phone} telegram={s.telegram} />
      <CookieBanner />
    </>
  );
}
