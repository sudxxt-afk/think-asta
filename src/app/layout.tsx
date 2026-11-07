import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { SITE_URL } from "@/lib/seo";

const manrope = Manrope({ subsets: ["cyrillic", "latin"], variable: "--font-manrope", display: "swap" });
const unbounded = Unbounded({ subsets: ["cyrillic", "latin"], weight: ["600", "700", "800"], variable: "--font-unbounded", display: "swap" });

const description = "Think-asta разрабатывает сайты и мобильные приложения, внедряет CRM, подключает ИИ к рутине и настраивает автоматизации в Битрикс24. Работаем по всей России.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Think-asta: сайты, приложения, CRM, ИИ и Битрикс24", template: "%s | Think-asta" },
  description,
  applicationName: "Think-asta",
  appleWebApp: { capable: true, title: "Think-asta", statusBarStyle: "default" },
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "ru_RU", siteName: "Think-asta", title: "Think-asta: сайты, приложения, CRM, ИИ и Битрикс24", description, url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: false, email: false, address: false },
  verification: { google: process.env.GOOGLE_VERIFICATION || undefined, yandex: process.env.YANDEX_VERIFICATION || undefined },
};

export const viewport: Viewport = { themeColor: "#FF5A4E", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <body>{children}</body>
    </html>
  );
}
