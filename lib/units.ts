import type { Purity } from "@/lib/types";

/** 1gあたりの各単位の換算係数(何gに相当するか)。すべて公的な定義値。 */
export const WEIGHT_UNIT_TO_GRAM = {
  g: 1,
  // 尺貫法の質量単位。日本の貴金属・宝飾業界で今も使われる(1匁 = 3.75g、メートル法施行時の定義)。
  momme: 3.75,
  // トロイオンス。金地金の国際取引で使われる単位(1toz = 31.1034768g)。
  oz: 31.1034768,
  kg: 1000,
} as const;

export type WeightUnit = keyof typeof WEIGHT_UNIT_TO_GRAM;

export const WEIGHT_UNIT_LABELS: Record<WeightUnit, string> = {
  g: "g(グラム)",
  momme: "匁(もんめ)",
  oz: "oz(トロイオンス)",
  kg: "kg(キログラム)",
};

/**
 * 各純度の品位(その金属が実際に何%含まれているか)。業界で公表されている定義値。
 * 買取価格とは無関係の、物理的な含有量の計算に使う。
 */
export const PURITY_FINENESS: Record<Purity, number> = {
  k24: 1,
  k22: 0.916,
  k21_6: 0.9,
  k20: 0.835,
  k18: 0.75,
  k14: 0.585,
  k10: 0.416,
  k9: 0.375,
  pt1000: 1,
  pt950: 0.95,
  pt900: 0.9,
  pt850: 0.85,
  // サイト内の「シルバー」価格はSv1000(純銀)を基準にしているため、それに合わせる。
  ag: 0.999,
};
