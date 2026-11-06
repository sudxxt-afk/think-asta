"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const KEY = "ta_cookies";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const router = useRouter();
  useEffect(() => { setShow(!document.cookie.split("; ").some((c) => c.startsWith(`${KEY}=`))); }, []);
  if (!show) return null;
  const choose = (v: "all" | "necessary") => {
    document.cookie = `${KEY}=${v}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setShow(false);
    router.refresh();
  };
  return (
    <div role="dialog" aria-label="Файлы cookie" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-[20px] border-2 border-ink bg-surface p-5 shadow-[6px_6px_0_0_var(--color-ink)]">
      <p className="text-sm font-medium leading-relaxed">Мы используем cookie, чтобы сайт работал, и, с вашего согласия, аналитику Яндекс Метрики и Google. Подробнее в <Link href="/cookies" className="font-extrabold underline decoration-accent decoration-[3px] underline-offset-4">политике cookie</Link>.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={() => choose("all")} className="btn btn-dark btn-sm">Принять всё</button>
        <button onClick={() => choose("necessary")} className="btn btn-ghost btn-sm">Только необходимые</button>
      </div>
    </div>
  );
}
