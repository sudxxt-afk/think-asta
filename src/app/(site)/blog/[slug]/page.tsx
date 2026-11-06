import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { fmtDate, paragraphs } from "@/lib/utils";
import { JsonLd, abs, crumbs } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const p = await db.post.findUnique({ where: { slug } });
  if (!p || !p.published) return { robots: { index: false } };
  const title = p.seoTitle || p.title;
  const description = p.seoDesc || p.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", title, description, url: `/blog/${slug}`, locale: "ru_RU", publishedTime: p.publishedAt.toISOString(), images: p.cover ? [p.cover] : undefined },
  };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const p = await db.post.findUnique({ where: { slug: (await params).slug } });
  if (!p || !p.published) notFound();
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.seoDesc || p.excerpt,
    image: p.cover ? [abs(p.cover)] : undefined,
    datePublished: p.publishedAt.toISOString(),
    dateModified: p.publishedAt.toISOString(),
    inLanguage: "ru-RU",
    mainEntityOfPage: abs(`/blog/${p.slug}`),
    author: { "@id": abs("/#org") },
    publisher: { "@id": abs("/#org") },
  };
  return (
    <article className="section">
      <JsonLd data={ld} />
      <JsonLd data={crumbs([["Главная", "/"], ["Блог", "/blog"], [p.title, `/blog/${p.slug}`]])} />
      <div className="container-x max-w-2xl">
        <Link href="/blog" className="text-sm text-ink-3 hover:text-accent">← Блог</Link>
        <time className="mt-6 block text-sm text-ink-3">{fmtDate(p.publishedAt)}</time>
        <h1 className="t-h1 mt-2">{p.title}</h1>
        {p.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.cover} alt={p.title} className="mt-8 w-full rounded-[var(--radius-lg)]" />}
        <div className="prose-x mt-8">{paragraphs(p.body).map((t, i) => t.startsWith("## ") ? <h2 key={i}>{t.slice(3)}</h2> : <p key={i}>{t}</p>)}</div>
      </div>
    </article>
  );
}
