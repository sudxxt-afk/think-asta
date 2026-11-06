import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { savePost } from "../../../actions";
import { ImageField } from "@/components/ImageField";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "new" ? null : await db.post.findUnique({ where: { id } });
  if (id !== "new" && !p) notFound();
  return (
    <>
      <h1 className="t-h1">{p ? "Изменить статью" : "Новая статья"}</h1>
      <form action={savePost} className="card mt-8 grid gap-5 p-6">
        <input type="hidden" name="id" value={id} />
        <div className="field"><label htmlFor="title">Заголовок</label><input id="title" name="title" className="input" required defaultValue={p?.title} /></div>
        <div className="field"><label htmlFor="excerpt">Анонс</label><textarea id="excerpt" name="excerpt" className="textarea !min-h-20" required defaultValue={p?.excerpt} /></div>
        <div className="field"><label htmlFor="body">Текст</label><textarea id="body" name="body" className="textarea !min-h-80" required defaultValue={p?.body} /><small>Абзацы разделяйте пустой строкой. Подзаголовок: строка, начинающаяся с «## ».</small></div>
        <ImageField name="cover" defaultValue={p?.cover} />
        <fieldset className="grid gap-4 rounded-[var(--radius-md)] border border-line p-4">
          <legend className="px-2 text-sm font-semibold">SEO</legend>
          <div className="field"><label htmlFor="slug">Адрес страницы</label><input id="slug" name="slug" className="input" defaultValue={p?.slug} placeholder="заполнится из заголовка" /></div>
          <div className="field"><label htmlFor="seoTitle">Title</label><input id="seoTitle" name="seoTitle" className="input" defaultValue={p?.seoTitle} maxLength={70} /></div>
          <div className="field"><label htmlFor="seoDesc">Description</label><textarea id="seoDesc" name="seoDesc" className="textarea !min-h-20" defaultValue={p?.seoDesc} maxLength={170} /></div>
        </fieldset>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={p?.published ?? false} /> Опубликована</label>
        <div className="flex gap-3"><button className="btn btn-primary">Сохранить</button><a href="/admin/posts" className="btn btn-ghost">Отмена</a></div>
      </form>
    </>
  );
}
