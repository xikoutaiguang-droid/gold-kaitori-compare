import { getCompanies } from "@/lib/companies";
import type { Purity } from "@/lib/types";

/**
 * 「同じ日に、同じ純度で、各社はいくら違うのか」を測る。
 *
 * コラムの本文に数字を直接書くと、翌日の価格更新で嘘になる。だから記事側は
 * 一切数値を持たず、毎ビルドここで実データから測り直す。文章のほうも
 * 「中央値より下の幅が大きい」のような、測った結果で真偽が決まる言い回しは
 * 使わず、計算した値をそのまま出すか、分岐させる。
 */
export interface Spread {
  purity: Purity;
  /** その純度を公開している社数 */
  count: number;
  high: { name: string; price: number };
  low: { name: string; price: number };
  median: number;
  /** 最高と最低の差 */
  range: number;
  /** 上下1社ずつを外した差。極端な1社が見出しを作っていないか確かめるため */
  trimmedRange: number;
  trimmedHigh: { name: string; price: number };
  trimmedLow: { name: string; price: number };
  /** 中央値の店より上に、いくら伸びしろがあるか */
  upside: number;
  /** 中央値の店より下に、いくら落ちうるか(正の数) */
  downside: number;
  /** 中央値以上の社だけを見たときの価格の幅。上側がどれだけ密集しているか */
  upperSpread: number;
  /** 中央値以下の社だけを見たときの価格の幅 */
  lowerSpread: number;
}

export function measureSpread(purity: Purity): Spread | null {
  const rows = getCompanies()
    .map((c) => ({ name: c.name, price: c.priceData.prices[purity] }))
    .filter((r): r is { name: string; price: number } => r.price !== undefined)
    .sort((a, b) => b.price - a.price);

  // 上下を1社ずつ外してもまだ差が語れる程度の社数がないと、この記事の主張は立たない
  if (rows.length < 5) return null;

  const n = rows.length;
  const high = rows[0];
  const low = rows[n - 1];
  const median = rows[(n - 1) >> 1].price;
  const trimmed = rows.slice(1, -1);
  // 上側と下側それぞれの密集具合。「高いほうが団子になる」を断定せず数字で示すため
  const upperPrices = rows.filter((r) => r.price >= median).map((r) => r.price);
  const lowerPrices = rows.filter((r) => r.price <= median).map((r) => r.price);

  return {
    purity,
    count: n,
    high,
    low,
    median,
    range: high.price - low.price,
    trimmedRange: trimmed[0].price - trimmed[trimmed.length - 1].price,
    trimmedHigh: trimmed[0],
    trimmedLow: trimmed[trimmed.length - 1],
    upside: high.price - median,
    downside: median - low.price,
    upperSpread: upperPrices[0] - upperPrices[upperPrices.length - 1],
    lowerSpread: lowerPrices[0] - lowerPrices[lowerPrices.length - 1],
  };
}

/** 各社の公表日のうち、最も新しいもの。記事が「いつ測ったか」を示すため */
export function getMeasuredOn(): string | null {
  const dates = getCompanies()
    .map((c) => c.priceData.updatedAt)
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}
