import { db } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import { deleteLead, setLeadStatus } from "../../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";
const STATUSES: [string, string][] = [["new", "Новая"], ["work", "В работе"], ["done", "Закрыта"]];

export default async function Leads() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <>
      <h1 className="t-h1">Заявки</h1>
      <ul className="mt-6 space-y-3">
        {leads.length === 0 && <li className="t-body">Заявок пока нет.</li>}
        {leads.map((l) => (
          <li key={l.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><span className="font-semibold">{l.name}</span> <span className="text-ink-2">{l.contact}</span></div>
              <time className="text-sm text-ink-3">{fmtDate(l.createdAt)}</time>
            </div>
            {l.service && <span className="chip mt-2">{l.service}</span>}
            {l.message && <p className="t-body mt-2 whitespace-pre-line text-sm">{l.message}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUSES.map(([k, label]) => (
                <form key={k} action={setLeadStatus.bind(null, l.id, k)}><button className={`chip cursor-pointer ${l.status === k ? "chip-accent" : ""}`}>{label}</button></form>
              ))}
              <form action={deleteLead.bind(null, l.id)}><ConfirmButton>Удалить</ConfirmButton></form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
