import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Icon } from "@/components/Icon";
import { Carousel } from "@/components/Carousel";
import { ProjectCard } from "@/components/ProjectCard";
import { LeadForm } from "@/components/LeadForm";
import { JsonLd, abs } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { absolute: s.seo_title },
    description: s.seo_desc,
    alternates: { canonical: "/" },
    openGraph: { title: s.seo_title, description: s.seo_desc, url: "/", type: "website", locale: "ru_RU", siteName: "Think-asta" },
  };
}

export default async function Home() {
  const [s, services, projects, steps, faq] = await Promise.all([
    getSettings(),
    db.service.findMany({ where: { visible: true }, orderBy: { sort: "asc" } }),
    db.project.findMany({ where: { published: true, inCarousel: true }, orderBy: { sort: "asc" } }),
    db.step.findMany({ orderBy: { sort: "asc" } }),
    db.faq.findMany({ where: { visible: true }, orderBy: { sort: "asc" } }),
  ]);

  const words = ["Сайты", "Приложения", "CRM", "AI", "Bitrix24", "Автоматизации"];
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Услуги Think-asta",
      itemListElement: services.map((sv, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Service", name: sv.title, description: sv.text, provider: { "@id": abs("/#org") }, areaServed: "RU" } })),
    },
    faq.length > 0 && {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    },
  ].filter(Boolean) as object[];
  return (
    <>
      {ld.map((d, i) => <JsonLd key={i} data={d} />)}
      <section className="pt-6 sm:pt-10">
        <div className="container-x">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border-2 border-ink bg-accent px-5 pb-8 pt-6 sm:px-8 sm:pb-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="chip">Think-asta</span>
              <span className="text-sm font-extrabold">Сайты · приложения · CRM · AI · Bitrix24</span>
            </div>
            <h1 className="wordmark mt-6 sm:mt-10">Think-asta<span className="sr-only"> — разработка сайтов, мобильных приложений, CRM, ИИ-автоматизация и настройка Битрикс24</span></h1>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
              <div className="max-w-2xl">
                <p className="font-display text-xl font-bold leading-snug tracking-tight sm:text-2xl">{s.hero_title}</p>
                <p className="mt-3 text-[1.05rem] font-semibold leading-relaxed">{s.hero_text}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/contacts#form" className="btn btn-dark">Рассказать о задаче <ArrowRight size={18} /></Link>
                <Link href="/projects" className="btn btn-ghost">Смотреть проекты</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee mt-8 border-y-2 border-ink" aria-hidden>
        <div>{[...words, ...words, ...words, ...words].map((w, i) => <span key={i}>{w.toUpperCase()} ✦</span>)}</div>
      </div>

      <section id="services" className="section">
        <div className="container-x">
          <h2 className="t-h1 max-w-2xl">Чем мы занимаемся</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((sv, i) => (
              <article key={sv.id} className="card tile p-6">
                <div className="flex items-center justify-between">
                  <span className="chip">{String(i + 1).padStart(2, "0")}</span>
                  <Icon name={sv.icon} className="h-6 w-6" />
                </div>
                <h3 className="t-h3 mt-6">{sv.title}</h3>
                <p className="t-body mt-2 text-[.95rem]">{sv.text}</p>
                <ul className="mt-4 space-y-1.5 text-sm font-medium text-ink-2">
                  {sv.points.map((p) => <li key={p} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" />{p}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="section border-y-2 border-ink bg-sunken">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <h2 className="t-h1">Выполненные проекты</h2>
              <Link href="/projects" className="hidden text-sm font-extrabold underline decoration-accent decoration-[3px] underline-offset-4 sm:block">Все проекты →</Link>
            </div>
            <div className="mt-8"><Carousel>{projects.map((p) => <ProjectCard key={p.id} p={p} />)}</Carousel></div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-x">
          <h2 className="t-h1 max-w-2xl">Как мы работаем</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {steps.map((st, i) => (
              <li key={st.id} className="card tile p-5">
                <span className="chip">0{i + 1}</span>
                <h3 className="t-h3 mt-4">{st.title}</h3>
                <p className="t-body mt-2 text-sm">{st.text}</p>
              </li>
            ))}
          </ol>
          <p className="t-body mt-8 max-w-2xl">{s.cost_text.split(/\n\s*\n/)[0]} <Link href="/about#cost" className="font-extrabold text-ink underline decoration-accent decoration-[3px] underline-offset-4">Подробнее</Link></p>
        </div>
      </section>

      <section className="section border-t-2 border-ink bg-sunken">
        <div className="container-x max-w-3xl">
          <h2 className="t-h1">Частые вопросы</h2>
          <div className="mt-8 space-y-3">
            {faq.map((f) => (
              <details key={f.id} className="group rounded-[20px] border-2 border-ink bg-surface p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-extrabold">{f.question}<span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border-2 border-ink bg-accent text-xl leading-none transition group-open:rotate-45">+</span></summary>
                <p className="t-body mt-3">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-ink text-white" id="form">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="t-h1">Расскажите о задаче</h2>
            <p className="mt-4 text-lg font-medium leading-relaxed text-white/75">Ответим в течение рабочего дня и скажем честно, возьмёмся ли и с чего лучше начать.</p>
          </div>
          <LeadForm services={services.map((x) => x.title)} />
        </div>
      </section>
    </>
  );
}
