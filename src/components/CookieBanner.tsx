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
    <div role="dialog" aria-label="Файлы cookie" className="fixed bottom-3 left-3 right-3 z-50 flex flex-col gap-3 rounded-[16px] border-2 border-ink bg-surface p-3 text-xs font-medium leading-snug sm:right-auto sm:max-w-sm sm:flex-row sm:items-center sm:text-[13px]">
      <p>Cookie нужны для работы сайта и, с вашего согласия, для аналитики. <Link href="/cookies" className="font-extrabold underline decoration-accent decoration-2 underline-offset-2">Подробнее</Link></p>
      <div className="flex shrink-0 gap-2">
        <button onClick={() => choose("all")} className="btn btn-dark btn-sm !h-8 !px-3 !text-xs">Принять</button>
        <button onClick={() => choose("necessary")} className="btn btn-ghost btn-sm !h-8 !px-3 !text-xs">Нет</button>
      </div>
    </div>
  );
}
