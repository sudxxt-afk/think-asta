import { db } from "@/lib/db";
import { LeadBoard } from "@/components/admin/LeadBoard";
import { PageHead } from "@/components/admin/PageHead";

export const dynamic = "force-dynamic";

export default async function Leads() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return (
    <>
      <PageHead title="Заявки" text="Перетаскивайте карточки между колонками. Клик открывает заявку целиком, стрелки ← → на выбранной карточке меняют статус." />
      <LeadBoard initial={leads.map((l) => ({ ...l, createdAt: l.createdAt.toISOString(), consentAt: l.consentAt?.toISOString() ?? null }))} />
    </>
  );
}
