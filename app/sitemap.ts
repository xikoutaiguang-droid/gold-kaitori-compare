import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";
import { REGION_PAGES } from "@/lib/regionPages";
import { PURITY_PAGES } from "@/lib/purityPages";
import { getCompanies } from "@/lib/companies";
import { COLUMNS } from "@/lib/columns";
import articleDates from "@/data/articleDates.json";

/**
 * lastModified は「本当に分かっている日付」だけを出す。
 *
 * 以前は全URLに new Date() を入れていた。ビルドのたびに全ページが
 * 「たった今更新された」と申告することになり、実際には何か月も変えていない
 * ページまで毎日更新扱いになる。クローラ側で割り引かれるだけでなく、
 * こちらの出す日付が信用されなくなるので、記事は git の履歴から、
 * 価格で変わるページはその価格の公表日から出し、分からないページには付けない。
 */

const articles = articleDates.articles as Record<string, { published: string; modified: string }>;

/** 価格の公表日(YYYY-MM-DD)を日時にする。日本時間の0時として扱う */
function fromPriceDate(date: string | null | undefined): Date | undefined {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  return new Date(`${date}T00:00:00+09:00`);
}

/** 各社の公表日のうち最も新しいもの。価格を並べているページの更新日にあたる */
function latestPriceDate(): Date | undefined {
  const dates = getCompanies()
    .map((c) => c.priceData.updatedAt)
    .filter((d): d is string => Boolean(d))
    .sort();
  return fromPriceDate(dates[dates.length - 1]);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const priceDate = latestPriceDate();

  /** 価格が変われば中身が変わるページ */
  const pricePages = ["", "/compare", "/trend", "/drivers", "/simulator"];
  const staticPages = [
    "/finder",
    "/nearby",
    "/tools",
    "/tools/weight-converter",
    "/tools/purity-calculator",
    "/about",
    "/privacy",
    "/company",
    "/campaign",
    "/column",
  ];
  // コラムは一覧(lib/columns.ts)から引く。sitemapに手書きで並べると、
  // 記事を足したときにどちらかが漏れて、載せたのに登録されない状態になる。
  const columnPages = COLUMNS.map((c) => c.href);
  const regionPages = REGION_PAGES.map((r) => `/compare/${r.slug}`);
  const purityPages = PURITY_PAGES.map((p) => `/price/${p.slug}`);

  const entries: MetadataRoute.Sitemap = [];
  const push = (path: string, lastModified: Date | undefined, priority: number, freq: "daily" | "weekly" | "monthly") => {
    entries.push({
      url: `${SITE_URL}${path}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: freq,
      priority,
    });
  };

  for (const p of pricePages) push(p, priceDate, p === "" ? 1 : 0.8, "daily");
  for (const p of [...regionPages, ...purityPages]) push(p, priceDate, 0.6, "daily");
  for (const c of getCompanies()) {
    push(`/company/${c.id}`, fromPriceDate(c.priceData.updatedAt), 0.6, "daily");
  }
  for (const p of [...columnPages, "/guide/tax"]) {
    const modified = articles[p]?.modified;
    push(p, modified ? new Date(modified) : undefined, 0.8, "monthly");
  }
  for (const p of staticPages) push(p, undefined, 0.5, "monthly");

  return entries;
}
