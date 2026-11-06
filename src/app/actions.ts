"use server";
import { z } from "zod";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { notifyLead } from "@/lib/leads";

const schema = z.object({
  name: z.string().trim().min(2, "Напишите, как к вам обращаться").max(80),
  contact: z.string().trim().min(5, "Укажите телефон, почту или Telegram").max(120),
  message: z.string().trim().max(2000).default(""),
  service: z.string().trim().max(80).default(""),
  website: z.string().max(0).optional(), // honeypot
  consent: z.literal("on", { message: "Нужно согласие на обработку персональных данных" }),
});

export type LeadState = { ok: boolean; error?: string };

export async function submitLead(_: LeadState, fd: FormData): Promise<LeadState> {
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { website: _h, consent: _c, ...data } = parsed.data;
  const jar = await cookies();
  const [source = "", medium = "", campaign = "", referrer = "", landing = ""] = decodeURIComponent(jar.get("ta_src")?.value ?? "").split("|");
  const s = await getSettings();
  await db.lead.create({ data: { ...data, source, medium, campaign, referrer, landing, consentAt: new Date(), consentDoc: `Согласие, редакция от ${s.legal_date}` } });
  await notifyLead(data);
  return { ok: true };
}
