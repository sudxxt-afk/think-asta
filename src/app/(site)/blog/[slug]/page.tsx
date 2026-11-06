import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { fmtDate, paragraphs } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await db.post.findUnique({ where: { slug: (await params).slug } });
  return { title: p?.seoTitle || p?.title, description: p?.seoDesc || p?.excerpt, openGraph: p?.cover ? { images: [p.cover] } : undefined };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const p = await db.post.findUnique({ where: { slug: (await params).slug } });
  if (!p || !p.published) notFound();
  return (
    <article className="section">
      <div className="container-x max-w-2xl">
        <Link href="/blog" className="text-sm text-ink-3 hover:text-accent">← Блог</Link>
        <time className="mt-6 block text-sm text-ink-3">{fmtDate(p.publishedAt)}</time>
        <h1 className="t-h1 mt-2">{p.title}</h1>
        {p.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.cover} alt="" className="mt-8 w-full rounded-[var(--radius-lg)]" />}
        <div className="prose-x mt-8">{paragraphs(p.body).map((t, i) => t.startsWith("## ") ? <h2 key={i}>{t.slice(3)}</h2> : <p key={i}>{t}</p>)}</div>
      </div>
    </article>
  );
}
