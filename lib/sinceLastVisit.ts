import type { PriceHistory } from "@/lib/priceHistory";
import type { Purity } from "@/lib/types";

/**
 * 「前回見たときから、相場がいくら動いたか」を出す。
 *
 * 買取店のサイトは自社の今日の価格しか出せない。日次の記録を持っているのは
 * こちら側なので、「あなたが前に見たときとの差」はこのサイトにしか出せない。
 * 登録もメールも要らず、端末の中だけで完結する。
 *
 * ただし履歴は各社の公表価格の単純平均で、特定1社の価格ではない。
 * 出せるのは「相場がどちらに動いたか」までで、査定額の変化ではない。
 */

/** 履歴に入っている純度。ここに無い純度は比較できない */
export type TrackedPurity = "k24" | "k18" | "pt850" | "ag";

export function isTrackedPurity(p: Purity): p is TrackedPurity {
  return p === "k24" || p === "k18" || p === "pt850" || p === "ag";
}

export interface PriceChange {
  purity: TrackedPurity;
  /** 基準日(前回見た日) */
  since: string;
  /** その日の平均価格 */
  past: number;
  /** 直近の平均価格 */
  latest: number;
  latestDate: string;
  /** 差額(円/g)。プラスなら上がった */
  diff: number;
}

function entryOnOrBefore(history: PriceHistory, date: string) {
  // 指定日以前でいちばん新しい記録。土日など記録の無い日を挟んでも拾える
  let found = null;
  for (const e of history.entries) {
    if (e.date <= date) found = e;
    else break;
  }
  return found;
}

/**
 * 基準日から直近までの変化。比較できない場合は null を返す。
 * 「記録開始より前に見ていた」「その純度の履歴が無い」「同じ日」はいずれも null。
 */
export function priceChangeSince(
  history: PriceHistory,
  purity: Purity,
  since: string,
): PriceChange | null {
  if (!isTrackedPurity(purity)) return null;
  if (!history.entries.length) return null;

  const latestEntry = history.entries[history.entries.length - 1];
  const latest = latestEntry.prices[purity];
  if (latest === undefined) return null;

  // 基準日が記録開始より前なら、その間の動きは持っていない
  if (since < history.entries[0].date) return null;

  const pastEntry = entryOnOrBefore(history, since);
  const past = pastEntry?.prices[purity];
  if (past === undefined || !pastEntry) return null;
  if (pastEntry.date === latestEntry.date) return null;

  return {
    purity,
    since: pastEntry.date,
    past,
    latest,
    latestDate: latestEntry.date,
    diff: latest - past,
  };
}
