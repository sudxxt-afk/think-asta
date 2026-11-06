"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { trackVisit } from "@/app/track";

const hosts: [RegExp, string][] = [
  [/yandex\.|ya\.ru/, "yandex"], [/google\./, "google"], [/t\.me|telegram/, "telegram"], [/vk\.com|vk\.ru/, "vk"], [/dzen\./, "dzen"], [/bing\./, "bing"],
];

export function readSrc(): string[] | null {
  const m = document.cookie.split("; ").find((c) => c.startsWith("ta_src="));
  return m ? decodeURIComponent(m.slice(7)).split("|") : null;
}

// Работает только если посетитель принял cookie: тогда пишем первый источник в ta_src и считаем просмотры.
export function Track() {
  const path = usePathname();
  const [tick, setTick] = useState(0);
  useEffect(() => { const f = () => setTick((n) => n + 1); window.addEventListener("ta-consent", f); return () => window.removeEventListener("ta-consent", f); }, []);
  useEffect(() => {
    if (!document.cookie.split("; ").includes("ta_cookies=all") || path.startsWith("/admin")) return;
    let src = readSrc();
    const fresh = !src;
    if (!src) {
      const q = new URLSearchParams(location.search);
      let ref = "";
      try { ref = document.referrer ? new URL(document.referrer).hostname : ""; } catch {}
      if (ref === location.hostname) ref = "";
      const name = q.get("utm_source") || hosts.find(([re]) => re.test(ref))?.[1] || ref || "direct";
      const medium = q.get("utm_medium") || (ref && !q.get("utm_source") ? "referral" : "");
      src = [name, medium, q.get("utm_campaign") || "", ref, path].map((x) => x.replace(/\|/g, ""));
      document.cookie = `ta_src=${encodeURIComponent(src.join("|"))}; Path=/; Max-Age=${60 * 60 * 24 * 90}; SameSite=Lax`;
    }
    trackVisit(path, src[0], window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop", fresh).catch(() => {});
  }, [path, tick]);
  return null;
}
