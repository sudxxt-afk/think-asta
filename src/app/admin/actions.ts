"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { SETTING_DEFAULTS } from "@/lib/settings";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const lines = (fd: FormData, k: string) => str(fd, k).split(/\r?\n|,/).map((x) => x.trim()).filter(Boolean);
const bump = () => { revalidatePath("/", "layout"); };

export async function login(_: { error?: string }, fd: FormData) {
  const admin = await db.admin.findUnique({ where: { email: str(fd, "email").toLowerCase() } });
  if (!admin || !(await bcrypt.compare(str(fd, "password"), admin.passwordHash))) return { error: "Неверная почта или пароль" };
  await createSession(admin.id);
  redirect("/admin");
}
export async function logout() { await destroySession(); redirect("/admin/login"); }

/* Projects */
export async function saveProject(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  const data = {
    title, client: str(fd, "client"), category: str(fd, "category"), summary: str(fd, "summary"),
    task: str(fd, "task"), solution: str(fd, "solution"), result: str(fd, "result"), cover: str(fd, "cover"),
    tags: lines(fd, "tags"), published: fd.has("published"), inCarousel: fd.has("inCarousel"),
  };
  if (id === "new") {
    const max = await db.project.aggregate({ _max: { sort: true } });
    let slug = str(fd, "slug") || slugify(title);
    if (await db.project.findUnique({ where: { slug } })) slug += "-" + Date.now().toString(36).slice(-4);
    await db.project.create({ data: { ...data, slug, sort: (max._max.sort ?? 0) + 1 } });
  } else {
    await db.project.update({ where: { id }, data: { ...data, slug: str(fd, "slug") || undefined } });
  }
  bump(); redirect("/admin/projects");
}
export async function toggleProject(id: string, field: "published" | "inCarousel") {
  await requireAdmin();
  const p = await db.project.findUniqueOrThrow({ where: { id } });
  await db.project.update({ where: { id }, data: { [field]: !p[field] } });
  bump();
}
export async function deleteProject(id: string) { await requireAdmin(); await db.project.delete({ where: { id } }); bump(); }

type Sortable = "project" | "service" | "faq" | "step";
export async function move(model: Sortable, id: string, dir: -1 | 1) {
  await requireAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = db[model] as any;
  const rows: { id: string }[] = await m.findMany({ orderBy: { sort: "asc" }, select: { id: true } });
  const i = rows.findIndex((r) => r.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  await db.$transaction(rows.map((r, idx) => m.update({ where: { id: r.id }, data: { sort: idx } })));
  bump();
}

/* Services / steps / FAQ */
export async function saveService(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const data = { title: str(fd, "title"), text: str(fd, "text"), icon: str(fd, "icon") || "globe", points: lines(fd, "points"), visible: fd.has("visible") };
  if (id) await db.service.update({ where: { id }, data });
  else { const n = await db.service.count(); await db.service.create({ data: { ...data, key: slugify(data.title) + "-" + n, sort: n } }); }
  bump();
}
export async function deleteService(id: string) { await requireAdmin(); await db.service.delete({ where: { id } }); bump(); }

export async function saveStep(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const data = { title: str(fd, "title"), text: str(fd, "text") };
  if (id) await db.step.update({ where: { id }, data });
  else await db.step.create({ data: { ...data, sort: await db.step.count() } });
  bump();
}
export async function deleteStep(id: string) { await requireAdmin(); await db.step.delete({ where: { id } }); bump(); }

export async function saveFaq(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const data = { question: str(fd, "question"), answer: str(fd, "answer"), visible: fd.has("visible") };
  if (id) await db.faq.update({ where: { id }, data });
  else await db.faq.create({ data: { ...data, sort: await db.faq.count() } });
  bump();
}
export async function deleteFaq(id: string) { await requireAdmin(); await db.faq.delete({ where: { id } }); bump(); }

/* Blog */
export async function savePost(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  const data = {
    title, excerpt: str(fd, "excerpt"), body: str(fd, "body"), cover: str(fd, "cover"),
    seoTitle: str(fd, "seoTitle"), seoDesc: str(fd, "seoDesc"), published: fd.has("published"),
  };
  if (id === "new") {
    let slug = str(fd, "slug") || slugify(title);
    if (await db.post.findUnique({ where: { slug } })) slug += "-" + Date.now().toString(36).slice(-4);
    await db.post.create({ data: { ...data, slug } });
  } else await db.post.update({ where: { id }, data: { ...data, slug: str(fd, "slug") || undefined } });
  bump(); redirect("/admin/posts");
}
export async function deletePost(id: string) { await requireAdmin(); await db.post.delete({ where: { id } }); bump(); }

/* Leads & settings */
export async function setLeadStatus(id: string, status: string) { await requireAdmin(); await db.lead.update({ where: { id }, data: { status } }); revalidatePath("/admin/leads"); }
export async function deleteLead(id: string) { await requireAdmin(); await db.lead.delete({ where: { id } }); revalidatePath("/admin/leads"); }

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  await db.$transaction(Object.keys(SETTING_DEFAULTS).map((key) =>
    db.setting.upsert({ where: { key }, update: { value: str(fd, key) }, create: { key, value: str(fd, key) } })));
  bump();
}
