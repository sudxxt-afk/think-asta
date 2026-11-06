import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Icon } from "@/components/Icon";
import { Carousel } from "@/components/Carousel";
import { ProjectCard } from "@/components/ProjectCard";
import { LeadForm } from "@/components/LeadForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [s, services, projects, steps, faq] = await Promise.all([
    getSettings(),
    db.service.findMany({ where: { visible: true }, orderBy: { sort: "asc" } }),
    db.project.findMany({ where: { published: true, inCarousel: true }, orderBy: { sort: "asc" } }),
    db.step.findMany({ orderBy: { sort: "asc" } }),
    db.faq.findMany({ where: { visible: true }, orderBy: { sort: "asc" } }),
  ]);

  return (
    <>
      <section className="section pb-10">
        <div className="container-x">
          <p className="t-eyebrow">Think-asta</p>
          <h1 className="t-display mt-4 max-w-4xl">{s.hero_title}</h1>
          <p className="t-lead mt-6 max-w-2xl">{s.hero_text}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/contacts#form" className="btn btn-primary">Обсудить проект <ArrowRight size={18} /></Link>
            <Link href="/projects" className="btn btn-ghost">Смотреть проекты</Link>
          </div>
        </div>
      </section>

      <section id="services" className="section">
        <div className="container-x">
          <h2 className="t-h1 max-w-2xl">Чем мы занимаемся</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((sv) => (
              <article key={sv.id} className="card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-accent-soft text-accent"><Icon name={sv.icon} className="h-5 w-5" /></span>
                <h3 className="t-h3 mt-5">{sv.title}</h3>
                <p className="t-body mt-2 text-[.95rem]">{sv.text}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-ink-2">
                  {sv.points.map((p) => <li key={p} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{p}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="section bg-sunken">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <h2 className="t-h1">Выполненные проекты</h2>
              <Link href="/projects" className="hidden text-sm font-semibold text-accent-hover sm:block">Все проекты →</Link>
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
              <li key={st.id} className="card p-5">
                <span className="text-sm font-semibold text-accent">0{i + 1}</span>
                <h3 className="t-h3 mt-3">{st.title}</h3>
                <p className="t-body mt-2 text-sm">{st.text}</p>
              </li>
            ))}
          </ol>
          <p className="t-body mt-8 max-w-2xl">{s.cost_text.split(/\n\s*\n/)[0]} <Link href="/about#cost" className="text-accent-hover underline underline-offset-4">Подробнее</Link></p>
        </div>
      </section>

      <section className="section bg-sunken">
        <div className="container-x max-w-3xl">
          <h2 className="t-h1">Частые вопросы</h2>
          <div className="mt-8 divide-y divide-line rounded-[var(--radius-lg)] border border-line bg-surface">
            {faq.map((f) => (
              <details key={f.id} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{f.question}<span className="text-accent transition group-open:rotate-45 text-xl">+</span></summary>
                <p className="t-body mt-3">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="form">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="t-h1">Расскажите о задаче</h2>
            <p className="t-lead mt-4">Ответим в течение рабочего дня и скажем честно, возьмёмся ли и с чего лучше начать.</p>
          </div>
          <LeadForm services={services.map((x) => x.title)} />
        </div>
      </section>
    </>
  );
}
