import { getCompanies, getReferenceRate } from "@/lib/companies";
import type { Company, Purity } from "@/lib/types";

/**
 * 「1gいくら」という表示が、店ごとに同じ意味を指していないことを示すための計算。
 *
 * 各社の公表単価をそのまま並べる比較表は、前提が揃っていることを暗黙に仮定している。
 * 調べたところ揃っていなかった(表示額から後で引く店、価格に織り込む店、
 * そもそも別の商品を指した価格を載せている店がある)ので、その差を数字で出す。
 */

/** 田中貴金属の公表買取価格に対する各社の位置 */
export interface AgainstBenchmark {
  name: string;
  id: string;
  price: number;
  /** 田中の建値を100としたときの比率(%) */
  ratio: number;
}

export interface BenchmarkView {
  /** 田中貴金属のK24店頭買取価格(円/g) */
  reference: number;
  referenceDate: string;
  referenceUrl: string;
  rows: AgainstBenchmark[];
  /** 田中の建値を上回っている社数 */
  aboveReference: number;
  medianRatio: number;
}

export function measureAgainstBenchmark(purity: Purity = "k24"): BenchmarkView | null {
  const ref = getReferenceRate();
  const reference = ref.prices[purity];
  if (!reference) return null;

  const rows = getCompanies()
    .map((c) => ({ name: c.name, id: c.id, price: c.priceData.prices[purity] }))
    .filter((r): r is AgainstBenchmark & { price: number } => r.price !== undefined)
    .map((r) => ({ ...r, ratio: (r.price / reference) * 100 }))
    .sort((a, b) => b.price - a.price);

  if (!rows.length) return null;

  const ratios = rows.map((r) => r.ratio).sort((a, b) => a - b);
  return {
    reference,
    referenceDate: ref.updatedAt,
    referenceUrl: ref.sourceUrl,
    rows,
    aboveReference: rows.filter((r) => r.price > reference).length,
    medianRatio: ratios[(ratios.length - 1) >> 1],
  };
}

/**
 * まねきやが公表している貴金属分析料。
 *
 * 単価と違って日々動くものではないので表として持つが、転記である以上いつの時点かは
 * 残す。金額は同社の価格ページ(https://manekiya.com/rate)に掲載されている税抜額。
 * 20万円以上は「お問い合わせください」とあり金額が公表されていないため持たない。
 */
export const MANEKIYA_FEE = {
  transcribedAt: "2026-09-22",
  sourceUrl: "https://manekiya.com/rate",
  /** [買取金額の上限(未満), 分析料(税抜)] */
  tiers: [
    [20000, 1000],
    [30000, 2500],
    [100000, 3500],
    [200000, 10000],
  ] as const,
};

/** 買取金額に対する分析料(税込)。公表されていない帯なら null */
export function manekiyaFee(amount: number): number | null {
  const tier = MANEKIYA_FEE.tiers.find(([limit]) => amount < limit);
  return tier ? Math.round(tier[1] * 1.1) : null;
}

export interface FeeImpact {
  /** どの純度の単価で計算したか。複数の純度を並べる記事で取り違えないため */
  purity: Purity;
  grams: number;
  gross: number;
  fee: number | null;
  net: number | null;
  /** 分析料を引いた後の実質的な1gあたり単価 */
  effective: number | null;
  /** その実質単価が、掲載社の中で何位に相当するか */
  effectiveRank: number | null;
  displayRank: number;
  total: number;
}

/**
 * 表示単価の順位と、分析料を引いた後の順位がどれだけ動くかを測る。
 * 分析料は商品1点ごとにかかると公表されているので、1点で売った場合として計算する。
 */
export function measureFeeImpact(companyId: string, purity: Purity, weights: number[]): FeeImpact[] {
  const companies = getCompanies();
  const target = companies.find((c) => c.id === companyId);
  const unit = target?.priceData.prices[purity];
  if (!unit) return [];

  const others = companies
    .map((c) => c.priceData.prices[purity])
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => b - a);
  const displayRank = others.findIndex((v) => v === unit) + 1;

  return weights.map((grams) => {
    const gross = unit * grams;
    const fee = manekiyaFee(gross);
    if (fee === null) {
      return { purity, grams, gross, fee: null, net: null, effective: null, effectiveRank: null, displayRank, total: others.length };
    }
    const net = gross - fee;
    const effective = net / grams;
    return {
      purity,
      grams,
      gross,
      fee,
      net,
      effective,
      effectiveRank: others.filter((v) => v > effective).length + 1,
      displayRank,
      total: others.length,
    };
  });
}

/**
 * 口コミ評価と買取価格に関係があるか。
 * 「評価の高い店は高く買う」という当てが成り立つなら、比較表を見なくても選べることになる。
 * 成り立たないなら、口コミは店選びの道具にならない。
 */
export interface ReviewVsPrice {
  count: number;
  correlation: number;
  ratingRange: [number, number];
  /** 評価が四分位の間に収まっている社数と、その範囲。ばらけなさを目で見ずに測るため */
  clustered: { count: number; low: number; high: number };
  /** 評価は低いのに価格は上位、という反例のうち最も極端なもの */
  counterExample: { name: string; id: string; rating: number; price: number; priceRank: number } | null;
}

export function measureReviewVsPrice(purity: Purity = "k24"): ReviewVsPrice | null {
  const companies = getCompanies();
  const rows = companies
    .map((c: Company) => ({
      name: c.name,
      id: c.id,
      rating: c.googleReview?.avgRating,
      price: c.priceData.prices[purity],
    }))
    .filter((r): r is { name: string; id: string; rating: number; price: number } =>
      r.rating !== undefined && r.price !== undefined,
    );
  if (rows.length < 5) return null;

  const prices = companies
    .map((c) => c.priceData.prices[purity])
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => b - a);

  const n = rows.length;
  const mr = rows.reduce((s, r) => s + r.rating, 0) / n;
  const mp = rows.reduce((s, r) => s + r.price, 0) / n;
  let num = 0;
  let dr = 0;
  let dp = 0;
  for (const r of rows) {
    num += (r.rating - mr) * (r.price - mp);
    dr += (r.rating - mr) ** 2;
    dp += (r.price - mp) ** 2;
  }
  const correlation = dr && dp ? num / Math.sqrt(dr * dp) : 0;

  // 評価が最も低い社が価格では上位にいるなら、口コミで足切りすると取り逃がすことになる
  const lowestRated = [...rows].sort((a, b) => a.rating - b.rating)[0];
  const priceRank = prices.findIndex((v) => v === lowestRated.price) + 1;

  const sortedRatings = rows.map((r) => r.rating).sort((a, b) => a - b);
  const q1 = sortedRatings[Math.floor(n * 0.25)];
  const q3 = sortedRatings[Math.min(n - 1, Math.floor(n * 0.75))];

  return {
    count: n,
    correlation,
    ratingRange: [sortedRatings[0], sortedRatings[n - 1]],
    clustered: {
      count: rows.filter((r) => r.rating >= q1 && r.rating <= q3).length,
      low: q1,
      high: q3,
    },
    counterExample:
      priceRank > 0 && priceRank <= Math.ceil(prices.length / 2)
        ? { name: lowestRated.name, id: lowestRated.id, rating: lowestRated.rating, price: lowestRated.price, priceRank }
        : null,
  };
}
