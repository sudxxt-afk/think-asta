import { db } from "@/lib/db";
import { LeadBoard } from "@/components/admin/LeadBoard";

export const dynamic = "force-dynamic";

export default async function Leads() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return (
    <>
      <h1 className="t-h1">Заявки</h1>
      <p className="t-body mt-2 text-sm">Перетаскивайте карточки между колонками или двигайте стрелками. Клик по тексту открывает детали и время согласия.</p>
      <LeadBoard initial={leads.map((l) => ({ ...l, createdAt: l.createdAt.toISOString(), consentAt: l.consentAt?.toISOString() ?? null }))} />
    </>
  );
}
