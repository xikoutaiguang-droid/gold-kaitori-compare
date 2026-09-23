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
  companies: Record<string, Partial<Record<Purity, number>>>;
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
 * その社の記録が無い日は飛ばして、指定日数前かそれより古い直近の記録と比べる。
 * 記録が足りない、その純度を公表していない、値が動いていない場合は null。
 */
export function companyPriceChange(
  companyId: string,
  purity: Purity,
  daysBack = 7,
): CompanyPriceChange | null {
  const { entries } = getCompanyPriceHistory();
  if (entries.length < 2) return null;

  const latestEntry = entries[entries.length - 1];
  const latest = latestEntry.companies[companyId]?.[purity];
  if (latest === undefined) return null;

  const targetIndex = entries.length - 1 - daysBack;
  if (targetIndex < 0) return null;

  // 指定日から遡って、その社の値がある最初の記録を探す
  let pastEntry: CompanyHistoryEntry | null = null;
  for (let i = targetIndex; i >= 0; i--) {
    if (entries[i].companies[companyId]?.[purity] !== undefined) {
      pastEntry = entries[i];
      break;
    }
  }
  if (!pastEntry) return null;

  const past = pastEntry.companies[companyId]![purity]!;
  if (past === latest) return null;

  return {
    purity,
    since: pastEntry.date,
    past,
    latest,
    latestDate: latestEntry.date,
    diff: latest - past,
    daysCompared: entries.length - 1 - entries.indexOf(pastEntry),
  };
}
