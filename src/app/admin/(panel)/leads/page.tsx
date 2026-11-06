import { db } from "@/lib/db";
import { LeadBoard } from "@/components/admin/LeadBoard";
import { OutreachBoard } from "@/components/admin/OutreachBoard";
import { PageHead } from "@/components/admin/PageHead";

export const dynamic = "force-dynamic";

export default async function Leads() {
  const [leads, outreach] = await Promise.all([
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    db.outreach.findMany({ orderBy: { createdAt: "desc" }, include: { events: { orderBy: { createdAt: "asc" } } } }),
  ]);
  return (
    <>
      <PageHead title="Заявки" text="Перетаскивайте карточки между колонками. Клик открывает заявку целиком, стрелки ← → на выбранной карточке меняют статус." />
      <LeadBoard initial={leads.map((l) => ({ ...l, createdAt: l.createdAt.toISOString(), consentAt: l.consentAt?.toISOString() ?? null }))} />
      <OutreachBoard initial={outreach.map((o) => ({ ...o, followUp: o.followUp?.toISOString() ?? null, createdAt: o.createdAt.toISOString(), events: o.events.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })) }))} />
    </>
  );
}
