"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: number) => ref.current?.scrollBy({ left: d * 440, behavior: "smooth" });
  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button aria-label="Назад" onClick={() => go(-1)} className="btn btn-ghost btn-sm !w-10 !px-0"><ChevronLeft size={18} /></button>
        <button aria-label="Вперёд" onClick={() => go(1)} className="btn btn-ghost btn-sm !w-10 !px-0"><ChevronRight size={18} /></button>
      </div>
      <div ref={ref} className="carousel" tabIndex={0} aria-label="Проекты">{children}</div>
    </div>
  );
}
