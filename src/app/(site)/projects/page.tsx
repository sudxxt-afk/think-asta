import { db } from "@/lib/db";
import { ProjectCard } from "@/components/ProjectCard";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Наши проекты: сайты, приложения, CRM и автоматизации",
  description: "Выполненные проекты Think-asta: сайты, мобильные приложения, CRM и автоматизации в Битрикс24. Что была за задача, что сделали и какой получился результат.",
  alternates: { canonical: "/projects" },
  openGraph: { url: "/projects" },
};

export default async function Projects() {
  const projects = await db.project.findMany({ where: { published: true }, orderBy: { sort: "asc" } });
  return (
    <section className="section">
      <div className="container-x">
        <h1 className="t-h1">Проекты</h1>
        <p className="t-lead mt-3 max-w-2xl">Несколько работ, за которые нам не стыдно.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{projects.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      </div>
    </section>
  );
}
