"use client";
import { Fragment, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, AtSign, Check, Copy, Mail, MessageCircle, Phone, Search, Send, Trash2, X } from "lucide-react";
import { deleteLead, setLeadNote, setLeadStatus } from "@/app/admin/actions";
import { STATUSES, ago, avaColor, contactInfo, initials, sourceLabel, waitHours, type Status } from "./lead-utils";

export type LeadCard = {
  id: string; name: string; contact: string; message: string; service: string; status: string; note: string;
  source: string; medium: string; campaign: string; referrer: string; landing: string;
  createdAt: string; consentAt: string | null; consentDoc: string;
};

const KIND_ICON = { phone: Phone, email: Mail, telegram: Send, other: AtSign };
const norm = (s: string): Status => (STATUSES.some((x) => x.key === s) ? (s as Status) : "new");

export function LeadBoard({ initial }: { initial: LeadCard[] }) {
  const [leads, setLeads] = useState(initial);
  const [q, setQ] = useState("");
  const [src, setSrc] = useState("");
  const [period, setPeriod] = useState("all");
  const [over, setOver] = useState<Status | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [, start] = useTransition();
  const search = useRef<HTMLInputElement>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => { setLeads(initial); }, [initial]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
      if (e.key === "/" && !typing) { e.preventDefault(); search.current?.focus(); }
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const sources = useMemo(() => [...new Set(leads.map((l) => l.source))].sort(), [leads]);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    const from = period === "all" ? 0 : now - Number(period) * 864e5;
    return leads.filter((l) =>
      (!t || [l.name, l.contact, l.message, l.service, l.note].some((x) => x.toLowerCase().includes(t))) &&
      (!src || l.source === (src === "—" ? "" : src)) &&
      new Date(l.createdAt).getTime() >= from);
  }, [leads, q, src, period, now]);

  const move = (id: string, status: Status) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    start(() => setLeadStatus(id, status));
  };
  const remove = (id: string) => {
    if (!confirm("Удалить заявку насовсем? Это нельзя отменить.")) return;
    setOpenId(null);
    setLeads((ls) => ls.filter((l) => l.id !== id));
    start(() => deleteLead(id));
  };
  const saveNote = (id: string, note: string) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, note } : l)));
    start(() => setLeadNote(id, note));
  };
  const open = leads.find((l) => l.id === openId) ?? null;
  const filtered = q || src || period !== "all";

  return (
    <>
      <div className="kb-toolbar">
        <label className="kb-search">
          <Search size={16} aria-hidden />
          <input ref={search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Имя, контакт, текст заявки" aria-label="Поиск по заявкам" />
          {!q && <kbd aria-hidden>/</kbd>}
        </label>
        <select className="kb-select" value={src} onChange={(e) => setSrc(e.target.value)} aria-label="Источник">
          <option value="">Все источники</option>
          {sources.map((s) => <option key={s || "—"} value={s || "—"}>{sourceLabel(s)}</option>)}
        </select>
        <select className="kb-select" value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Период">
          <option value="all">За всё время</option><option value="7">7 дней</option><option value="30">30 дней</option>
        </select>
        {filtered && <button className="adm-btn" onClick={() => { setQ(""); setSrc(""); setPeriod("all"); }}><X size={14} />Сбросить</button>}
        <span className="kb-count">{filtered ? `Найдено ${shown.length} из ${leads.length}` : `${leads.length} заявок`}</span>
      </div>

      <div className="kb-board">
        {STATUSES.map((st, ci) => {
          const items = shown.filter((l) => norm(l.status) === st.key);
          return (
            <section
              key={st.key}
              data-st={st.key}
              className="kb-col"
              data-over={over === st.key || undefined}
              aria-label={st.label}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (over !== st.key) setOver(st.key); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null); }}
              onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, st.key); }}
            >
              <h2 className="kb-col-h"><i className="adm-dot" />{st.label}<span className="n">{items.length}</span></h2>
              <ul className="kb-list">
                {items.length === 0 && <li className="kb-empty">{drag ? "Отпустите здесь" : filtered ? "Ничего не найдено" : "Пока пусто"}</li>}
                {items.map((l) => {
                  const c = contactInfo(l.contact);
                  const KI = KIND_ICON[c.kind];
                  const wait = st.key === "new" ? waitHours(l.createdAt, now) : 0;
                  return (
                    <li
                      key={l.id}
                      data-st={st.key}
                      className="kb-card"
                      tabIndex={0}
                      draggable
                      data-dragging={drag === l.id || undefined}
                      data-fresh={(st.key === "new" && wait < 2) || undefined}
                      onDragStart={(e) => { e.dataTransfer.setData("text/plain", l.id); e.dataTransfer.effectAllowed = "move"; setDrag(l.id); }}
                      onDragEnd={() => { setDrag(null); setOver(null); }}
                      onClick={() => setOpenId(l.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setOpenId(l.id);
                        if (e.key === "ArrowRight" && ci < STATUSES.length - 1) move(l.id, STATUSES[ci + 1].key);
                        if (e.key === "ArrowLeft" && ci > 0) move(l.id, STATUSES[ci - 1].key);
                      }}
                    >
                      <div className="kb-top">
                        <span className="kb-ava" style={{ background: avaColor(l.name) }} aria-hidden>{initials(l.name)}</span>
                        <div className="min-w-0">
                          <div className="kb-name">{l.name}</div>
                          <div className="kb-meta"><KI size={11} aria-hidden /><span className="truncate">{l.contact}</span></div>
                        </div>
                      </div>
                      {l.message && <p className="kb-msg">{l.message}</p>}
                      <div className="kb-tags">
                        {l.service && <span className="kb-tag">{l.service}</span>}
                        <span className="kb-tag">{sourceLabel(l.source)}</span>
                        {l.note && <span className="kb-tag" title={l.note}><MessageCircle size={11} aria-hidden />Заметка</span>}
                        {wait >= 24 && <span className="kb-tag" data-warn>Ждёт {Math.floor(wait / 24)} дн</span>}
                      </div>
                      <div className="kb-foot" onClick={(e) => e.stopPropagation()}>
                        <span className="kb-meta grow">{ago(l.createdAt, now)}</span>
                        {c.href && <a href={c.href} target={c.kind === "telegram" ? "_blank" : undefined} rel="noreferrer" className="adm-icon-btn" title={c.label} aria-label={c.label}><KI size={14} /></a>}
                        <button className="adm-icon-btn" disabled={ci === 0} onClick={() => move(l.id, STATUSES[ci - 1].key)} title={`В «${STATUSES[ci - 1]?.label ?? ""}»`} aria-label="Назад" style={{ opacity: ci === 0 ? 0.3 : 1 }}><ArrowLeft size={14} /></button>
                        <button className="adm-icon-btn" disabled={ci === STATUSES.length - 1} onClick={() => move(l.id, STATUSES[ci + 1].key)} title={`В «${STATUSES[ci + 1]?.label ?? ""}»`} aria-label="Дальше" style={{ opacity: ci === STATUSES.length - 1 ? 0.3 : 1 }}><ArrowRight size={14} /></button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {open && <LeadDrawer lead={open} onClose={() => setOpenId(null)} onMove={move} onRemove={remove} onNote={saveNote} now={now} />}
    </>
  );
}

function LeadDrawer({ lead: l, onClose, onMove, onRemove, onNote, now }: {
  lead: LeadCard; onClose: () => void; onMove: (id: string, s: Status) => void; onRemove: (id: string) => void; onNote: (id: string, n: string) => void; now: number;
}) {
  const c = contactInfo(l.contact);
  const KI = KIND_ICON[c.kind];
  const [note, setNote] = useState(l.note);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { setNote(l.note); }, [l.id, l.note]);
  useEffect(() => { close.current?.focus(); }, [l.id]);
  const fmt = (iso: string) => new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const commit = () => { if (note !== l.note) { onNote(l.id, note); setSaved(true); setTimeout(() => setSaved(false), 1600); } };
  useEffect(() => { const t = setTimeout(commit, 800); return () => clearTimeout(t); }, [note]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows: [string, string][] = [
    ["Источник", sourceLabel(l.source)], ["Канал", l.medium], ["Кампания", l.campaign], ["Откуда перешли", l.referrer], ["Первая страница", l.landing],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <div className="dr-back" onClick={onClose} aria-hidden />
      <aside className="dr" role="dialog" aria-modal="true" aria-label={`Заявка: ${l.name}`}>
        <div className="dr-h">
          <span className="kb-ava" style={{ background: avaColor(l.name), width: 44, height: 44, borderRadius: 13, fontSize: ".9rem" }} aria-hidden>{initials(l.name)}</span>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-extrabold leading-tight">{l.name}</div>
            <div className="kb-meta mt-1">{fmt(l.createdAt)} · {ago(l.createdAt, now)}</div>
          </div>
          <button ref={close} className="adm-icon-btn" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </div>
        <div className="dr-body">
          <div>
            <div className="dr-label">Статус</div>
            <div className="dr-seg">
              {STATUSES.map((s) => (
                <button key={s.key} data-st={s.key} aria-pressed={norm(l.status) === s.key} onClick={() => onMove(l.id, s.key)}><i className="adm-dot" />{s.short}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="dr-label">Контакт</div>
            <div className="dr-contact">
              <KI size={16} aria-hidden className="shrink-0 text-ink-3" />
              <b>{l.contact}</b>
              <button className="adm-icon-btn" onClick={() => { navigator.clipboard?.writeText(l.contact); setCopied(true); setTimeout(() => setCopied(false), 1400); }} aria-label="Скопировать">{copied ? <Check size={15} /> : <Copy size={15} />}</button>
              {c.href && <a href={c.href} target={c.kind === "telegram" ? "_blank" : undefined} rel="noreferrer" className="adm-btn adm-btn-dark">{c.kind === "phone" ? "Позвонить" : c.kind === "email" ? "Письмо" : "Telegram"}</a>}
            </div>
          </div>
          {(l.service || l.message) && (
            <div>
              <div className="dr-label">Задача</div>
              {l.service && <span className="kb-tag mb-2">{l.service}</span>}
              {l.message && <p className="dr-msg">{l.message}</p>}
            </div>
          )}
          <div>
            <div className="dr-label flex items-center justify-between">Заметка {saved && <span className="normal-case tracking-normal text-[var(--color-ok)]">Сохранено</span>}</div>
            <textarea className="dr-note" value={note} onChange={(e) => setNote(e.target.value)} onBlur={commit} placeholder="Договорённости, следующий шаг, сумма. Сохраняется сама." />
          </div>
          <div>
            <div className="dr-label">Откуда пришла</div>
            <dl className="dr-dl">{rows.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
          </div>
          <div>
            <div className="dr-label">Согласие на обработку данных</div>
            <p className="text-sm font-semibold">{l.consentAt ? fmt(l.consentAt) : "Не записано: заявка пришла до включения учёта"}</p>
            {l.consentDoc && <p className="kb-meta mt-1">{l.consentDoc}</p>}
          </div>
          <button className="adm-btn mt-auto self-start !text-[#b8321f]" onClick={() => onRemove(l.id)}><Trash2 size={14} />Удалить заявку</button>
        </div>
      </aside>
    </>
  );
}
