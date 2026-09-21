import { getCompanies } from "@/lib/companies";
import type { Company, Purity } from "@/lib/types";

/**
 * 企業個別ページで使う「他社と比べてどうか」の計算。
 *
 * 各社の公式サイトを見れば自社の価格は分かる。このサイトの存在価値は
 * 「その価格が25社の中で何番目か」を出せることなので、個別ページでも
 * 単独の価格を並べるだけにせず、必ず順位と中央値との差を添える。
 */
export interface PurityStanding {
  purity: Purity;
  price: number;
  /** その純度を公開している社の中での順位(1=最高値) */
  rank: number;
  /** その純度を公開している社数 */
  total: number;
  median: number;
  /** 中央値との差(円/g)。プラスなら中央値より高い */
  diff: number;
}

export function getStandings(company: Company, purities: Purity[]): PurityStanding[] {
  const all = getCompanies();
  const out: PurityStanding[] = [];

  for (const purity of purities) {
    const price = company.priceData.prices[purity];
    if (price === undefined) continue;

    const others = all
      .map((c) => c.priceData.prices[purity])
      .filter((v): v is number => v !== undefined)
      .sort((a, b) => b - a);
    if (!others.length) continue;

    const rank = others.findIndex((v) => v === price) + 1;
    const median = others[(others.length - 1) >> 1];
    out.push({ purity, price, rank, total: others.length, median, diff: price - median });
  }
  return out;
}

export function getCompanyById(id: string): Company | undefined {
  return getCompanies().find((c) => c.id === id);
}

/** 掲載順。まず価格を公開している社、次に信頼度スコアの高い順に並べる */
export function getCompaniesForIndex(): Company[] {
  return [...getCompanies()].sort((a, b) => {
    const ap = Object.keys(a.priceData.prices).length ? 1 : 0;
    const bp = Object.keys(b.priceData.prices).length ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return b.trustScore - a.trustScore;
  });
}

/** 同じ地域に対応している他社(個別ページの内部リンク用)。孤立ページにしないために必ず置く */
export function getRelatedCompanies(company: Company, limit = 6): Company[] {
  const all = getCompanies().filter((c) => c.id !== company.id);
  const overlap = (c: Company) =>
    c.regions.includes("全国") ||
    company.regions.includes("全国") ||
    c.regions.some((r) => company.regions.includes(r));
  const scored = all
    .filter(overlap)
    .sort((a, b) => b.trustScore - a.trustScore)
    .slice(0, limit);
  return scored.length ? scored : all.slice(0, limit);
}
