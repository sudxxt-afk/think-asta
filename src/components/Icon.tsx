import { Globe, Smartphone, LayoutDashboard, Sparkles, Workflow, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = { globe: Globe, smartphone: Smartphone, layout: LayoutDashboard, sparkles: Sparkles, workflow: Workflow };
export const ICON_KEYS = Object.keys(icons);
export function Icon({ name, className }: { name: string; className?: string }) {
  const C = icons[name] ?? Globe;
  return <C className={className} aria-hidden />;
}
