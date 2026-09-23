import raw from "@/data/companyPriceHistory.json";
import type { Purity } from "@/lib/types";

/**
 * 社別の価格履歴。
 *
 * priceHistory.json は各社の平均なので、「この店が先週いくらだったか」は出せなかった。
 * 買取店の公式サイトは自社の今日の価格しか載せないため、ある店の価格が
 * どう動いたかを見られるのは、日次で記録しているこちら側だけになる。
 */
export interface CompanyHistoryEntry {
  date: string;
  /** その日に価格を公表した社だけが入る。取れなかった社はキーごと無い。 */
  companies: Record<string, Partial<Record<Purity, number>> | undefined>;
}

export interface CompanyPriceHistory {
  recordingStartedAt: string | null;
  notes: string;
  entries: CompanyHistoryEntry[];
}

export function getCompanyPriceHistory(): CompanyPriceHistory {
  return raw as CompanyPriceHistory;
}

export interface CompanyPriceChange {
  purity: Purity;
  /** 比較の基準にした日 */
  since: string;
  past: number;
  latest: number;
  latestDate: string;
  /** 差額(円/g)。プラスなら上がった */
  diff: number;
  /** 実際に何日前と比べたか。記録の無い日を挟むとdaysBackとずれる */
  daysCompared: number;
}

/**
 * ある社の、指定日数前からの価格の変化。
 *
 * 記録は「その社が価格を公表した日」で並んでいるので、日付が飛ぶことがある。
 * 番号で何件か遡るのではなく、日付で「指定日数前かそれより古い、いちばん新しい記録」を
 * 探す。実際に何日前と比べたかは daysCompared に入れて、呼ぶ側が言い切らずに済むようにする。
 */
export function companyPriceChange(
  companyId: string,
  purity: Purity,
  daysBack = 7,
): CompanyPriceChange | null {
  const { entries } = getCompanyPriceHistory();
  if (entries.length < 2) return null;

  // その社の記録だけを取り出す。公表日が飛んでいる社があるため、全体の最新日ではなく
  // その社の最新の公表日を基準にする。
  const own = entries
    .map((e) => ({ date: e.date, price: e.companies[companyId]?.[purity] }))
    .filter((e): e is { date: string; price: number } => e.price !== undefined);
  if (own.length < 2) return null;

  const latest = own[own.length - 1];
  const target = new Date(latest.date);
  target.setUTCDate(target.getUTCDate() - daysBack);
  const targetDate = target.toISOString().slice(0, 10);

  // 指定日以前でいちばん新しい記録。無ければ記録が足りないので出さない
  let past: { date: string; price: number } | null = null;
  for (const e of own) {
    if (e.date <= targetDate) past = e;
    else break;
  }
  if (!past || past.price === latest.price) return null;

  const daysCompared = Math.round(
    (new Date(latest.date).getTime() - new Date(past.date).getTime()) / 86_400_000,
  );

  return {
    purity,
    since: past.date,
    past: past.price,
    latest: latest.price,
    latestDate: latest.date,
    diff: latest.price - past.price,
    daysCompared,
  };
}
