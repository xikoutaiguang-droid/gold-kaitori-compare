import { getCompanyPriceHistory } from "@/lib/companyHistory";
import type { Purity } from "@/lib/types";

/**
 * 曜日ごとに、各社の価格がどれだけ動いたかを測る。
 *
 * 「土日に売ると損か」は読む人の素朴な疑問だが、答えを持っているのは
 * 各社の公式サイトではない。どの店も自社の今日の値しか載せないので、
 * 「日曜は誰も値を変えていない」ことは、毎日20社ぶんを記録している
 * こちら側でしか確かめられない。
 *
 * 文章に数字を直書きしない。記録が伸びれば中身も変わるので、
 * 見出しまで含めてここで測った値から組み立てる。
 */

const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;
export type DayLabel = (typeof DOW)[number];

/**
 * 曜日。
 *
 * new Date("2026-10-04T00:00:00+09:00").getDay() は使えない。getDay() は
 * 実行環境のタイムゾーンで曜日を返すので、UTCで動くVercelのビルドでは
 * 日本時間の日曜が土曜として数えられ、曜日が丸ごと1日ずれる。
 * (実際それで本番だけ「日曜は78%」= 月曜の値 になった。手元のJSTでは正しく出る。)
 * 記録の日付は「その店がその日に公表した」というカレンダー上の日付なので、
 * 時刻を持ち込まずに数える。
 */
function dayOf(iso: string): DayLabel {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return DOW[0];
  return DOW[new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay()];
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const a = [...values].sort((x, y) => x - y);
  return a[(a.length - 1) >> 1];
}

function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((x, y) => x + y, 0) / values.length;
}

export interface DayStat {
  day: DayLabel;
  /** その曜日を何日ぶん記録しているか */
  samples: number;
  /** その日の日付で価格を公表した社数の平均 */
  publishing: number;
  /**
   * 前日と1円でも違う値を出した社の割合(%)。
   * 日付が飛んでいる区間は数えない(前日と比べられないため)。
   */
  changedPct: number | null;
  /** changedPct を出せた日数 */
  changedSamples: number;
}

export interface WeekendMeasurement {
  purity: Purity;
  /** 記録している日数 */
  days: number;
  firstDate: string;
  lastDate: string;
  byDay: DayStat[];
  /** 日曜に値を変えた社の割合(%)。0 なら「日曜はどこも動かない」 */
  sundayChangedPct: number | null;
  /** 平日(月〜金)で値を変えた社の割合(%)の平均 */
  weekdayChangedPct: number | null;
  /** 土曜に値を変えた社の割合(%) */
  saturdayChangedPct: number | null;
  /** 金曜から翌月曜までの、掲載社の中央値の変化率(%) */
  weekendGaps: { from: string; to: string; pct: number; companies: number }[];
  /** weekendGaps のうち、動きがいちばん大きかったもの */
  largestGap: { from: string; to: string; pct: number; companies: number } | null;
}

export function measureWeekend(purity: Purity = "k24"): WeekendMeasurement | null {
  const { entries } = getCompanyPriceHistory();
  if (entries.length < 7) return null;

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const byDate = new Map(sorted.map((e) => [e.date, e.companies]));
  const dates = sorted.map((e) => e.date);

  // 曜日ごとの「公表した社数」と「前日と違う値を出した社の割合」
  const publishing: Record<string, number[]> = {};
  const changed: Record<string, number[]> = {};

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const day = dayOf(date);
    const today = byDate.get(date) ?? {};
    (publishing[day] = publishing[day] ?? []).push(Object.keys(today).length);

    if (i === 0) continue;
    const prevDate = dates[i - 1];
    const gapDays = (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${prevDate}T00:00:00Z`)) / 86_400_000;
    if (gapDays !== 1) continue; // 記録が飛んだ区間は「前日比」にならない

    const prev = byDate.get(prevDate) ?? {};
    let moved = 0;
    let comparable = 0;
    for (const id of Object.keys(today)) {
      const now = today[id]?.[purity];
      const before = prev[id]?.[purity];
      if (typeof now !== "number" || typeof before !== "number") continue;
      comparable++;
      if (now !== before) moved++;
    }
    if (comparable > 0) (changed[day] = changed[day] ?? []).push((moved / comparable) * 100);
  }

  const byDay: DayStat[] = DOW.map((day) => ({
    day,
    samples: publishing[day]?.length ?? 0,
    publishing: Math.round((mean(publishing[day] ?? []) ?? 0) * 10) / 10,
    changedPct: changed[day]?.length ? Math.round(mean(changed[day])!) : null,
    changedSamples: changed[day]?.length ?? 0,
  })).filter((d) => d.samples > 0);

  const weekdayValues = (["月", "火", "水", "木", "金"] as DayLabel[]).flatMap((d) => changed[d] ?? []);

  // 金曜 → 翌月曜。市場が閉まっている間に動いたぶんが、週明けにまとめて出る。
  const weekendGaps: WeekendMeasurement["weekendGaps"] = [];
  for (const from of dates) {
    if (dayOf(from) !== "金") continue;
    const to = dates.find(
      (d) =>
        (Date.parse(`${d}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000 === 3 && dayOf(d) === "月",
    );
    if (!to) continue;
    const a = byDate.get(from) ?? {};
    const b = byDate.get(to) ?? {};
    const pcts: number[] = [];
    for (const id of Object.keys(b)) {
      const before = a[id]?.[purity];
      const now = b[id]?.[purity];
      if (typeof before !== "number" || before <= 0 || typeof now !== "number") continue;
      pcts.push(((now - before) / before) * 100);
    }
    const m = median(pcts);
    if (m === null) continue;
    weekendGaps.push({ from, to, pct: Math.round(m * 100) / 100, companies: pcts.length });
  }

  const largestGap =
    weekendGaps.length === 0
      ? null
      : weekendGaps.reduce((best, g) => (Math.abs(g.pct) > Math.abs(best.pct) ? g : best));

  const round = (v: number | null) => (v === null ? null : Math.round(v));

  return {
    purity,
    days: dates.length,
    firstDate: dates[0],
    lastDate: dates[dates.length - 1],
    byDay,
    sundayChangedPct: round(mean(changed["日"] ?? [])),
    weekdayChangedPct: round(mean(weekdayValues)),
    saturdayChangedPct: round(mean(changed["土"] ?? [])),
    weekendGaps,
    largestGap,
  };
}
