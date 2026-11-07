import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Think-asta: сайты, приложения, CRM, ИИ и Битрикс24",
    short_name: "Think-asta",
    description: "Сайты и мобильные приложения, CRM, ИИ и автоматизации в Битрикс24.",
    lang: "ru",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FF5A4E",
    theme_color: "#FF5A4E",
    icons: [
      { src: "/pwa/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
