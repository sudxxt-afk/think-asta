import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@prisma/client";

export function ProjectCard({ p }: { p: Project }) {
  return (
    <Link href={`/projects/${p.slug}`} className="card group block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
      <div className="aspect-[4/3] bg-sunken">
        {p.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-end bg-gradient-to-br from-accent-soft to-sunken p-5 text-6xl font-semibold tracking-tighter text-accent/40">{p.title.slice(0, 1)}</div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between"><span className="chip chip-accent">{p.category}</span><ArrowUpRight size={18} className="text-ink-3 transition group-hover:text-accent" /></div>
        <h3 className="t-h3 mt-3">{p.title}</h3>
        <p className="t-body mt-1 line-clamp-2 text-sm">{p.summary}</p>
      </div>
    </Link>
  );
}
