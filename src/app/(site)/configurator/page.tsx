import { Configurator } from "@/components/configurator/Configurator";
import { db } from "@/lib/db";
import { getHome } from "@/lib/home";
import { MODULES, applyConfig, type ConfigOverride, type Core } from "@/components/configurator/model";

export const metadata = {
  title: "Конфигуратор: соберите систему для бизнеса",
  description: "Выберите каналы, CRM или Битрикс24, ИИ-разбор и интеграции и посмотрите, как пойдёт заявка от клиента до оплаты. Схему можно отправить нам одной кнопкой.",
  alternates: { canonical: "/configurator" },
  openGraph: { url: "/configurator" },
};

export const dynamic = "force-dynamic";

const CORE_IDS: Core[] = ["crm", "bitrix", "none"];

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  let config: ConfigOverride | null = null;
  try { const r = await db.setting.findUnique({ where: { key: "configurator" } }); config = r ? JSON.parse(r.value) : null; } catch {}
  applyConfig(config);
  const { services } = await getHome();
  const core = CORE_IDS.includes(q.core as Core) ? (q.core as Core) : "crm";
  const mods = q.m !== undefined ? q.m.split(",").filter((id) => MODULES.some((m) => m.id === id)) : ["site", "phone", "notify"];
  return (
    <section className="section pt-10">
      <div className="container-x">
        <span className="chip">Конфигуратор</span>
        <h1 className="t-h1 mt-4 max-w-3xl">Соберите систему для своего бизнеса</h1>
        <p className="t-body mt-4 max-w-2xl text-lg">Включайте то, что нужно, и смотрите, как пойдёт заявка от первого касания до оплаты. Без цен, просто схема, которую потом обсудим на созвоне.</p>
        <div className="mt-8"><Configurator initialCore={core} initialMods={mods} config={config} services={services.map((x) => x.title)} /></div>
      </div>
    </section>
  );
}
