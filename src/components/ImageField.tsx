"use client";
import { useState } from "react";

export function ImageField({ name, defaultValue = "", label = "Обложка" }: { name: string; defaultValue?: string; label?: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true); setErr("");
    const fd = new FormData(); fd.set("file", f);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) setErr(j.error ?? "Ошибка загрузки"); else setUrl(j.url);
  }
  return (
    <div className="field">
      <label>{label}</label>
      <input type="hidden" name={name} value={url} />
      {url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt="" className="h-36 w-56 rounded-[var(--radius-md)] border border-line object-cover" />}
      <div className="flex items-center gap-3">
        <input type="file" accept="image/*" onChange={onFile} className="text-sm" />
        {url && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUrl("")}>Убрать</button>}
      </div>
      {busy && <small>Загружаем…</small>}
      {err && <small className="!text-[#c0321c]">{err}</small>}
      <small>JPG, PNG, WebP или AVIF до 8 МБ</small>
    </div>
  );
}
