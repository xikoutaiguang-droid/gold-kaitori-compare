import { getCompanies } from "@/lib/companies";
import { getCompanyPriceHistory } from "@/lib/companyHistory";
import type { Purity } from "@/lib/types";

/**
 * 質屋の記事の「質屋の買取価格は、買取店より高いのか」。
 *
 * 「質屋 24金 買取」と検索する人は、質屋で売ると高いのか安いのかを知りたい。
 * 質屋が出している1gあたりの買取価格を、同じ日の他社と並べた記録は
 * 各社の公表値を日次で残しているこちら側にしか無い。
 *
 * 対象は、掲載社のうち質屋で、1gあたりの買取価格を公表している社だけ。
 * 大黒屋(質屋が母体)は価格表が「ASK」、株式会社タカヤマ(髙山質店)は
 * 1g単価の表が無いため、ここには入らない(companies.json の notes 参照)。
 *
 * 比べ方:
 * - 各社の記録は「その社が価格を公表した日」の値で、土日は公表する社が減る。
 *   社数が少ない日の順位は意味が変わるので、MIN_COMPANIES社以上が出ている日だけ数える。
 * - 比べる相手は、その日に同じ純度の価格を出した全社の中央値と最高値。
 */

/** 掲載社のうち、1g単価を公表している質屋 */
export const PAWN_SHOP_IDS = ["sanoya", "takayama78"] as const;
/** 何日ぶん遡るか */
const DAYS = 28;
/** その日の比較に必要な社数(平日はおおむね20社前後) */
const MIN_COMPANIES = 15;
export const PAWN_PURITIES: Purity[] = ["k24", "k18", "pt900"];

export interface PawnShopRow {
  id: string;
  name: string;
  purity: Purity;
  /** 数えた日数 */
  days: number;
  /** その日の中央値より高かった日数 */
  daysAboveMedian: number;
  /** 中央値との差の平均(円/g)。マイナスなら中央値より安い */
  avgVsMedian: number;
  /** 最高値との差の平均(円/g)。0以下 */
  avgVsTop: number;
}

export interface PawnShopComparison {
  from: string;
  to: string;
  rows: PawnShopRow[];
}

function shift(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function median(sorted: number[]): number {
  const n = sorted.length;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

export function measurePawnShops(): PawnShopComparison | null {
  const { entries } = getCompanyPriceHistory();
  if (entries.length === 0) return null;

  const names = new Map(getCompanies().map((c) => [c.id, c.name]));
  const to = entries[entries.length - 1].date;
  const from = shift(to, -DAYS);
  const recent = entries.filter((e) => e.date > from);

  const rows: PawnShopRow[] = [];
  let firstUsed: string | null = null;

  for (const id of PAWN_SHOP_IDS) {
    for (const purity of PAWN_PURITIES) {
      let days = 0;
      let above = 0;
      let sumMedian = 0;
      let sumTop = 0;
      for (const e of recent) {
        const own = e.companies[id]?.[purity];
        if (typeof own !== "number" || own <= 0) continue;
        const all = Object.values(e.companies)
          .map((p) => p?.[purity])
          .filter((v): v is number => typeof v === "number" && v > 0)
          .sort((a, b) => a - b);
        if (all.length < MIN_COMPANIES) continue;
        const m = median(all);
        days++;
        if (own > m) above++;
        sumMedian += own - m;
        sumTop += own - all[all.length - 1];
        if (firstUsed === null || e.date < firstUsed) firstUsed = e.date;
      }
      if (days === 0) continue;
      rows.push({
        id,
        name: names.get(id) ?? id,
        purity,
        days,
        daysAboveMedian: above,
        avgVsMedian: Math.round(sumMedian / days),
        avgVsTop: Math.round(sumTop / days),
      });
    }
  }

  if (rows.length === 0 || firstUsed === null) return null;
  return { from: firstUsed, to, rows };
}
