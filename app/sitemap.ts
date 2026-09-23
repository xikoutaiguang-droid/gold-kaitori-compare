import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";
import { REGION_PAGES } from "@/lib/regionPages";
import { getCompanies } from "@/lib/companies";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/compare",
    "/simulator",
    "/finder",
    "/nearby",
    "/trend",
    "/tools",
    "/tools/weight-converter",
    "/tools/purity-calculator",
    "/about",
    "/guide/tax",
    "/privacy",
    "/company",
    "/campaign",
    "/column",
    "/column/karat-and-price",
    "/column/what-a-gram-means",
    "/column/price-gap",
    "/column/plating-check",
    "/column/multiple-quotes",
    "/column/price-factors",
    "/column/estate-cleanup",
  ];
  const regionPages = REGION_PAGES.map((r) => `/compare/${r.slug}`);
  const companyPages = getCompanies().map((c) => `/company/${c.id}`);

  return [...pages, ...regionPages, ...companyPages].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/compare") ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/compare/") ? 0.6 : 0.8,
  }));
}
