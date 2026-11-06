import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { db } from "@/lib/db";
import { deleteProject, move, toggleProject } from "../../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function AdminProjects() {
  const projects = await db.project.findMany({ orderBy: { sort: "asc" } });
  return (
    <>
      <div className="flex items-center justify-between"><h1 className="t-h1">Проекты</h1><Link href="/admin/projects/new" className="btn btn-primary">Добавить</Link></div>
      <p className="t-body mt-2">Порядок здесь совпадает с порядком в карусели на главной и на странице проектов.</p>
      <ul className="mt-6 space-y-3">
        {projects.map((p, i) => (
          <li key={p.id} className="card flex flex-wrap items-center gap-3 p-4">
            <div className="flex flex-col">
              <form action={move.bind(null, "project", p.id, -1)}><button disabled={i === 0} aria-label="Выше" className="p-1 text-ink-3 hover:text-ink disabled:opacity-30"><ArrowUp size={16} /></button></form>
              <form action={move.bind(null, "project", p.id, 1)}><button disabled={i === projects.length - 1} aria-label="Ниже" className="p-1 text-ink-3 hover:text-ink disabled:opacity-30"><ArrowDown size={16} /></button></form>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.cover ? <img src={p.cover} alt="" className="h-14 w-20 rounded-[var(--radius-sm)] object-cover" /> : <div className="h-14 w-20 rounded-[var(--radius-sm)] bg-sunken" />}
            <div className="min-w-0 flex-1"><div className="truncate font-semibold">{p.title}</div><div className="text-sm text-ink-3">{p.category}</div></div>
            <form action={toggleProject.bind(null, p.id, "inCarousel")}><button className={`chip cursor-pointer ${p.inCarousel ? "chip-accent" : ""}`}>{p.inCarousel ? "В карусели" : "Не в карусели"}</button></form>
            <form action={toggleProject.bind(null, p.id, "published")}><button className={`chip cursor-pointer ${p.published ? "chip-accent" : ""}`}>{p.published ? "Опубликован" : "Черновик"}</button></form>
            <Link href={`/admin/projects/${p.id}`} className="btn btn-ghost btn-sm">Изменить</Link>
            <form action={deleteProject.bind(null, p.id)}><ConfirmButton>Удалить</ConfirmButton></form>
          </li>
        ))}
      </ul>
    </>
  );
}
