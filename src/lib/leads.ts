import "server-only";

type LeadInput = { name: string; contact: string; message: string; service: string };

export async function notifyLead(l: LeadInput) {
  const text = `Новая заявка с сайта\nИмя: ${l.name}\nКонтакт: ${l.contact}\nУслуга: ${l.service || "не выбрана"}\n${l.message}`;
  const jobs: Promise<unknown>[] = [];
  const hook = process.env.BITRIX_WEBHOOK_URL;
  if (hook) {
    jobs.push(fetch(`${hook.replace(/\/$/, "")}/crm.lead.add.json`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { TITLE: `Заявка с сайта: ${l.name}`, NAME: l.name, COMMENTS: `${l.contact}\n${l.service}\n${l.message}`, SOURCE_ID: "WEB" } }),
    }));
  }
  const tg = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (tg && chat) {
    jobs.push(fetch(`https://api.telegram.org/bot${tg}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    }));
  }
  await Promise.allSettled(jobs);
}
