import { getCompanies } from "@/lib/companies";
import { PURITY_FINENESS } from "@/lib/units";
import type { Purity } from "@/lib/types";

/**
 * 「刻印の純度どおりの値段が付くのか」を各社の公表価格から測る。
 *
 * 純度の一覧表そのものは、どこにでもある。当サイトが足せるのは、その純度に対して
 * 実際にいくら払われているかで、それは19社の公表価格を持っているから出せる。
 */

/** 記事で扱う金の純度。K24から順に下がる */
export const KARAT_ORDER: Purity[] = ["k24", "k22", "k21_6", "k20", "k18", "k14", "k10", "k9"];

export interface KaratRow {
  purity: Purity;
  /** 刻印が示す金の含有率(0〜1) */
  fineness: number;
  /** K24を1としたときの買取価格の比(中央値) */
  priceRatio: number;
  /** 含有率との差(ポイント)。マイナスなら純度の割に安い */
  gap: number;
  /** 比較に使えた社数 */
  count: number;
  /** そのうち含有率を上回る価格を出している社数 */
  above: number;
}

export function measureKaratPricing(): KaratRow[] {
  const companies = getCompanies();
  const rows: KaratRow[] = [];

  for (const purity of KARAT_ORDER) {
    const fineness = PURITY_FINENESS[purity];
    const ratios = companies
      .map((c) => {
        const v = c.priceData.prices[purity];
        const base = c.priceData.prices.k24;
        return v !== undefined && base !== undefined && base > 0 ? v / base : null;
      })
      .filter((v): v is number => v !== null)
      .sort((a, b) => a - b);

    if (!ratios.length) continue;

    const priceRatio = ratios[(ratios.length - 1) >> 1];
    rows.push({
      purity,
      fineness,
      priceRatio,
      gap: (priceRatio - fineness) * 100,
      count: ratios.length,
      above: ratios.filter((r) => r > fineness).length,
    });
  }
  return rows;
}

/** K24の買取価格(中央値)。記事で「実際いくらか」を示すため */
export function medianK24(): number | null {
  const v = getCompanies()
    .map((c) => c.priceData.prices.k24)
    .filter((x): x is number => x !== undefined)
    .sort((a, b) => a - b);
  return v.length ? v[(v.length - 1) >> 1] : null;
}

export interface CompanyKaratRow {
  id: string;
  name: string;
  /** その純度の1gあたりの価格 */
  value: number;
  /** 同じ社・同じ公表日のK24の価格 */
  k24: number;
  /** value / k24 */
  ratio: number;
  /** その純度での順位(同額は同順位) */
  rank: number;
  /** K24での順位(同額は同順位)。K24を公表している社の中で数える */
  k24Rank: number;
}

/**
 * 純度ページ用。各社がその純度をK24の何%で買っているかと、K24の順位との入れ替わり。
 *
 * 比は同じ社の同じ公表日の2つの値から出すので、社ごとに価格の日付がずれていても
 * 比そのものは同じ日の値どうしの比較になる。順位は各社の最新値で数えるため、
 * 日付のずれの影響を受ける(ページの PriceFreshness がその注意を出している)。
 */
export function measureCompanyKarat(purity: Purity): CompanyKaratRow[] {
  const companies = getCompanies();
  const rankOf = (values: number[], v: number) => 1 + values.filter((x) => x > v).length;

  const k24Values = companies
    .map((c) => c.priceData.prices.k24)
    .filter((x): x is number => x !== undefined && x > 0);

  const base = companies
    .map((c) => {
      const value = c.priceData.prices[purity];
      const k24 = c.priceData.prices.k24;
      return value !== undefined && k24 !== undefined && k24 > 0
        ? { id: c.id, name: c.name, value, k24, ratio: value / k24 }
        : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const values = companies
    .map((c) => c.priceData.prices[purity])
    .filter((x): x is number => x !== undefined);

  return base
    .map((r) => ({ ...r, rank: rankOf(values, r.value), k24Rank: rankOf(k24Values, r.k24) }))
    .sort((a, b) => b.ratio - a.ratio || b.value - a.value);
}
