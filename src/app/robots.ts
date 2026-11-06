import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const rule = { allow: "/", disallow: ["/admin", "/api/"] };
  return {
    rules: [{ userAgent: "Yandex", ...rule }, { userAgent: "Googlebot", ...rule }, { userAgent: "*", ...rule }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
