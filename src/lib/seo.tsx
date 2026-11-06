export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const abs = (p: string) => (p.startsWith("http") ? p : SITE_URL + p);

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const crumbs = (items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
});

export function orgLd(s: Record<string, string>) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": abs("/#org"),
      name: "Think-asta",
      url: abs("/"),
      logo: abs("/icon.svg"),
      image: abs("/icon.svg"),
      description: "Разработка сайтов и мобильных приложений, внедрение CRM, ИИ-автоматизация и настройка Битрикс24.",
      email: s.email,
      telephone: s.phone,
      areaServed: { "@type": "Country", name: "Россия" },
      knowsLanguage: "ru",
      sameAs: [s.telegram],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": abs("/#site"),
      url: abs("/"),
      name: "Think-asta",
      inLanguage: "ru-RU",
      publisher: { "@id": abs("/#org") },
    },
  ];
}
