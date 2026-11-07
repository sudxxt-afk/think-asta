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
export const labelOf = (id: string) => (id.startsWith("core:") ? CORES.find((c) => `core:${c.id}` === id)?.label : byId(id)?.label) ?? id;

// Each step names the node it happens at, so the diagram can play the same story the list tells
export type Step = { id: string; text: string };
const OUT_STEPS: [string, string][] = [
  ["robots", "Роботы ставят задачи и напоминают, если клиенту не ответили вовремя."],
  ["notify", "Менеджер узнаёт о заявке в Telegram через пару секунд."],
  ["pay", "Клиент платит онлайн, статус сделки меняется сам."],
  ["onec", "Счета и оплаты синхронизируются с 1С."],
  ["stock", "Склад резервирует товар под заказ."],
  ["reports", "Руководитель видит воронку и выручку на одном экране."],
];

export function flow(core: Core, on: Set<string>): Step[] {
  const ins = MODULES.filter((m) => m.col === "in" && on.has(m.id)).map((m) => m.label.toLowerCase());
  const out: Step[] = [];
  out.push({ id: "in", text: ins.length ? `Клиент приходит через ${joinRu(ins)}.` : "Добавьте хотя бы один канал, откуда приходят клиенты." });
  if (on.has("ai")) out.push({ id: "ai", text: "ИИ разбирает обращение: вытаскивает задачу, бюджет и срок, отсеивает спам." });
  if (core === "crm") out.push({ id: "core", text: "Сделка появляется в CRM сама, без ручного ввода." });
  else if (core === "bitrix") out.push({ id: "core", text: "Сделка создаётся в Битрикс24 и встаёт в нужную воронку." });
  else out.push({ id: "core", text: "Заявки оседают в почте и таблицах, часть теряется по дороге." });
  if (core !== "none") for (const [id, text] of OUT_STEPS) if (on.has(id) && byId(id)) out.push({ id, text });
  return out;
}

// What the visitor wants to fix, mapped onto modules. A goal is on when everything it needs is on.
export type Goal = { id: string; label: string; mods: string[]; core?: boolean };
export const GOALS: Goal[] = [
  { id: "lose", label: "Не терять заявки", mods: ["notify", "robots"], core: true },
  { id: "fast", label: "Отвечать быстрее", mods: ["bot", "notify", "ai"] },
  { id: "manual", label: "Меньше ручной работы", mods: ["ai", "robots", "onec"], core: true },
  { id: "pay", label: "Принимать оплату онлайн", mods: ["site", "pay"], core: true },
  { id: "stock", label: "Связать склад и 1С", mods: ["onec", "stock"], core: true },
  { id: "numbers", label: "Видеть цифры", mods: ["reports"], core: true },
];
export const goalMods = (g: Goal) => g.mods.filter((id) => byId(id));
export const goalOn = (g: Goal, core: Core, on: Set<string>) => (!g.core || core !== "none") && goalMods(g).every((id) => on.has(id));

// Launch order: what goes live first so the business feels it early, then what builds on it
export function plan(core: Core, on: Set<string>): { title: string; note: string; ids: string[] }[] {
  const has = (ids: string[]) => ids.filter((id) => on.has(id) && byId(id));
  const ins = MODULES.filter((m) => m.col === "in" && on.has(m.id)).map((m) => m.id);
  const phases = [
    { title: "Фундамент", note: "заявки со всех каналов попадают в одно место", ids: [...(core === "none" ? [] : [`core:${core}`]), ...ins] },
    { title: "Скорость", note: "ни одна заявка не ждёт до вечера", ids: has(["notify", "robots"]) },
    { title: "Автоматизация", note: "рутину берут на себя ИИ и интеграции", ids: has(["ai", "pay", "onec", "stock"]) },
    { title: "Контроль", note: "решения по цифрам, а не по ощущениям", ids: has(["reports"]) },
  ];
  return phases.filter((p) => p.ids.length);
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
