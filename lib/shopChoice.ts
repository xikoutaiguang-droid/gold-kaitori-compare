import { getCompanies } from "@/lib/companies";
import { getCompanyPriceHistory } from "@/lib/companyHistory";
import type { Purity } from "@/lib/types";

/**
 * 「どの店を選べばいいのか」に、持っている記録で答えられるところまで答える。
 *
 * よくある選び方は2つある。口コミの星で選ぶか、「いちばん高い店」を覚えるか。
 * どちらも確かめられる。評価と買取額は同じ社について両方持っているし、
 * 1位が日ごとに入れ替わるかどうかは30日ぶんの記録を数えれば出る。
 *
 * 数字は記事に直書きしない。毎日変わるため。
 */

export interface RatingRow {
  id: string;
  name: string;
  rating: number;
  price: number;
  reviews: number;
  /** 何店舗ぶんを見た評価か。少ないほど当てにならない */
  sampleSize: number;
}

export interface LeaderDay {
  date: string;
  id: string;
  name: string;
  price: number;
  /** その日に価格を公表していた社数 */
  field: number;
}

export interface ShopChoice {
  purity: Purity;
  /** 評価と価格の両方を持っている社 */
  rated: RatingRow[];
  /** 評価と価格の相関係数。0に近いほど関係が無い */
  correlation: number;
  ratingHigh: RatingRow;
  ratingLow: RatingRow;
  priceHigh: RatingRow;
  priceLow: RatingRow;
  /** 評価が密集している範囲(いちばん低い社を除いた最小〜最大) */
  clusterLow: number;
  clusterHigh: number;
  /** 1位を数えられた日数 */
  days: number;
  /** 前日と1位が入れ替わった回数 */
  changes: number;
  /** 期間中に1位になった社と、その日数 */
  leaders: { id: string; name: string; days: number }[];
  recent: LeaderDay[];
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let cov = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    cov += (xs[i] - mx) * (ys[i] - my);
    sx += (xs[i] - mx) ** 2;
    sy += (ys[i] - my) ** 2;
  }
  if (sx === 0 || sy === 0) return 0;
  return cov / Math.sqrt(sx * sy);
}

export function measureShopChoice(purity: Purity = "k24"): ShopChoice | null {
  const all = getCompanies();
  const name = new Map(all.map((c) => [c.id, c.name]));

  const rated: RatingRow[] = all
    .filter((c) => typeof c.priceData.prices[purity] === "number" && c.googleReview)
    .map((c) => ({
      id: c.id,
      name: c.name,
      rating: c.googleReview!.avgRating,
      price: c.priceData.prices[purity] as number,
      reviews: c.googleReview!.totalReviewCount,
      sampleSize: c.googleReview!.sampleSize,
    }))
    .sort((a, b) => b.rating - a.rating);

  if (rated.length < 8) return null;

  const correlation = pearson(
    rated.map((r) => r.rating),
    rated.map((r) => r.price),
  );
  const byPrice = [...rated].sort((a, b) => b.price - a.price);
  // いちばん評価が低い1社を外した範囲。評価がどれだけ密集しているかを言うため
  const ratings = rated.map((r) => r.rating).sort((a, b) => a - b);

  // 1位の入れ替わり
  const entries = [...getCompanyPriceHistory().entries].sort((a, b) => a.date.localeCompare(b.date));
  const days: LeaderDay[] = [];
  for (const e of entries) {
    const rows = Object.entries(e.companies)
      .map(([id, p]) => ({ id, price: p?.[purity] }))
      .filter((r): r is { id: string; price: number } => typeof r.price === "number");
    // 社数が少ない日は「その日の1位」と呼べないので数えない
    if (rows.length < 5) continue;
    rows.sort((a, b) => b.price - a.price);
    days.push({
      date: e.date,
      id: rows[0].id,
      name: name.get(rows[0].id) ?? rows[0].id,
      price: rows[0].price,
      field: rows.length,
    });
  }
  if (days.length < 7) return null;

  let changes = 0;
  const count = new Map<string, number>();
  days.forEach((d, i) => {
    if (i > 0 && days[i - 1].id !== d.id) changes++;
    count.set(d.id, (count.get(d.id) ?? 0) + 1);
  });

  return {
    purity,
    rated,
    correlation: Math.round(correlation * 1000) / 1000,
    ratingHigh: rated[0],
    ratingLow: rated[rated.length - 1],
    priceHigh: byPrice[0],
    priceLow: byPrice[byPrice.length - 1],
    clusterLow: ratings[1],
    clusterHigh: ratings[ratings.length - 1],
    days: days.length,
    changes,
    leaders: [...count.entries()]
      .map(([id, d]) => ({ id, name: name.get(id) ?? id, days: d }))
      .sort((a, b) => b.days - a.days),
    recent: days.slice(-10),
  };
}
