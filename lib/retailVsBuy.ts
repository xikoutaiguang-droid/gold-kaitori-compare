import { getReferenceRate } from "@/lib/companies";

/**
 * 「買う値段」と「売る値段」の開き。
 *
 * 相場として報じられるのは買う側(小売)の数字で、売るときに受け取れるのは
 * そこから一段下がった値になる。田中貴金属が同じ表に両方を並べているので、
 * その差をそのまま読めば説明できる。
 *
 * 金・プラチナ・銀で、円の差はほとんど同じなのに割合がまるで違う、というのが
 * この記事の芯なので、金額と割合の両方を持つ。
 *
 * (各社どうしの価格差は lib/spread.ts が別に測っている。名前が紛らわしいので、
 *  こちらは「小売と買取」であることをファイル名で分けている。)
 */

export type MetalKey = "gold" | "platinum" | "silver";

export interface MetalSpread {
  key: MetalKey;
  label: string;
  /** 店頭小売価格(税込) = 買うときに払う額 */
  retail: number;
  /** 店頭買取価格(税込) = 売るときに受け取る額 */
  purchase: number;
  /** 差額(円/g) */
  gap: number;
  /** 小売価格に対する差の割合(%) */
  gapPct: number;
}

export interface RetailVsBuy {
  source: string;
  sourceUrl: string;
  updatedAt: string;
  metals: MetalSpread[];
  /** 割合がいちばん小さい金属(=売っても目減りしにくい) */
  narrowest: MetalSpread;
  /** 割合がいちばん大きい金属 */
  widest: MetalSpread;
}

const LABELS: Record<MetalKey, string> = {
  gold: "金",
  platinum: "プラチナ",
  silver: "銀",
};

/** 小数で出る銀に合わせて、表示に必要なぶんだけ丸める */
function round(value: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function measureRetailVsBuy(): RetailVsBuy | null {
  const ref = getReferenceRate() as ReturnType<typeof getReferenceRate> & {
    spread?: Partial<Record<MetalKey, { retail: number; purchase: number }>>;
  };
  if (!ref.spread) return null;

  const metals: MetalSpread[] = [];
  for (const key of ["gold", "platinum", "silver"] as const) {
    const row = ref.spread[key];
    if (!row || !(row.retail > 0) || !(row.purchase > 0)) continue;
    const gap = row.retail - row.purchase;
    metals.push({
      key,
      label: LABELS[key],
      retail: row.retail,
      purchase: row.purchase,
      gap: round(gap, 2),
      gapPct: round((gap / row.retail) * 100, 1),
    });
  }
  if (metals.length < 2) return null;

  const sorted = [...metals].sort((a, b) => a.gapPct - b.gapPct);
  return {
    source: ref.source,
    sourceUrl: ref.sourceUrl,
    updatedAt: ref.updatedAt,
    metals,
    narrowest: sorted[0],
    widest: sorted[sorted.length - 1],
  };
}
