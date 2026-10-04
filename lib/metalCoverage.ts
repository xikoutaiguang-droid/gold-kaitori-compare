import { getCompanies } from "@/lib/companies";
import { measureSpread, type Spread } from "@/lib/spread";
import {
  GOLD_PURITIES,
  PLATINUM_PURITIES,
  SILVER_PURITIES,
  type Purity,
} from "@/lib/types";

/**
 * 金属ごとに「値を出している店が何社あるか」と「その店の間でどれだけ違うか」を測る。
 *
 * なぜ要るか:
 * 各社は自社の価格しか載せないので、「銀を買い取ってくれる店がどれだけあるか」は
 * どこにも書かれていない。20社ぶんを毎日取っているこちら側でしか数えられない。
 *
 * 記事側に数字も順序も書かない。社数の多い少ないも、差が大きいのがどの金属かも、
 * ここで測った結果から組み立てる。銀を出す社が増えれば、記事の結論も一緒に変わる。
 *
 * 価格の開きは lib/spread.ts に測らせる。あちらは上下1社を外した幅
 * (trimmedRange)も返すので、極端な1社で結論が決まっていないかを確かめられる。
 * 2026年10月の時点では、上下を外しても銀の開きだけ桁が違っていた。
 */

export interface MetalFacts {
  key: "gold" | "platinum" | "silver";
  label: string;
  /** この金属の価格を1つでも公表している社数 */
  publishing: number;
  /** 代表として測る純度 */
  purity: Purity;
  spread: Spread | null;
  /** 最安の社を1とした場合の、最高値との開き(%)。上下1社を外したもの */
  trimmedGapPct: number | null;
}

/** 当サイトが価格を見ている社の数(金属を問わず) */
export function totalCompanies(): number {
  return getCompanies().length;
}

function publishingCount(purities: Purity[]): number {
  return getCompanies().filter((c) => purities.some((p) => c.priceData.prices[p] !== undefined))
    .length;
}

export function measureMetals(): MetalFacts[] {
  const defs = [
    { key: "gold" as const, label: "金", purities: GOLD_PURITIES, representative: "k24" as Purity },
    {
      key: "platinum" as const,
      label: "プラチナ",
      purities: PLATINUM_PURITIES,
      representative: "pt900" as Purity,
    },
    {
      key: "silver" as const,
      label: "銀",
      purities: SILVER_PURITIES,
      representative: "ag" as Purity,
    },
  ];

  return defs.map((d) => {
    const spread = measureSpread(d.representative);
    return {
      key: d.key,
      label: d.label,
      publishing: publishingCount(d.purities),
      purity: d.representative,
      spread,
      trimmedGapPct:
        spread && spread.trimmedLow.price > 0
          ? (spread.trimmedHigh.price / spread.trimmedLow.price - 1) * 100
          : null,
    };
  });
}

/**
 * 決まった額の手数料が、その金属なら何グラム分にあたるか。
 *
 * 単価が低い金属ほど、同じ手数料が重くのしかかる。
 * 「1,100円」と書かれていても、金なら0.05g、銀なら3g以上に相当する。
 * 読む人が自分の品と比べられるよう、グラムに直して出す。
 */
export function feeInGrams(fee: number, metal: MetalFacts): number | null {
  const median = metal.spread?.median;
  if (!median || median <= 0) return null;
  return fee / median;
}

/** 公表社数が少ない順。どの金属がいちばん売り先を選べないかを記事側で断定しないため */
export function byFewestPublishers(metals: MetalFacts[]): MetalFacts[] {
  return [...metals].sort((a, b) => a.publishing - b.publishing);
}

/** 上下1社を外した開きが大きい順。測れなかった金属は後ろに置く */
export function byWidestGap(metals: MetalFacts[]): MetalFacts[] {
  return [...metals].sort((a, b) => (b.trimmedGapPct ?? -1) - (a.trimmedGapPct ?? -1));
}
