import { getSettings, SETTING_DEFAULTS } from "@/lib/settings";
import { saveSettings } from "../../actions";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const s = await getSettings();
  return (
    <>
      <h1 className="t-h1">Тексты и контакты</h1>
      <form action={saveSettings} className="card mt-8 grid gap-5 p-6">
        {Object.entries(SETTING_DEFAULTS).map(([k, d]) => (
          <div key={k} className="field">
            <label htmlFor={k}>{d.label}</label>
            {d.long ? <textarea id={k} name={k} className="textarea !min-h-36" defaultValue={s[k]} /> : <input id={k} name={k} className="input" defaultValue={s[k]} />}
            {d.hint && <small>{d.hint}</small>}
          </div>
        ))}
        <div><button className="btn btn-primary">Сохранить</button></div>
      </form>
    </>
  );
}
