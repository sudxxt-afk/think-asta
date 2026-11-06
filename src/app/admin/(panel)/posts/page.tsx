import Link from "next/link";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import { deletePost } from "../../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function AdminPosts() {
  const posts = await db.post.findMany({ orderBy: { publishedAt: "desc" } });
  return (
    <>
      <div className="flex items-center justify-between"><h1 className="t-h1">Блог</h1><Link href="/admin/posts/new" className="btn btn-primary">Написать</Link></div>
      <ul className="mt-6 space-y-3">
        {posts.length === 0 && <li className="t-body">Статей пока нет.</li>}
        {posts.map((p) => (
          <li key={p.id} className="card flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1"><div className="truncate font-semibold">{p.title}</div><div className="text-sm text-ink-3">{fmtDate(p.publishedAt)}</div></div>
            <span className={`chip ${p.published ? "chip-accent" : ""}`}>{p.published ? "Опубликована" : "Черновик"}</span>
            <Link href={`/admin/posts/${p.id}`} className="btn btn-ghost btn-sm">Изменить</Link>
            <form action={deletePost.bind(null, p.id)}><ConfirmButton>Удалить</ConfirmButton></form>
          </li>
        ))}
      </ul>
    </>
  );
}
