import rawOutlook from "@/data/futuresOutlook.json";

export interface FuturesOutlookEntry {
  /** 記録日(YYYY-MM-DD) */
  date: string;
  /** 金限日先物(スポット相当)の清算値段(円/g) */
  spotPrice: number;
  /** 直近限月の標準先物の銘柄名 */
  nearestContract: string;
  /** 直近限月の限月日(YYYY-MM-DD) */
  nearestTargetDate: string;
  /** 直近限月の標準先物の清算値段(円/g)。=市場が限月日時点の価格として織り込んでいる予想値 */
  nearestPrice: number;
}

export interface FuturesOutlook {
  source: string;
  notes: string;
  entries: FuturesOutlookEntry[];
}

/** 予想(記録日時点のnearestPrice)と実際(限月日到来後のspotPrice)を突き合わせた1件 */
export interface ResolvedOutlook {
  recordedAt: string;
  targetDate: string;
  contract: string;
  predictedPrice: number;
  actualDate: string;
  actualPrice: number;
  diff: number;
  diffPct: number;
}

export function getFuturesOutlook(): FuturesOutlook {
  return rawOutlook as FuturesOutlook;
}

export function getLatestOutlookEntry(outlook: FuturesOutlook): FuturesOutlookEntry | null {
  if (outlook.entries.length === 0) return null;
  return outlook.entries[outlook.entries.length - 1];
}

/**
 * 限月日を過ぎた予想について、その限月日にもっとも近い日の記録(spotPrice)を
 * 「実際の結果」として突き合わせる。限月日以降の記録が1件も無い場合は未解決として除外する
 * (先の日付を捏造しないため)。
 */
export function resolveOutlookHistory(outlook: FuturesOutlook): ResolvedOutlook[] {
  const entries = outlook.entries;
  const resolved: ResolvedOutlook[] = [];

  for (const entry of entries) {
    const target = entry.nearestTargetDate;
    // 限月日以降で、限月日にもっとも近い記録を探す
    const onOrAfter = entries.filter((e) => e.date >= target);
    if (onOrAfter.length === 0) continue; // まだその日を迎えていない(または記録がない)

    const actualEntry = onOrAfter.reduce((closest, e) => (e.date < closest.date ? e : closest));

    resolved.push({
      recordedAt: entry.date,
      targetDate: target,
      contract: entry.nearestContract,
      predictedPrice: entry.nearestPrice,
      actualDate: actualEntry.date,
      actualPrice: actualEntry.spotPrice,
      diff: actualEntry.spotPrice - entry.nearestPrice,
      diffPct: ((actualEntry.spotPrice - entry.nearestPrice) / entry.nearestPrice) * 100,
    });
  }

  // 同じ限月(targetDate)について複数日から記録している場合があるため、
  // 限月ごとに「最も早い時点(=最長の予想期間)」の1件だけを代表として残す。
  const byTarget = new Map<string, ResolvedOutlook>();
  for (const r of resolved) {
    const existing = byTarget.get(r.targetDate);
    if (!existing || r.recordedAt < existing.recordedAt) {
      byTarget.set(r.targetDate, r);
    }
  }

  return [...byTarget.values()].sort((a, b) => (a.targetDate < b.targetDate ? 1 : -1));
}
