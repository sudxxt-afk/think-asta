import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "./db";

const load = unstable_cache(async () => {
  const [services, projects, steps, faq] = await Promise.all([
    db.service.findMany({ where: { visible: true }, orderBy: { sort: "asc" } }),
    db.project.findMany({ where: { published: true, inCarousel: true }, orderBy: { sort: "asc" } }),
    db.step.findMany({ orderBy: { sort: "asc" } }),
    db.faq.findMany({ where: { visible: true }, orderBy: { sort: "asc" } }),
  ]);
  return { services, projects, steps, faq };
}, ["home"], { tags: ["site"], revalidate: 60 });

export const getHome = cache(load);
