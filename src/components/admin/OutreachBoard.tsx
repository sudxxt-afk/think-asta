"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, AtSign, BellRing, Check, Copy, Mail, MessageCircle, Phone, Plus, Send, Trash2, X } from "lucide-react";
import { addOutreach, addOutreachNote, deleteOutreach, setOutreachFollowUp, setOutreachStatus } from "@/app/admin/actions";
import { ago, avaColor, contactInfo, initials } from "./lead-utils";

export type OutreachCard = {
  id: string; name: string; company: string; contact: string; channel: string; message: string; status: string;
  followUp: string | null; createdAt: string; events: { id: string; kind: string; text: string; createdAt: string }[];
};

const COLS = [
  { key: "sent", label: "Написали", short: "Написали" },
  { key: "replied", label: "Ответили", short: "Ответили" },
  { key: "talk", label: "Переговоры", short: "Переговоры" },
  { key: "won", label: "Договорились", short: "Финиш" },
  { key: "ignored", label: "Игнор", short: "Игнор" },
] as const;
type St = (typeof COLS)[number]["key"];
const CHANNELS: [string, string][] = [["telegram", "Telegram"], ["email", "Почта"], ["phone", "Звонок"], ["vk", "ВКонтакте"], ["other", "Другое"]];
const chLabel = (c: string) => CHANNELS.find(([k]) => k === c)?.[1] ?? c;
const ICON = { phone: Phone, email: Mail, telegram: Send, other: AtSign };
const norm = (s: string): St => (COLS.some((c) => c.key === s) ? (s as St) : "sent");
const fmtLong = (iso: string) => new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const dayKey = (iso: string) => iso.slice(0, 10);

export function OutreachBoard({ initial }: { initial: OutreachCard[] }) {
  const [items, setItems] = useState(initial);
  const [over, setOver] = useState<St | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [, start] = useTransition();

  useEffect(() => { setItems(initial); }, [initial]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpenId(null); setAdding(false); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const today = dayKey(new Date(now).toISOString());
  const overdue = (o: OutreachCard) => !!o.followUp && ["sent", "replied", "talk"].includes(norm(o.status)) && dayKey(o.followUp) <= today;
  const stats = useMemo(() => {
    const total = items.length;
    const replied = items.filter((o) => norm(o.status) !== "sent" && norm(o.status) !== "ignored").length;
    const won = items.filter((o) => norm(o.status) === "won").length;
    return { total, replied, won, due: items.filter(overdue).length };
  }, [items, today]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = (id: string, status: St) => {
    setItems((xs) => xs.map((o) => (o.id === id && norm(o.status) !== status ? { ...o, status, events: [...o.events, { id: `l${Date.now()}`, kind: "status", text: COLS.find((c) => c.key === status)!.label, createdAt: new Date().toISOString() }] } : o)));
    start(() => setOutreachStatus(id, status));
  };
  const remove = (id: string) => {
    if (!confirm("Удалить контакт и всю историю по нему?")) return;
    setOpenId(null);
    setItems((xs) => xs.filter((o) => o.id !== id));
    start(() => deleteOutreach(id));
  };
  const open = items.find((o) => o.id === openId) ?? null;

  return (
    <section id="outreach">
      <div className="out-head">
        <div>
          <h2>Рассылка</h2>
          <p className="adm-sub">Клиенты, которых мы нашли и написали сами. Путь от первого сообщения до договорённости или игнора.</p>
        </div>
        <button className="adm-btn adm-btn-dark" onClick={() => setAdding(true)}><Plus size={15} />Добавить контакт</button>
      </div>

      {items.length > 0 && (
        <div className="out-flags">
          <span>Написали: {stats.total}</span>
          <span>Ответили: {stats.replied}{stats.total ? ` · ${Math.round((stats.replied / stats.total) * 100)}%` : ""}</span>
          <span>Договорились: {stats.won}</span>
          {stats.due > 0 && <span style={{ background: "#fff1d6" }}><BellRing size={13} />Пора напомнить: {stats.due}</span>}
        </div>
      )}

      <div className="kb-board" data-cols="5">
        {COLS.map((col, ci) => {
          const list = items.filter((o) => norm(o.status) === col.key);
          return (
            <section
              key={col.key}
              data-st={col.key}
              className="kb-col"
              data-over={over === col.key || undefined}
              aria-label={col.label}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (over !== col.key) setOver(col.key); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null); }}
              onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, col.key); }}
            >
              <h3 className="kb-col-h"><i className="adm-dot" />{col.label}<span className="n">{list.length}</span></h3>
              <ul className="kb-list">
                {list.length === 0 && <li className="kb-empty">{drag ? "Отпустите здесь" : ci === 0 ? "Добавьте первый контакт" : "Пока пусто"}</li>}
                {list.map((o) => {
                  const c = contactInfo(o.contact);
                  const KI = ICON[c.kind];
                  const due = overdue(o);
                  return (
                    <li
                      key={o.id}
                      data-st={col.key}
                      className="kb-card"
                      tabIndex={0}
                      draggable
                      data-dragging={drag === o.id || undefined}
                      onDragStart={(e) => { e.dataTransfer.setData("text/plain", o.id); e.dataTransfer.effectAllowed = "move"; setDrag(o.id); }}
                      onDragEnd={() => { setDrag(null); setOver(null); }}
                      onClick={() => setOpenId(o.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setOpenId(o.id);
                        if (e.key === "ArrowRight" && ci < COLS.length - 1) move(o.id, COLS[ci + 1].key);
                        if (e.key === "ArrowLeft" && ci > 0) move(o.id, COLS[ci - 1].key);
                      }}
                    >
                      <div className="kb-top">
                        <span className="kb-ava" style={{ background: avaColor(o.name) }} aria-hidden>{initials(o.name)}</span>
                        <div className="min-w-0">
                          <div className="kb-name">{o.name}</div>
                          <div className="kb-meta"><KI size={11} aria-hidden /><span className="truncate">{o.company || o.contact}</span></div>
                        </div>
                      </div>
                      {o.message && <p className="kb-msg">{o.message}</p>}
                      <div className="kb-tags">
                        <span className="kb-tag">{chLabel(o.channel)}</span>
                        {o.events.length > 1 && <span className="kb-tag"><MessageCircle size={11} aria-hidden />{o.events.length - 1}</span>}
                        {due && <span className="kb-tag" data-warn><BellRing size={11} aria-hidden />Напомнить</span>}
                      </div>
                      <div className="kb-foot" onClick={(e) => e.stopPropagation()}>
                        <span className="kb-meta grow">{ago(o.createdAt, now)}</span>
                        {c.href && <a href={c.href} target={c.kind === "telegram" ? "_blank" : undefined} rel="noreferrer" className="adm-icon-btn" title={c.label} aria-label={c.label}><KI size={14} /></a>}
                        <button className="adm-icon-btn" disabled={ci === 0} onClick={() => move(o.id, COLS[ci - 1].key)} aria-label="Назад" style={{ opacity: ci === 0 ? 0.3 : 1 }}><ArrowLeft size={14} /></button>
                        <button className="adm-icon-btn" disabled={ci === COLS.length - 1} onClick={() => move(o.id, COLS[ci + 1].key)} aria-label="Дальше" style={{ opacity: ci === COLS.length - 1 ? 0.3 : 1 }}><ArrowRight size={14} /></button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {adding && <AddDrawer onClose={() => setAdding(false)} />}
      {open && <OutDrawer o={open} now={now} onClose={() => setOpenId(null)} onMove={move} onRemove={remove} />}
    </section>
  );
}

function AddDrawer({ onClose }: { onClose: () => void }) {
  const first = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  useEffect(() => { first.current?.focus(); }, []);
  return (
    <>
      <div className="dr-back" onClick={onClose} aria-hidden />
      <aside className="dr" role="dialog" aria-modal="true" aria-label="Новый контакт">
        <div className="dr-h">
          <div className="min-w-0 flex-1"><div className="text-lg font-extrabold">Новый контакт</div><div className="kb-meta mt-1">Кому мы написали первыми</div></div>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </div>
        <form className="dr-body out-form" action={(fd) => start(async () => { await addOutreach(fd); onClose(); })}>
          <label>Имя или название<input ref={first} name="name" required minLength={2} placeholder="Иван Петров" /></label>
          <label>Компания <span className="font-medium adm-muted">(необязательно)</span><input name="company" placeholder="ООО «Ромашка»" /></label>
          <div className="grid grid-cols-[1fr_1.4fr] gap-3">
            <label>Канал<select name="channel" defaultValue="telegram">{CHANNELS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label>Контакт<input name="contact" required minLength={3} placeholder="@username, почта или телефон" /></label>
          </div>
          <label>Что мы написали<textarea name="message" rows={5} placeholder="Текст первого сообщения или суть предложения" /></label>
          <label>Напомнить о себе<input type="date" name="followUp" /></label>
          <div className="mt-2 flex gap-2"><button className="adm-btn adm-btn-accent !h-10" disabled={pending}>{pending ? "Добавляю…" : "Добавить в «Написали»"}</button><button type="button" className="adm-btn !h-10" onClick={onClose}>Отмена</button></div>
        </form>
      </aside>
    </>
  );
}

function OutDrawer({ o, now, onClose, onMove, onRemove }: { o: OutreachCard; now: number; onClose: () => void; onMove: (id: string, s: St) => void; onRemove: (id: string) => void }) {
  const c = contactInfo(o.contact);
  const KI = ICON[c.kind];
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [follow, setFollow] = useState(o.followUp ? dayKey(o.followUp) : "");
  const [events, setEvents] = useState(o.events);
  const [, start] = useTransition();
  useEffect(() => { setEvents(o.events); setFollow(o.followUp ? dayKey(o.followUp) : ""); setNote(""); }, [o.id, o.events, o.followUp]);
  const addNote = () => {
    const t = note.trim();
    if (!t) return;
    setEvents((e) => [...e, { id: `n${Date.now()}`, kind: "note", text: t, createdAt: new Date().toISOString() }]);
    setNote("");
    start(() => addOutreachNote(o.id, t));
  };
  const cur = norm(o.status);
  return (
    <>
      <div className="dr-back" onClick={onClose} aria-hidden />
      <aside className="dr" role="dialog" aria-modal="true" aria-label={`Контакт: ${o.name}`}>
        <div className="dr-h">
          <span className="kb-ava" style={{ background: avaColor(o.name), width: 44, height: 44, borderRadius: 13, fontSize: ".9rem" }} aria-hidden>{initials(o.name)}</span>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-extrabold leading-tight">{o.name}</div>
            <div className="kb-meta mt-1">{o.company ? `${o.company} · ` : ""}написали {ago(o.createdAt, now)}</div>
          </div>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </div>
        <div className="dr-body">
          <div>
            <div className="dr-label">Этап</div>
            <div className="dr-seg" data-n="5">
              {COLS.map((s) => <button key={s.key} data-st={s.key} aria-pressed={cur === s.key} onClick={() => onMove(o.id, s.key)}><i className="adm-dot" />{s.short}</button>)}
            </div>
          </div>
          <div>
            <div className="dr-label">Контакт · {chLabel(o.channel)}</div>
            <div className="dr-contact">
              <KI size={16} aria-hidden className="shrink-0" />
              <b>{o.contact}</b>
              <button className="adm-icon-btn" onClick={() => { navigator.clipboard?.writeText(o.contact); setCopied(true); setTimeout(() => setCopied(false), 1400); }} aria-label="Скопировать">{copied ? <Check size={15} /> : <Copy size={15} />}</button>
              {c.href && <a href={c.href} target={c.kind === "telegram" ? "_blank" : undefined} rel="noreferrer" className="adm-btn adm-btn-dark">{c.kind === "phone" ? "Позвонить" : c.kind === "email" ? "Письмо" : "Telegram"}</a>}
            </div>
          </div>
          <div>
            <div className="dr-label">Напомнить о себе</div>
            <div className="out-form"><input type="date" value={follow} onChange={(e) => { setFollow(e.target.value); start(() => setOutreachFollowUp(o.id, e.target.value)); }} /></div>
          </div>
          <div>
            <div className="dr-label">История</div>
            <ol className="tl">
              {events.map((e) => (
                <li key={e.id} data-note={e.kind === "note" || undefined} data-st={e.kind === "status" ? COLS.find((c) => e.text.startsWith(c.label))?.key : undefined}>
                  <span className="whitespace-pre-line">{e.text}</span>
                  <time>{fmtLong(e.createdAt)}</time>
                </li>
              ))}
            </ol>
            <div className="out-form mt-4">
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote(); }} placeholder="Что ответили, о чём договорились" />
              <button className="adm-btn adm-btn-dark self-start" onClick={addNote} disabled={!note.trim()}>Добавить в историю</button>
            </div>
          </div>
          <button className="adm-btn mt-auto self-start !text-[#b8321f]" onClick={() => onRemove(o.id)}><Trash2 size={14} />Удалить контакт</button>
        </div>
      </aside>
    </>
  );
}
