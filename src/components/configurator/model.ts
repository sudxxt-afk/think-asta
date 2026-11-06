import { BellRing, ChartColumn, CreditCard, Database, Globe, Mail, Package, Phone, ScanSearch, Send, Smartphone, Workflow, Boxes, Layers, type LucideIcon } from "lucide-react";

export type Col = "in" | "ai" | "core" | "out";
export type Mod = { id: string; col: Col; label: string; sub: string; icon: LucideIcon; group: string };

export const MODULES: Mod[] = [
  { id: "site", col: "in", group: "Откуда приходят клиенты", label: "Сайт", sub: "заявки и заказы", icon: Globe },
  { id: "app", col: "in", group: "Откуда приходят клиенты", label: "Приложение", sub: "заказы и пуши", icon: Smartphone },
  { id: "bot", col: "in", group: "Откуда приходят клиенты", label: "Telegram-бот", sub: "запись и вопросы", icon: Send },
  { id: "phone", col: "in", group: "Откуда приходят клиенты", label: "Телефония", sub: "звонки с записью", icon: Phone },
  { id: "mail", col: "in", group: "Откуда приходят клиенты", label: "Почта", sub: "входящие письма", icon: Mail },
  { id: "ai", col: "ai", group: "Умная обработка", label: "ИИ-разбор", sub: "читает письма и звонки", icon: ScanSearch },
  { id: "robots", col: "out", group: "Умная обработка", label: "Роботы", sub: "задачи и напоминания", icon: Workflow },
  { id: "notify", col: "out", group: "Что получает команда", label: "Уведомления", sub: "заявка в Telegram за секунды", icon: BellRing },
  { id: "reports", col: "out", group: "Что получает команда", label: "Отчёты", sub: "воронка и выручка", icon: ChartColumn },
  { id: "pay", col: "out", group: "Интеграции", label: "Онлайн-оплата", sub: "статус меняется сам", icon: CreditCard },
  { id: "onec", col: "out", group: "Интеграции", label: "1С", sub: "счета и оплаты", icon: Database },
  { id: "stock", col: "out", group: "Интеграции", label: "Склад", sub: "остатки и резерв", icon: Package },
];

export const CORES = [
  { id: "crm", label: "Своя CRM", sub: "под ваш процесс", icon: Boxes },
  { id: "bitrix", label: "Битрикс24", sub: "настроим и доработаем", icon: Layers },
  { id: "none", label: "Пока нет", sub: "почта и таблицы", icon: Mail },
] as const;
export type Core = (typeof CORES)[number]["id"];

export const GROUPS = ["Откуда приходят клиенты", "Умная обработка", "Что получает команда", "Интеграции"];

export const PRESETS: { name: string; core: Core; mods: string[] }[] = [
  { name: "Отдел продаж", core: "crm", mods: ["site", "phone", "mail", "ai", "robots", "notify", "reports"] },
  { name: "Интернет-магазин", core: "crm", mods: ["site", "app", "bot", "pay", "onec", "stock", "notify"] },
  { name: "Сервисная компания", core: "bitrix", mods: ["site", "bot", "phone", "ai", "robots", "notify", "reports"] },
  { name: "Онлайн-школа", core: "crm", mods: ["site", "app", "bot", "pay", "notify", "reports"] },
];

export const byId = (id: string) => MODULES.find((m) => m.id === id);

export function flow(core: Core, on: Set<string>): string[] {
  const ins = MODULES.filter((m) => m.col === "in" && on.has(m.id)).map((m) => m.label.toLowerCase());
  const out: string[] = [];
  out.push(ins.length ? `Клиент приходит через ${joinRu(ins)}.` : "Добавьте хотя бы один канал, откуда приходят клиенты.");
  if (on.has("ai")) out.push("ИИ разбирает обращение: вытаскивает задачу, бюджет и срок, отсеивает спам.");
  if (core === "crm") out.push("Сделка появляется в CRM сама, без ручного ввода.");
  else if (core === "bitrix") out.push("Сделка создаётся в Битрикс24 и встаёт в нужную воронку.");
  else out.push("Заявки оседают в почте и таблицах, часть теряется по дороге.");
  if (core !== "none") {
    if (on.has("robots")) out.push("Роботы ставят задачи и напоминают, если клиенту не ответили вовремя.");
    if (on.has("notify")) out.push("Менеджер узнаёт о заявке в Telegram через пару секунд.");
    if (on.has("pay")) out.push("Клиент платит онлайн, статус сделки меняется сам.");
    if (on.has("onec")) out.push("Счета и оплаты синхронизируются с 1С.");
    if (on.has("stock")) out.push("Склад резервирует товар под заказ.");
    if (on.has("reports")) out.push("Руководитель видит воронку и выручку на одном экране.");
  }
  return out;
}

export function tips(core: Core, on: Set<string>): { text: string; add: string; label: string }[] {
  const ins = MODULES.filter((m) => m.col === "in" && on.has(m.id)).length;
  const t: { text: string; add: string; label: string }[] = [];
  if (!ins) t.push({ text: "Схема пустая на входе. С чего обычно начинают:", add: "site", label: "Добавить сайт" });
  if (core === "none") t.push({ text: "Без ядра заявки разбросаны по почте и мессенджерам.", add: "core:crm", label: "Добавить CRM" });
  if ((on.has("phone") || on.has("mail")) && !on.has("ai")) t.push({ text: "Звонки и письма можно разбирать без ручного труда.", add: "ai", label: "Включить ИИ-разбор" });
  if (core !== "none" && !on.has("notify")) t.push({ text: "Пусть менеджер узнаёт о заявке за секунды, а не к вечеру.", add: "notify", label: "Добавить уведомления" });
  if (core !== "none" && on.size >= 4 && !on.has("reports")) t.push({ text: "Модулей уже много, пора видеть картину целиком.", add: "reports", label: "Добавить отчёты" });
  return t.slice(0, 3);
}

function joinRu(a: string[]) {
  return a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} и ${a[a.length - 1]}`;
}

// Правки из админки: скрытые модули, свои подписи и свои готовые схемы. Применяются на месте, потому что flow/tips читают MODULES напрямую.
export type ConfigOverride = {
  hidden?: string[];
  mods?: Record<string, { label?: string; sub?: string }>;
  presets?: { name: string; core: Core; mods: string[] }[];
};
const BASE_MODULES = MODULES.map((m) => ({ ...m }));
const BASE_PRESETS = PRESETS.map((p) => ({ ...p, mods: [...p.mods] }));

export function applyConfig(c?: ConfigOverride | null) {
  const hidden = new Set(c?.hidden ?? []);
  MODULES.length = 0;
  MODULES.push(...BASE_MODULES.filter((m) => !hidden.has(m.id)).map((m) => ({ ...m, ...(c?.mods?.[m.id]?.label ? { label: c.mods[m.id].label! } : {}), ...(c?.mods?.[m.id]?.sub ? { sub: c.mods[m.id].sub! } : {}) })));
  const ids = new Set(MODULES.map((m) => m.id));
  const presets = (c?.presets?.length ? c.presets : BASE_PRESETS).map((p) => ({ ...p, mods: p.mods.filter((x) => ids.has(x)) }));
  PRESETS.length = 0;
  PRESETS.push(...presets);
}
