import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await db.project.findUnique({ where: { slug: (await params).slug } });
  return { title: p?.title ?? "Проект", description: p?.summary };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await db.project.findUnique({ where: { slug: (await params).slug } });
  if (!p || !p.published) notFound();
  const blocks = [["Задача", p.task], ["Что сделали", p.solution], ["Результат", p.result]].filter(([, t]) => t);
  return (
    <article className="section">
      <div className="container-x max-w-3xl">
        <Link href="/projects" className="text-sm text-ink-3 hover:text-accent">← Все проекты</Link>
        <div className="mt-6 flex flex-wrap gap-2"><span className="chip chip-accent">{p.category}</span>{p.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        <h1 className="t-h1 mt-4">{p.title}</h1>
        <p className="t-lead mt-3">{p.summary}</p>
        {p.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.cover} alt={p.title} className="mt-8 w-full rounded-[var(--radius-lg)] border border-line" />}
        <div className="mt-10 space-y-8">
          {blocks.map(([h, t]) => <section key={h}><h2 className="t-h2">{h}</h2><p className="t-body mt-2 whitespace-pre-line">{t}</p></section>)}
        </div>
        <Link href="/contacts#form" className="btn btn-primary mt-12">Хочу такой же проект</Link>
      </div>
    </article>
  );
}
