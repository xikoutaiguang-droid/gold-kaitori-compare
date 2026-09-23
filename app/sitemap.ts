import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";
import { REGION_PAGES } from "@/lib/regionPages";
import { getCompanies } from "@/lib/companies";
import { COLUMNS } from "@/lib/columns";

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
  ];
  // コラムは一覧(lib/columns.ts)から引く。sitemapに手書きで並べると、
  // 記事を足したときにどちらかが漏れて、載せたのに登録されない状態になる。
  const columnPages = COLUMNS.map((c) => c.href);
  const regionPages = REGION_PAGES.map((r) => `/compare/${r.slug}`);
  const companyPages = getCompanies().map((c) => `/company/${c.id}`);

  return [...pages, ...columnPages, ...regionPages, ...companyPages].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/compare") ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/compare/") ? 0.6 : 0.8,
  }));
}
