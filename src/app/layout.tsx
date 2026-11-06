import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Think-asta: сайты, приложения, CRM, ИИ и Битрикс24", template: "%s | Think-asta" },
  description: "Think-asta разрабатывает сайты и мобильные приложения, внедряет CRM, ИИ-автоматизацию и настраивает Битрикс24.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
