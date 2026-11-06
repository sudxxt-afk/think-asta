import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { paragraphs } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "О команде Think-asta: как мы работаем и считаем стоимость",
  description: "Think-asta это небольшая команда разработчиков и аналитиков. Рассказываем, как строим проекты, из каких этапов они состоят и как считаем стоимость.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default async function About() {
  const [s, steps] = await Promise.all([getSettings(), db.step.findMany({ orderBy: { sort: "asc" } })]);
  return (
    <section className="section">
      <div className="container-x max-w-3xl">
        <h1 className="t-h1">О нас</h1>
        <div className="prose-x mt-8">{paragraphs(s.about_text).map((t, i) => <p key={i}>{t}</p>)}</div>
        <h2 className="t-h2 mt-14">Процесс работы</h2>
        <ol className="mt-6 space-y-4">
          {steps.map((st, i) => (
            <li key={st.id} className="card flex gap-4 p-5">
              <span className="font-semibold text-accent">0{i + 1}</span>
              <div><h3 className="t-h3">{st.title}</h3><p className="t-body mt-1 text-sm">{st.text}</p></div>
            </li>
          ))}
        </ol>
        <h2 id="cost" className="t-h2 mt-14">Как мы считаем стоимость</h2>
        <div className="prose-x mt-4">{paragraphs(s.cost_text).map((t, i) => <p key={i}>{t}</p>)}</div>
      </div>
    </section>
  );
}
