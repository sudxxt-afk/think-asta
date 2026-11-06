import { ArrowDown, ArrowUp } from "lucide-react";
import { db } from "@/lib/db";
import { ICON_KEYS } from "@/components/Icon";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteFaq, deleteService, deleteStep, move, saveFaq, saveService, saveStep } from "../../actions";

export const dynamic = "force-dynamic";

function Mover({ model, id }: { model: "service" | "faq" | "step"; id: string }) {
  return (
    <div className="flex gap-1">
      <form action={move.bind(null, model, id, -1)}><button aria-label="Выше" className="btn btn-ghost btn-sm !w-9 !px-0"><ArrowUp size={14} /></button></form>
      <form action={move.bind(null, model, id, 1)}><button aria-label="Ниже" className="btn btn-ghost btn-sm !w-9 !px-0"><ArrowDown size={14} /></button></form>
    </div>
  );
}

export default async function Content() {
  const [services, steps, faq] = await Promise.all([
    db.service.findMany({ orderBy: { sort: "asc" } }), db.step.findMany({ orderBy: { sort: "asc" } }), db.faq.findMany({ orderBy: { sort: "asc" } }),
  ]);
  const ServiceForm = ({ s }: { s?: (typeof services)[number] }) => (
    <div className="card p-5">
      <form action={saveService} className="grid gap-3">
        <input type="hidden" name="id" value={s?.id ?? ""} />
        <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
          <input name="title" className="input" placeholder="Название услуги" defaultValue={s?.title} required />
          <select name="icon" className="select h-12" defaultValue={s?.icon ?? "globe"}>{ICON_KEYS.map((k) => <option key={k}>{k}</option>)}</select>
        </div>
        <textarea name="text" className="textarea" placeholder="Описание" defaultValue={s?.text} required />
        <textarea name="points" className="textarea !min-h-24" placeholder="Пункты, каждый с новой строки" defaultValue={s?.points.join("\n")} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="visible" defaultChecked={s?.visible ?? true} /> Показывать</label>
          <button className="btn btn-primary btn-sm">{s ? "Сохранить" : "Добавить"}</button>
        </div>
      </form>
      {s && <div className="mt-3 flex gap-2"><Mover model="service" id={s.id} /><form action={deleteService.bind(null, s.id)}><ConfirmButton>Удалить</ConfirmButton></form></div>}
    </div>
  );
  return (
    <div className="space-y-12">
      <section><h1 className="t-h1">Услуги</h1><div className="mt-6 space-y-4">{services.map((s) => <ServiceForm key={s.id} s={s} />)}<ServiceForm /></div></section>
      <section>
        <h2 className="t-h2">Процесс работы</h2>
        <div className="mt-6 space-y-4">
          {[...steps, undefined].map((st) => (
            <div key={st?.id ?? "new"} className="card p-5">
              <form action={saveStep} className="grid gap-3">
                <input type="hidden" name="id" value={st?.id ?? ""} />
                <input name="title" className="input" placeholder="Название шага" defaultValue={st?.title} required />
                <textarea name="text" className="textarea !min-h-20" placeholder="Описание" defaultValue={st?.text} required />
                <div><button className="btn btn-primary btn-sm">{st ? "Сохранить" : "Добавить шаг"}</button></div>
              </form>
              {st && <div className="mt-3 flex gap-2"><Mover model="step" id={st.id} /><form action={deleteStep.bind(null, st.id)}><ConfirmButton>Удалить</ConfirmButton></form></div>}
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="t-h2">Вопросы и ответы</h2>
        <div className="mt-6 space-y-4">
          {[...faq, undefined].map((f) => (
            <div key={f?.id ?? "new"} className="card p-5">
              <form action={saveFaq} className="grid gap-3">
                <input type="hidden" name="id" value={f?.id ?? ""} />
                <input name="question" className="input" placeholder="Вопрос" defaultValue={f?.question} required />
                <textarea name="answer" className="textarea !min-h-20" placeholder="Ответ" defaultValue={f?.answer} required />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="visible" defaultChecked={f?.visible ?? true} /> Показывать</label>
                  <button className="btn btn-primary btn-sm">{f ? "Сохранить" : "Добавить вопрос"}</button>
                </div>
              </form>
              {f && <div className="mt-3 flex gap-2"><Mover model="faq" id={f.id} /><form action={deleteFaq.bind(null, f.id)}><ConfirmButton>Удалить</ConfirmButton></form></div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
