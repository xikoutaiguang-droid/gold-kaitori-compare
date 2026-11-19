import { getCompanyPriceHistory } from "@/lib/companyHistory";
import type { Purity } from "@/lib/types";

/**
 * 相見積もりの記事の「何社に見積もりを取れば、どこまで近づくか」。
 *
 * 「金 買取 相見積もり」「金 買取 見積もり」と調べる人は、何社に聞けば足りるのかを知りたい。
 * 各社の公表価格を日次で残しているので、その日の全社の値から
 * 「n社に聞いたとき、そのうちの最高値は、その日の全社の最高値より平均いくら低いか」を
 * くじ引きのように偶然に任せて選んだ場合の期待値として計算できる(乱数は使わず、組合せで厳密に出す)。
 *
 * 期待値の式: 値を昇順に v1..vN と並べると、n社の最大が vi になる確率は C(i-1, n-1) / C(N, n)。
 *
 * - 土日は公表する社が減るので、MIN_COMPANIES社以上が出ている日だけ数える。
 * - 公表価格は品物を見る前の参考値。実際の査定額の差ではない(記事側でもそう書く)。
 */

const DAYS = 28;
const MIN_COMPANIES = 15;
export const QUOTE_COUNTS = [1, 2, 3, 5] as const;
export const QUOTE_PURITIES: Purity[] = ["k24", "k18", "k10", "pt900"];

export interface QuoteCountRow {
  purity: Purity;
  /** 数えた日数 */
  days: number;
  minCompanies: number;
  maxCompanies: number;
  /** n社に聞いたときの、その日の最高値との差の平均(円/g)。QUOTE_COUNTS と同じ順 */
  shortfall: number[];
}

export interface QuoteCountResult {
  from: string;
  to: string;
  rows: QuoteCountRow[];
}

function shift(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return r;
}

/** 昇順の値から、偶然選んだ n 社のうちの最高値の期待値 */
function expectedBestOf(sorted: number[], n: number): number {
  const total = choose(sorted.length, n);
  let e = 0;
  for (let i = 1; i <= sorted.length; i++) {
    e += (sorted[i - 1] * choose(i - 1, n - 1)) / total;
  }
  return e;
}

export function measureQuoteCounts(): QuoteCountResult | null {
  const { entries } = getCompanyPriceHistory();
  if (entries.length === 0) return null;
  const to = entries[entries.length - 1].date;
  const since = shift(to, -DAYS);
  const recent = entries.filter((e) => e.date > since);

  const rows: QuoteCountRow[] = [];
  let firstUsed: string | null = null;

  for (const purity of QUOTE_PURITIES) {
    const sums: number[] = QUOTE_COUNTS.map(() => 0);
    let days = 0;
    let minC = Infinity;
    let maxC = 0;
    for (const e of recent) {
      const all = Object.values(e.companies)
        .map((p) => p?.[purity])
        .filter((v): v is number => typeof v === "number" && v > 0)
        .sort((a, b) => a - b);
      if (all.length < MIN_COMPANIES) continue;
      const top = all[all.length - 1];
      QUOTE_COUNTS.forEach((n, i) => {
        sums[i] += top - expectedBestOf(all, n);
      });
      days++;
      minC = Math.min(minC, all.length);
      maxC = Math.max(maxC, all.length);
      if (firstUsed === null || e.date < firstUsed) firstUsed = e.date;
    }
    if (days === 0) continue;
    rows.push({
      purity,
      days,
      minCompanies: minC,
      maxCompanies: maxC,
      shortfall: sums.map((s) => Math.round(s / days)),
    });
  }

  if (rows.length === 0 || firstUsed === null) return null;
  return { from: firstUsed, to, rows };
}
