import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { abs } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    db.project.findMany({ where: { published: true }, select: { slug: true, createdAt: true } }),
    db.post.findMany({ where: { published: true }, select: { slug: true, publishedAt: true } }),
  ]);
  return [
    { url: abs("/"), changeFrequency: "weekly", priority: 1 },
    { url: abs("/configurator"), changeFrequency: "monthly", priority: 0.8 },
    { url: abs("/projects"), changeFrequency: "weekly", priority: 0.8 },
    { url: abs("/blog"), changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: abs("/contacts"), changeFrequency: "monthly", priority: 0.6 },
    ...["/privacy", "/consent", "/terms", "/cookies"].map((u) => ({ url: abs(u), changeFrequency: "yearly" as const, priority: 0.2 })),
    ...projects.map((p) => ({ url: abs(`/projects/${p.slug}`), lastModified: p.createdAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: p.publishedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
