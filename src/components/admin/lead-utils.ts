export const STATUSES = [
  { key: "new", label: "Новые", short: "Новая" },
  { key: "work", label: "В работе", short: "В работе" },
  { key: "done", label: "Успех", short: "Успех" },
  { key: "lost", label: "Отказ", short: "Отказ" },
] as const;
export type Status = (typeof STATUSES)[number]["key"];

const AVA = ["#ffd0cb", "#ffe3a8", "#c9ecd9", "#cfe0ff", "#f3d6ff", "#d9f1f0"];
export const avaColor = (s: string) => AVA[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % AVA.length];
export const initials = (name: string) =>
  name.replace(/[«»"]/g, "").split(/\s+/).filter((w) => w && !/^(ООО|ИП|АО|ЗАО|ПАО)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

export type ContactKind = "phone" | "email" | "telegram" | "other";
export function contactInfo(c: string): { kind: ContactKind; href?: string; label: string } {
  const v = c.trim();
  if (/^@[\w\d_]{3,}$/.test(v)) return { kind: "telegram", href: `https://t.me/${v.slice(1)}`, label: "Написать в Telegram" };
  const tg = v.match(/t\.me\/([\w\d_]+)/);
  if (tg) return { kind: "telegram", href: `https://t.me/${tg[1]}`, label: "Написать в Telegram" };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { kind: "email", href: `mailto:${v}`, label: "Написать письмо" };
  const digits = v.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length >= 10) return { kind: "phone", href: `tel:${digits}`, label: "Позвонить" };
  return { kind: "other", label: "" };
}

export function ago(iso: string | Date, now = Date.now()) {
  const m = Math.round((now - new Date(iso).getTime()) / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.round(h / 24);
  if (d === 1) return "вчера";
  if (d < 7) return `${d} дн назад`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
export const waitHours = (iso: string | Date, now = Date.now()) => (now - new Date(iso).getTime()) / 3600e3;

const SRC: Record<string, string> = { yandex: "Яндекс", google: "Google", telegram: "Telegram", vk: "ВКонтакте", dzen: "Дзен", bing: "Bing", direct: "Прямой заход" };
export const sourceLabel = (s: string) => (s ? SRC[s] ?? s : "Неизвестно");
