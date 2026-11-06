"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, FolderKanban, Inbox, LayoutDashboard, LayoutGrid, Newspaper, Scale, Settings2, Workflow } from "lucide-react";

const GROUPS = [
  { title: "", items: [{ href: "/admin", label: "Обзор", icon: LayoutDashboard }] },
  { title: "Продажи", items: [{ href: "/admin/leads", label: "Заявки", icon: Inbox, badge: true }, { href: "/admin/stats", label: "Статистика", icon: ChartColumn }] },
  { title: "Сайт", items: [
    { href: "/admin/projects", label: "Проекты", icon: FolderKanban },
    { href: "/admin/content", label: "Услуги, процесс, FAQ", icon: LayoutGrid },
    { href: "/admin/posts", label: "Блог", icon: Newspaper },
    { href: "/admin/configurator", label: "Конфигуратор", icon: Workflow },
  ] },
  { title: "Настройки", items: [{ href: "/admin/settings", label: "Тексты и контакты", icon: Settings2 }, { href: "/admin/pages", label: "Юр. страницы", icon: Scale }] },
];

export function AdminNav({ newLeads }: { newLeads: number }) {
  const path = usePathname();
  const active = (h: string) => (h === "/admin" ? path === h : path.startsWith(h));
  return (
    <nav className="adm-nav" aria-label="Разделы админки">
      {GROUPS.map((g, i) => (
        <div key={i} className="adm-nav-group">
          {g.title && <div className="adm-nav-title">{g.title}</div>}
          {g.items.map(({ href, label, icon: I, ...rest }) => (
            <Link key={href} href={href} className="adm-nav-link" data-active={active(href) || undefined} aria-current={active(href) ? "page" : undefined}>
              <I size={17} strokeWidth={2} aria-hidden />
              <span>{label}</span>
              {"badge" in rest && newLeads > 0 && <b className="adm-badge" aria-label={`${newLeads} новых`}>{newLeads}</b>}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

