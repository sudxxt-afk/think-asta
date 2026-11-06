import { db } from "@/lib/db";
import { ConfigEditor } from "@/components/admin/ConfigEditor";
import type { ConfigOverride } from "@/components/configurator/model";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const q = await searchParams;
  let initial: ConfigOverride | null = null;
  try { const r = await db.setting.findUnique({ where: { key: "configurator" } }); initial = r ? JSON.parse(r.value) : null; } catch {}
  return (
    <>
      <h1 className="t-h1">Конфигуратор</h1>
      <p className="t-body mt-2 text-sm">Какие блоки видит посетитель, как они называются и какие готовые схемы предлагаются. Значки и расположение на схеме остаются как есть. <a className="underline" href="/configurator" target="_blank">Открыть на сайте ↗</a></p>
      {q.saved && <p className="mt-4 text-sm font-semibold text-ok">Сохранено.</p>}
      <div className="mt-5"><ConfigEditor initial={initial} /></div>
    </>
  );
}
