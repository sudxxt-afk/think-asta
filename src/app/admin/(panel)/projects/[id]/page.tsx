import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { saveProject } from "../../../actions";
import { ImageField } from "@/components/ImageField";

export const dynamic = "force-dynamic";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "new" ? null : await db.project.findUnique({ where: { id } });
  if (id !== "new" && !p) notFound();
  return (
    <>
      <h1 className="t-h1">{p ? "Изменить проект" : "Новый проект"}</h1>
      <form action={saveProject} className="card mt-8 grid gap-5 p-6">
        <input type="hidden" name="id" value={id} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field"><label htmlFor="title">Название</label><input id="title" name="title" className="input" required defaultValue={p?.title} /></div>
          <div className="field"><label htmlFor="client">Клиент</label><input id="client" name="client" className="input" required defaultValue={p?.client} /></div>
          <div className="field"><label htmlFor="category">Категория</label><input id="category" name="category" className="input" required defaultValue={p?.category} placeholder="Сайты, Мобильные приложения, CRM, ИИ, Битрикс24" /></div>
          <div className="field"><label htmlFor="slug">Адрес страницы</label><input id="slug" name="slug" className="input" defaultValue={p?.slug} placeholder="заполнится из названия" /></div>
        </div>
        <div className="field"><label htmlFor="summary">Короткое описание</label><textarea id="summary" name="summary" className="textarea" required defaultValue={p?.summary} /><small>Показывается на карточке. Одно-два предложения.</small></div>
        <div className="field"><label htmlFor="task">Задача</label><textarea id="task" name="task" className="textarea" defaultValue={p?.task} /></div>
        <div className="field"><label htmlFor="solution">Что сделали</label><textarea id="solution" name="solution" className="textarea" defaultValue={p?.solution} /></div>
        <div className="field"><label htmlFor="result">Результат</label><textarea id="result" name="result" className="textarea" defaultValue={p?.result} /></div>
        <div className="field"><label htmlFor="tags">Теги</label><input id="tags" name="tags" className="input" defaultValue={p?.tags.join(", ")} placeholder="Next.js, Битрикс24" /></div>
        <ImageField name="cover" defaultValue={p?.cover} />
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={p?.published ?? true} /> Опубликован</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="inCarousel" defaultChecked={p?.inCarousel ?? false} /> Показывать в карусели на главной</label>
        </div>
        <div className="flex gap-3"><button className="btn btn-primary">Сохранить</button><a href="/admin/projects" className="btn btn-ghost">Отмена</a></div>
      </form>
    </>
  );
}
