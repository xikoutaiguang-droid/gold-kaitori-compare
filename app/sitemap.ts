import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";
import { REGION_PAGES } from "@/lib/regionPages";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/compare", "/simulator", "/finder", "/nearby", "/trend", "/about", "/guide/tax", "/privacy"];
  const regionPages = REGION_PAGES.map((r) => `/compare/${r.slug}`);

  return [...pages, ...regionPages].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/compare") ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/compare/") ? 0.6 : 0.8,
  }));
}
