import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { LEGAL, type Doc } from "@/components/Legal";
import { DocEditor } from "@/components/admin/DocEditor";

export const dynamic = "force-dynamic";

export default async function Pages({ searchParams }: { searchParams: Promise<{ doc?: string; saved?: string }> }) {
  const q = await searchParams;
  const doc = (q.doc && q.doc in LEGAL ? q.doc : "privacy") as Doc;
  const [s, row] = await Promise.all([getSettings(), db.setting.findUnique({ where: { key: `doc_${doc}` } })]);
  return (
    <>
      <h1 className="t-h1">Юридические страницы</h1>
      <p className="t-body mt-2 text-sm">Можно править текст политик прямо здесь. Реквизиты и дата редакции задаются в «Тексты и контакты». Это не юридическая консультация: перед запуском покажите тексты юристу.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {(Object.keys(LEGAL) as Doc[]).map((d) => <Link key={d} href={`/admin/pages?doc=${d}`} className={`chip ${d === doc ? "chip-accent" : ""}`}>{LEGAL[d].title}</Link>)}
      </div>
      {q.saved && <p className="mt-4 text-sm font-semibold text-ok">Сохранено.</p>}
      <div className="mt-5"><DocEditor key={doc} doc={doc} title={LEGAL[doc].title} initial={row?.value ?? ""} vars={s} /></div>
    </>
  );
}
