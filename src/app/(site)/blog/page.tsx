import Link from "next/link";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Блог о сайтах, CRM, ИИ и Битрикс24",
  description: "Статьи Think-asta о разработке сайтов и приложений, внедрении CRM, автоматизации бизнеса и настройке Битрикс24.",
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog" },
};

export default async function Blog() {
  const posts = await db.post.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" } });
  return (
    <section className="section">
      <div className="container-x max-w-3xl">
        <h1 className="t-h1">Блог</h1>
        <div className="mt-8 divide-y divide-line">
          {posts.length === 0 && <p className="t-body">Статей пока нет.</p>}
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="block py-6 hover:opacity-80">
              <time className="text-sm text-ink-3">{fmtDate(p.publishedAt)}</time>
              <h2 className="t-h2 mt-1">{p.title}</h2>
              <p className="t-body mt-2">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
