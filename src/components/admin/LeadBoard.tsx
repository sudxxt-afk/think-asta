"use client";
import { useState, useTransition } from "react";
import { deleteLead, setLeadStatus } from "@/app/admin/actions";

export type LeadCard = {
  id: string; name: string; contact: string; message: string; service: string; status: string;
  source: string; campaign: string; landing: string; createdAt: string; consentAt: string | null; consentDoc: string;
};

const COLS: [string, string][] = [["new", "Новые"], ["work", "В работе"], ["done", "Успех"], ["lost", "Отказ"]];
const fmt = (iso: string) => new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function LeadBoard({ initial }: { initial: LeadCard[] }) {
  const [leads, setLeads] = useState(initial);
  const [over, setOver] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [, start] = useTransition();

  const move = (id: string, status: string) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    start(() => setLeadStatus(id, status));
  };
  const remove = (id: string) => {
    if (!confirm("Удалить заявку насовсем?")) return;
    setLeads((ls) => ls.filter((l) => l.id !== id));
    start(() => deleteLead(id));
  };

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {COLS.map(([key, label], ci) => {
        const items = leads.filter((l) => (COLS.some(([k]) => k === l.status) ? l.status : "new") === key);
        return (
          <section
            key={key}
            onDragOver={(e) => { e.preventDefault(); setOver(key); }}
            onDragLeave={() => setOver((o) => (o === key ? null : o))}
            onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, key); }}
            className={`rounded-[var(--radius-sm)] border-2 p-3 transition-colors ${over === key ? "border-accent bg-accent/10" : "border-line bg-sunken"}`}
          >
            <h2 className="mb-3 flex items-center justify-between text-sm font-extrabold">{label}<span className="chip">{items.length}</span></h2>
            <ul className="space-y-3">
              {items.length === 0 && <li className="py-6 text-center text-xs text-ink-3">Пусто</li>}
              {items.map((l) => (
                <li
                  key={l.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", l.id)}
                  className="card cursor-grab p-3 text-sm active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-2">
                    <b className="break-words">{l.name}</b>
                    <time className="shrink-0 text-xs text-ink-3">{fmt(l.createdAt)}</time>
                  </div>
                  <div className="mt-0.5 break-all text-ink-2">{l.contact}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {l.service && <span className="chip">{l.service}</span>}
                    <span className="chip">{l.source ? `↗ ${l.source}${l.campaign ? ` · ${l.campaign}` : ""}` : "источник неизвестен"}</span>
                  </div>
                  {l.message && (
                    <button type="button" onClick={() => setOpen(open === l.id ? null : l.id)} className="mt-2 block w-full text-left text-xs text-ink-2">
                      <span className={open === l.id ? "whitespace-pre-line" : "line-clamp-2"}>{l.message}</span>
                    </button>
                  )}
                  {open === l.id && (
                    <div className="mt-2 space-y-0.5 border-t border-line pt-2 text-xs text-ink-3">
                      {l.landing && <div>Первая страница: {l.landing}</div>}
                      <div>{l.consentAt ? `Согласие на обработку данных: ${fmt(l.consentAt)}${l.consentDoc ? ` (${l.consentDoc})` : ""}` : "Согласие: до введения учёта времени"}</div>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-1">
                    <div className="flex gap-1">
                      <button disabled={ci === 0} onClick={() => move(l.id, COLS[ci - 1][0])} className="btn btn-ghost btn-sm !h-7 !px-2 disabled:opacity-30" aria-label="Назад">←</button>
                      <button disabled={ci === COLS.length - 1} onClick={() => move(l.id, COLS[ci + 1][0])} className="btn btn-ghost btn-sm !h-7 !px-2 disabled:opacity-30" aria-label="Дальше">→</button>
                    </div>
                    <button onClick={() => remove(l.id)} className="text-xs text-ink-3 hover:text-ink">Удалить</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
