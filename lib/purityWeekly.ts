import { getCompanies } from "@/lib/companies";
import { getCompanyPriceHistory } from "@/lib/companyHistory";
import type { Purity } from "@/lib/types";

/**
 * 純度別ページの「この4週間」。
 *
 * 「24金 買取 相場」のような検索は、今日の値だけでなく、最近上がっているのか
 * 下がっているのかも知りたい。国内の相場の推移はどこにでもあるが、
 * 買取店が実際に出している値の推移は、各社の公表値を日次で記録している
 * こちら側にしか無い。
 *
 * 比べ方の注意:
 * - 記録の日付は「その社が価格を公表した日」で、土日や取得失敗の日は飛ぶ。
 *   そこで各時点は「その日以前で、AS_OF_DAYS日以内に公表された、いちばん新しい値」を使う。
 * - 時点ごとに顔ぶれが違うと、中央値の動きが店の入れ替わりで動いてしまう。
 *   全時点で値がある社だけで数える。
 */

/** 何日前の値までを「その日の値」として扱うか(週末の休みを越えられる幅) */
const AS_OF_DAYS = 3;
/** 何週ぶん遡るか */
const WEEKS = 4;
/** これより社数が少ないと、最高値・中央値の比較として読めない */
const MIN_COMPANIES = 3;

export interface WeeklyPoint {
  /** 基準にした日 */
  date: string;
  high: number;
  highName: string;
  median: number;
  low: number;
}

export interface PurityWeekly {
  purity: Purity;
  /** 新しい順 */
  points: WeeklyPoint[];
  /** 全時点で値があり、数えた社数 */
  count: number;
}

function shift(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function measurePurityWeekly(purity: Purity): PurityWeekly | null {
  const { entries } = getCompanyPriceHistory();
  if (entries.length === 0) return null;

  const names = new Map(getCompanies().map((c) => [c.id, c.name]));
  const latest = entries[entries.length - 1].date;
  const dates = Array.from({ length: WEEKS + 1 }, (_, i) => shift(latest, -7 * i));

  // 社ごとの記録(古い順)
  const series = new Map<string, { date: string; price: number }[]>();
  for (const e of entries) {
    for (const [id, prices] of Object.entries(e.companies)) {
      const p = prices?.[purity];
      if (typeof p !== "number" || p <= 0) continue;
      if (!series.has(id)) series.set(id, []);
      series.get(id)!.push({ date: e.date, price: p });
    }
  }

  const asOf = (id: string, date: string): number | undefined => {
    const own = series.get(id);
    if (!own) return undefined;
    const from = shift(date, -AS_OF_DAYS);
    let found: number | undefined;
    for (const r of own) {
      if (r.date > date) break;
      if (r.date >= from) found = r.price;
    }
    return found;
  };

  // 掲載中の社のうち、全時点で値がある社だけ
  const ids = [...series.keys()].filter(
    (id) => names.has(id) && dates.every((d) => asOf(id, d) !== undefined),
  );
  if (ids.length < MIN_COMPANIES) return null;

  const points: WeeklyPoint[] = dates.map((date) => {
    const rows = ids
      .map((id) => ({ id, value: asOf(id, date) as number }))
      .sort((a, b) => b.value - a.value);
    return {
      date,
      high: rows[0].value,
      highName: names.get(rows[0].id) ?? rows[0].id,
      median: rows[(rows.length - 1) >> 1].value,
      low: rows[rows.length - 1].value,
    };
  });

  return { purity, points, count: ids.length };
}
