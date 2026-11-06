"use client";
import { usePathname } from "next/navigation";

export function MissingPath() {
  const p = usePathname();
  return <>{p.length > 34 ? `${p.slice(0, 33)}…` : p}</>;
}
