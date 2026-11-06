import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Think-asta: сайты, приложения, CRM, ИИ и Битрикс24", template: "%s | Think-asta" },
  description: "Think-asta разрабатывает сайты и мобильные приложения, внедряет CRM, ИИ-автоматизацию и настраивает Битрикс24.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Unbounded:wght@600;700;800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
