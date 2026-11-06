import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

const items = [["/admin", "Обзор"], ["/admin/projects", "Проекты и карусель"], ["/admin/content", "Услуги, процесс, FAQ"], ["/admin/posts", "Блог"], ["/admin/leads", "Заявки"], ["/admin/stats", "Статистика"], ["/admin/pages", "Юр. страницы"], ["/admin/configurator", "Конфигуратор"], ["/admin/settings", "Тексты и контакты"]];

export default async function Panel({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin min-h-screen bg-sunken md:flex">
      <aside className="border-b border-line bg-surface p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="font-display mb-4 text-lg font-bold">Think<span className="text-accent">-</span>asta <span className="text-xs font-normal text-ink-3">admin</span></div>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {items.map(([h, l]) => <Link key={h} href={h} className="whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-ink-2 hover:bg-sunken hover:text-ink">{l}</Link>)}
        </nav>
        <div className="mt-4 flex gap-2 border-t border-line pt-4">
          <Link href="/" target="_blank" className="btn btn-ghost btn-sm">Сайт ↗</Link>
          <form action={logout}><button className="btn btn-ghost btn-sm">Выйти</button></form>
        </div>
      </aside>
      <main className="flex-1 p-5 md:p-10"><div className="mx-auto max-w-6xl">{children}</div></main>
    </div>
  );
}
