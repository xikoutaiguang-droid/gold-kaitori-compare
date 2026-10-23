import { getCompanyPriceHistory } from "@/lib/companyHistory";
import type { Purity } from "@/lib/types";

/**
 * 「この店は、他の店と比べてどういう店だったのか」を記録から測る。
 *
 * 各社の公式サイトに載っているのは自社の今日の価格だけで、昨日いくらだったかも、
 * 他社と比べて高かったのかも書かれていない。当サイトは毎日全社を記録しているので、
 * 「この社が何日1位だったか」「価格を何日動かしたか」を出せる。
 * 会社ページがどれも同じ形に見えるのは、載せているのが今日の数字だけだからで、
 * 社ごとに本当に違うのはこちらのほうになる。
 *
 * 断定の仕方に注意すること:
 *   ・順位は「その日にその純度を公表していた社の中での順位」。母数は日によって変わる。
 *     取得に失敗した社がいる日は母数が小さくなるので、母数も一緒に出す。
 *   ・記録は「その社が公表した日」にしか増えない。日付は飛ぶ。
 *     件数(days)と期間(spanDays)は違う数字なので、両方返して呼ぶ側に選ばせる。
 *   ・同じ価格の社が並ぶ日がある。順位は同値を同じ順位として数える。
 */
export interface CompanyTrackRecord {
  purity: Purity;
  /** その社の記録がある日数 */
  days: number;
  /** 最初の記録から最後の記録までの暦日数 */
  spanDays: number;
  firstDate: string;
  lastDate: string;
  /** 同じ日にその純度を公表していた社数の、最小と最大 */
  fieldMin: number;
  fieldMax: number;
  /** 順位の平均・最良・最悪 */
  averageRank: number;
  bestRank: number;
  worstRank: number;
  /** 1位だった日数 */
  topDays: number;
  /** その日の中央値以上だった日数 */
  aboveMedianDays: number;
  /** 前回の記録から価格が変わった日数 */
  movedDays: number;
  /** 価格が変わりえた回数(2件目以降の記録数) */
  moveChances: number;
}

/** これ未満の記録しかない社は、傾向として語れないので出さない */
export const MIN_TRACK_RECORD_DAYS = 10;

export function measureTrackRecord(companyId: string, purity: Purity): CompanyTrackRecord | null {
  const { entries } = getCompanyPriceHistory();

  let days = 0;
  let rankSum = 0;
  let bestRank = Infinity;
  let worstRank = 0;
  let topDays = 0;
  let aboveMedianDays = 0;
  let movedDays = 0;
  let moveChances = 0;
  let fieldMin = Infinity;
  let fieldMax = 0;
  let firstDate = "";
  let lastDate = "";
  let previous: number | null = null;

  for (const entry of entries) {
    const mine = entry.companies[companyId]?.[purity];
    if (typeof mine !== "number" || mine <= 0) continue;

    const field = Object.values(entry.companies)
      .map((prices) => prices?.[purity])
      .filter((p): p is number => typeof p === "number" && p > 0)
      .sort((a, b) => b - a);
    if (field.length === 0) continue;

    days += 1;
    if (!firstDate) firstDate = entry.date;
    lastDate = entry.date;

    // 同じ価格の社は同じ順位にする。indexOf は先頭の位置を返すので同値は同順になる。
    const rank = field.indexOf(mine) + 1;
    rankSum += rank;
    if (rank < bestRank) bestRank = rank;
    if (rank > worstRank) worstRank = rank;
    if (rank === 1) topDays += 1;

    const median = field[(field.length - 1) >> 1];
    if (mine >= median) aboveMedianDays += 1;

    if (field.length < fieldMin) fieldMin = field.length;
    if (field.length > fieldMax) fieldMax = field.length;

    if (previous !== null) {
      moveChances += 1;
      if (previous !== mine) movedDays += 1;
    }
    previous = mine;
  }

  if (days < MIN_TRACK_RECORD_DAYS) return null;

  const spanDays =
    Math.round(
      (new Date(lastDate).getTime() - new Date(firstDate).getTime()) / 86_400_000,
    ) + 1;

  return {
    purity,
    days,
    spanDays,
    firstDate,
    lastDate,
    fieldMin,
    fieldMax,
    averageRank: rankSum / days,
    bestRank,
    worstRank,
    topDays,
    aboveMedianDays,
    movedDays,
    moveChances,
  };
}
