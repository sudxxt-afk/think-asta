import { Configurator } from "@/components/configurator/Configurator";
import { MODULES, type Core } from "@/components/configurator/model";

export const metadata = {
  title: "Конфигуратор: соберите систему для бизнеса",
  description: "Выберите каналы, CRM или Битрикс24, ИИ-разбор и интеграции и посмотрите, как пойдёт заявка от клиента до оплаты. Схему можно отправить нам одной кнопкой.",
  alternates: { canonical: "/configurator" },
  openGraph: { url: "/configurator" },
};

const CORE_IDS: Core[] = ["crm", "bitrix", "none"];

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const core = CORE_IDS.includes(q.core as Core) ? (q.core as Core) : "crm";
  const mods = q.m !== undefined ? q.m.split(",").filter((id) => MODULES.some((m) => m.id === id)) : ["site", "phone", "notify"];
  return (
    <section className="section pt-10">
      <div className="container-x">
        <span className="chip">Конфигуратор</span>
        <h1 className="t-h1 mt-4 max-w-3xl">Соберите систему для своего бизнеса</h1>
        <p className="t-body mt-4 max-w-2xl text-lg">Включайте то, что нужно, и смотрите, как пойдёт заявка от первого касания до оплаты. Без цен, просто схема, которую потом обсудим на созвоне.</p>
        <div className="mt-8"><Configurator initialCore={core} initialMods={mods} /></div>
      </div>
    </section>
  );
}
