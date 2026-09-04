export type Purity =
  | "k24"
  | "k22"
  | "k21_6"
  | "k20"
  | "k18"
  | "k14"
  | "k10"
  | "k9"
  | "pt1000"
  | "pt950"
  | "pt900"
  | "pt850"
  | "ag";

export const PURITY_LABELS: Record<Purity, string> = {
  k24: "K24(純金)",
  k22: "K22",
  k21_6: "K21.6",
  k20: "K20",
  k18: "K18",
  k14: "K14",
  k10: "K10",
  k9: "K9",
  pt1000: "Pt1000",
  pt950: "Pt950",
  pt900: "Pt900",
  pt850: "Pt850",
  ag: "シルバー",
};

export const GOLD_PURITIES: Purity[] = ["k24", "k22", "k21_6", "k20", "k18", "k14", "k10", "k9"];
export const PLATINUM_PURITIES: Purity[] = ["pt1000", "pt950", "pt900", "pt850"];
export const SILVER_PURITIES: Purity[] = ["ag"];

export type Region =
  | "全国"
  | "北海道"
  | "東北"
  | "関東"
  | "中部"
  | "東海"
  | "近畿"
  | "中国"
  | "四国"
  | "九州・沖縄";

export type Tier = "major" | "midsize" | "boutique";

export interface PriceSet {
  /** 円/g、未取得の純度はキー自体を省略 */
  prices: Partial<Record<Purity, number>>;
  /** 価格の更新日(YYYY-MM-DD)。取得できていない場合はnull */
  updatedAt: string | null;
}

export interface Company {
  id: string;
  name: string;
  officialUrl: string;
  /**
   * アフィリエイトプログラム経由の追跡リンク。承認済みでこれが設定されている場合、
   * 公式サイトへの遷移リンクとして officialUrl の代わりに使う。
   * 同じ会社で複数の申込み導線(宅配買取/店頭予約 等)がある場合は複数件入れられる。
   */
  affiliateLinks?: { label: string; url: string }[];
  priceSourceUrl: string;
  tier: Tier;
  storeCount: number | null;
  regions: Region[];
  /** 1-5。店舗数・上場有無・資本提携・運営年数など公開情報からの目安。安全性を保証するものではない */
  trustScore: number;
  trustNotes: string;
  priceData: PriceSet;
  scrapeMethod: "html" | "json" | "js-embed" | "manual" | "pending";
  notes?: string;
  /** 掲載価格と実際の店舗査定額が乖離しうる事情がある場合の注釈(フランチャイズ加盟店ごとの独自相場など)。UIに表示する。 */
  priceCaveat?: string;
  /** Google Places APIでサンプリングした店舗の口コミ集計値。全店舗の完全集計ではないので参考値として扱うこと。 */
  googleReview?: {
    avgRating: number;
    /** サンプリングした店舗のレビュー件数合計(平均を出す際の重み付けに使用) */
    totalReviewCount: number;
    /** サンプリングした店舗数 */
    sampleSize: number;
    sampledAt: string;
    /** サンプリングした店舗名の一覧(透明性のため保持) */
    sampledStores: string[];
    /** サンプルの信頼度に関する注記(名称不一致など、確認が必要な事情がある場合) */
    note?: string;
  };
}
