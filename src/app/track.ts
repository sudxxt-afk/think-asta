"use server";
import { db } from "@/lib/db";

const clip = (v: unknown, n = 120) => String(v ?? "").slice(0, n);

export async function trackVisit(path: string, source: string, device: string, newVisitor: boolean) {
  await db.visit.create({ data: { path: clip(path, 200), source: clip(source, 60), device: device === "mobile" ? "mobile" : "desktop", newVisitor } });
}

export async function logConsent(choice: string) {
  if (choice !== "all" && choice !== "necessary") return;
  await db.consentEvent.create({ data: { choice } });
}
