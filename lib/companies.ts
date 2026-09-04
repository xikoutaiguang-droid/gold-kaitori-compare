import rawCompanies from "@/data/companies.json";
import rawReferenceRate from "@/data/referenceRate.json";
import type { Company, Purity, Region } from "@/lib/types";

export interface ReferenceRate {
  source: string;
  sourceUrl: string;
  prices: Partial<Record<Purity, number>>;
  updatedAt: string;
  notes: string;
}

export function getReferenceRate(): ReferenceRate {
  return rawReferenceRate as ReferenceRate;
}

export type ReliabilityTier = "high" | "medium" | "low";

export const RELIABILITY_LABELS: Record<ReliabilityTier, string> = {
  high: "十分なサンプル",
  medium: "参考程度",
  low: "サンプル少なめ・要注意",
};

/**
 * 口コミサンプルの統計的な厚みを大まかに3段階で判定する。
 * 個々のレビューが本物かどうか(やらせ等)を検証するものではなく、
 * あくまで「サンプル店舗数・レビュー総数がどれだけ集まっているか」の目安。
 * 単一店舗のサンプルはチェーン全体の代表値として弱いため、件数に関わらずlow扱いにする。
 */
export function reviewReliability(gr: NonNullable<Company["googleReview"]>): ReliabilityTier {
  if (gr.sampleSize <= 1) return "low";
  if (gr.totalReviewCount >= 1000) return "high";
  if (gr.totalReviewCount >= 100) return "medium";
  return "low";
}

export function getCompanies(): Company[] {
  return rawCompanies as Company[];
}

export function getCompaniesWithPurity(purity: Purity): Company[] {
  return getCompanies().filter((c) => c.priceData.prices[purity] !== undefined);
}

export function filterByRegion(companies: Company[], region: Region | "全国"): Company[] {
  if (region === "全国") return companies;
  return companies.filter((c) => c.regions.includes("全国") || c.regions.includes(region));
}

export const ALL_REGIONS: Region[] = [
  "全国",
  "北海道",
  "東北",
  "関東",
  "中部",
  "東海",
  "近畿",
  "中国",
  "四国",
  "九州・沖縄",
];

export type CriteriaId = "major" | "highPrice" | "trusted" | "hospitality";

export const DIAGNOSIS_CRITERIA: { id: CriteriaId; label: string; description: string }[] = [
  {
    id: "major",
    label: "大手に任せたい",
    description: "店舗数が多く、知名度の高い大手チェーンを優先します。",
  },
  {
    id: "highPrice",
    label: "とにかく高価買取",
    description: "選択した純度の買取参考価格が高い会社を優先します。",
  },
  {
    id: "trusted",
    label: "安心した買取ができる店",
    description: "運営規模・上場や資本提携の有無など公開情報から算出した信頼度スコアで優先します。",
  },
  {
    id: "hospitality",
    label: "接客・会話も楽しみたい",
    description:
      "代表的な店舗のGoogle口コミ評価(サンプリング値)が高い会社を優先します。全店舗の集計ではない参考値です。",
  },
];

/**
 * 選択された基準ごとに順位(1位=最良)を算出し、選択基準の平均順位が小さい順(=総合的に良い順)に並べる。
 * 単純な平均順位方式を採用しているのは、基準ごとの単位が異なる(店舗数/円/スコア)ため、
 * 加重和よりも「どの基準でも上位に来る会社が総合的に評価される」方式の方が説明しやすいため。
 */
export function diagnose(
  companies: Company[],
  criteria: CriteriaId[],
  purity: Purity
): { company: Company; avgRank: number }[] {
  const priced = companies.filter((c) => c.priceData.prices[purity] !== undefined);
  const pool = priced.length > 0 ? priced : companies;

  if (criteria.length === 0) {
    return pool.map((company) => ({ company, avgRank: 0 }));
  }

  const ranks = new Map<string, number[]>();
  for (const c of pool) ranks.set(c.id, []);

  for (const criterion of criteria) {
    const sorted = [...pool].sort((a, b) => {
      switch (criterion) {
        case "major":
          return (b.storeCount ?? 0) - (a.storeCount ?? 0);
        case "highPrice":
          return (b.priceData.prices[purity] ?? 0) - (a.priceData.prices[purity] ?? 0);
        case "trusted":
          return b.trustScore - a.trustScore;
        case "hospitality":
          return (b.googleReview?.avgRating ?? 0) - (a.googleReview?.avgRating ?? 0);
        default:
          return 0;
      }
    });
    sorted.forEach((c, index) => {
      ranks.get(c.id)!.push(index + 1);
    });
  }

  return pool
    .map((company) => {
      const r = ranks.get(company.id)!;
      const avgRank = r.reduce((sum, v) => sum + v, 0) / r.length;
      return { company, avgRank };
    })
    .sort((a, b) => a.avgRank - b.avgRank);
}
