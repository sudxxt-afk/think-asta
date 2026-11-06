import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [projects, carousel, posts, newLeads] = await Promise.all([
    db.project.count(), db.project.count({ where: { inCarousel: true, published: true } }),
    db.post.count({ where: { published: true } }), db.lead.count({ where: { status: "new" } }),
  ]);
  const stats = [["Новые заявки", newLeads, "/admin/leads"], ["Проектов", projects, "/admin/projects"], ["В карусели", carousel, "/admin/projects"], ["Статей", posts, "/admin/posts"]] as const;
  return (
    <>
      <h1 className="t-h1">Обзор</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([l, n, h]) => <Link key={l} href={h} className="card p-5"><div className="text-3xl font-semibold">{n}</div><div className="t-body mt-1 text-sm">{l}</div></Link>)}
      </div>
    </>
  );
}
