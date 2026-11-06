"use client";
import { useActionState } from "react";
import { submitLead, type LeadState } from "@/app/actions";

export function LeadForm({ services }: { services: string[] }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { ok: false });
  if (state.ok)
    return (
      <div className="card p-8" role="status">
        <h3 className="t-h3">Заявка отправлена</h3>
        <p className="t-body mt-2">Спасибо. Мы свяжемся с вами в ближайший рабочий день.</p>
      </div>
    );
  return (
    <form action={action} className="card grid gap-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field"><label htmlFor="name">Имя</label><input id="name" name="name" className="input" required autoComplete="name" /></div>
        <div className="field"><label htmlFor="contact">Телефон, почта или Telegram</label><input id="contact" name="contact" className="input" required /></div>
      </div>
      <div className="field">
        <label htmlFor="service">Что нужно сделать</label>
        <select id="service" name="service" className="select h-12" defaultValue="">
          <option value="">Пока не знаю, нужен совет</option>
          {services.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="field"><label htmlFor="message">Коротко о задаче</label><textarea id="message" name="message" className="textarea" /></div>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error && <p className="text-sm text-[#c0321c]" role="alert">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Отправляем…" : "Отправить заявку"}</button>
    </form>
  );
}
