import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "../actions";
import "../admin.css";

export default async function Panel({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const newLeads = await db.lead.count({ where: { status: "new" } });
  return (
    <div className="admin adm-shell">
      <aside className="adm-side">
        <Link href="/admin" className="adm-logo"><b>Think<span className="text-accent">-</span>asta</b><small>admin</small></Link>
        <AdminNav newLeads={newLeads} />
        <div className="adm-side-foot">
          <Link href="/" target="_blank" className="adm-nav-link"><ArrowUpRight size={17} aria-hidden /><span>Открыть сайт</span></Link>
          <form action={logout}><button className="adm-nav-link w-full"><LogOut size={17} aria-hidden /><span>Выйти</span></button></form>
        </div>
      </aside>
      <main className="adm-main"><div className="mx-auto max-w-[1240px]">{children}</div></main>
    </div>
  );
}
