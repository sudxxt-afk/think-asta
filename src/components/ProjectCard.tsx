import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@prisma/client";
import { ServiceArt } from "@/components/art/ServiceArt";

export function ProjectCard({ p }: { p: Project }) {
  return (
    <Link href={`/projects/${p.slug}`} className="card tile group block overflow-hidden">
      <div className="aspect-[4/3] border-b-2 border-ink bg-sunken">
        {p.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover} alt={p.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <ServiceArt category={p.category} />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between"><span className="chip chip-accent">{p.category}</span><ArrowUpRight size={18} className="transition group-hover:text-accent" /></div>
        <h3 className="t-h3 mt-3">{p.title}</h3>
        <p className="t-body mt-1 line-clamp-2 text-sm">{p.summary}</p>
      </div>
    </Link>
  );
}
