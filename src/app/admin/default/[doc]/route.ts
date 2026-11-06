import { Fragment, isValidElement, type ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { BODIES, type Doc } from "@/components/Legal";
import { DOC_VARS } from "@/lib/doc";

// Обходит дерево стандартного текста без react-dom/server: компоненты там простые и синхронные.
function walk(n: ReactNode): string {
  if (n == null || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  if (Array.isArray(n)) return n.map(walk).join("");
  if (!isValidElement(n)) return "";
  const { type, props } = n as { type: unknown; props: { children?: ReactNode; href?: string; items?: string[] } };
  if (typeof type === "function") return walk((type as (p: unknown) => ReactNode)(props));
  const inner = walk(props.children);
  if (type === Fragment) return inner;
  switch (type) {
    case "h2": return `\n\n## ${inner.replace(/^\d+\.\s*/, "")}\n`;
    case "p": return `${inner}\n\n`;
    case "li": return `\n- ${inner}`;
    case "ul": return `${inner}\n\n`;
    case "a": return `[${inner}](${props.href})`;
    default: return inner;
  }
}

// Отдаёт стандартный текст документа в мини-разметке, чтобы его можно было править в админке.
export async function GET(_: Request, { params }: { params: Promise<{ doc: string }> }) {
  await requireAdmin();
  const { doc } = await params;
  const Body = BODIES[doc as Doc];
  if (!Body) return new Response("not found", { status: 404 });
  const s = await getSettings();
  let t = walk((Body as (p: { s: typeof s }) => ReactNode)({ s }));
  for (const k of DOC_VARS) { const v = s[k]; if (v && v.length >= 4) t = t.split(v).join(`{{${k}}}`); }
  return new Response(t.replace(/\n{3,}/g, "\n\n").trim() + "\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
}
