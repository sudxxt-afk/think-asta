import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { LeadForm } from "@/components/LeadForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Контакты и заявка на проект",
  description: "Свяжитесь с Think-asta: почта, телефон, Telegram и форма заявки. Отвечаем в течение рабочего дня.",
  alternates: { canonical: "/contacts" },
  openGraph: { url: "/contacts" },
};

export default async function Contacts({ searchParams }: { searchParams: Promise<{ scheme?: string }> }) {
  const { scheme } = await searchParams;
  const [s, services] = await Promise.all([getSettings(), db.service.findMany({ where: { visible: true }, orderBy: { sort: "asc" } })]);
  return (
    <section className="section">
      <div className="container-x grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="t-h1">Контакты</h1>
          <dl className="mt-8 space-y-4 t-body">
            <div><dt className="text-sm text-ink-3">Почта</dt><dd><a href={`mailto:${s.email}`} className="text-ink">{s.email}</a></dd></div>
            <div><dt className="text-sm text-ink-3">Телефон</dt><dd className="text-ink">{s.phone}</dd></div>
            <div><dt className="text-sm text-ink-3">Telegram</dt><dd><a href={s.telegram} className="text-ink">{s.telegram}</a></dd></div>
            <div><dt className="text-sm text-ink-3">Время связи</dt><dd className="text-ink">{s.hours}</dd></div>
            <div><dt className="text-sm text-ink-3">Где мы</dt><dd className="text-ink">{s.address}</dd></div>
          </dl>
        </div>
        <div id="form"><LeadForm services={services.map((x) => x.title)} defaultMessage={scheme ? `Хочу обсудить схему из конфигуратора: ${scheme.slice(0, 300)}.` : ""} /></div>
      </div>
    </section>
  );
}
