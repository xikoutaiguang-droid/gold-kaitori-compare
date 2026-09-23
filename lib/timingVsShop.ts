import { getCompanyPriceHistory } from "@/lib/companyHistory";
import rawCompanies from "@/data/companies.json";
import type { Company, Purity } from "@/lib/types";

/**
 * 「いつ売るか」と「どこで売るか」は、どちらがいくら効くのかを測る。
 *
 * 買取店の公式サイトは自社の今日の値しか載せない。だから「先週この店はいくらだったか」
 * を持っているのは、日次で記録しているこちら側だけになる。その記録が溜まって初めて、
 * 日をずらしたときの差と、店を変えたときの差を、同じ単位(円/g)で並べられる。
 *
 * 比較を成立させるために、記録がほぼ全日そろっている社だけの固定パネルを作り、
 * そのパネル全員の値がある日だけを使う。日によって社数が変わると、
 * 「差が広がった」のか「安い社がその日だけ記録されていた」のかが区別できなくなる。
 * 実際、極端に安い1社が記録された日だけ差が5,500円に跳ねて見えていた。
 */

/** パネルに入れる条件。全日数のうちこの割合以上の記録があること */
const PANEL_COVERAGE = 0.9;
/** これを下回ると、差を語るには社数が足りない */
const MIN_PANEL = 5;
/** これを下回ると、期間として短すぎる */
const MIN_DAYS = 7;

export interface DailyRow {
  date: string;
  high: number;
  low: number;
  median: number;
  leaderName: string;
}

export interface ShopMovement {
  name: string;
  low: number;
  high: number;
  /** 期間中の自社の値幅 */
  range: number;
  /** 前回の記録から値を変えた日数 */
  changedDays: number;
  /** 比較に使った日数 - 1 */
  comparedDays: number;
}

export interface TimingVsShop {
  purity: Purity;
  from: string;
  to: string;
  /** パネル全員がそろった日数 */
  days: number;
  panelSize: number;
  panelNames: string[];

  daily: DailyRow[];

  /** 同じ日の最高と最低の差 */
  gapMin: number;
  gapMax: number;
  gapMedian: number;

  /** 期間中に中央値が動いた幅。「売る日を選ぶ」ほうの効き */
  medianRange: number;
  medianLow: number;
  medianHigh: number;
  medianLowDate: string;
  medianHighDate: string;

  /** 1位になったことのある社と、その日数 */
  leaders: { name: string; days: number }[];
  /** 1位の顔ぶれが入れ替わった回数 */
  leaderChanges: number;

  /** 社ごとの値動き。値幅の大きい順 */
  shops: ShopMovement[];
}

const median = (sorted: number[]) => sorted[(sorted.length - 1) >> 1];

export function measureTimingVsShop(purity: Purity): TimingVsShop | null {
  const { entries } = getCompanyPriceHistory();
  if (entries.length < MIN_DAYS) return null;

  const priceOn = (dayIndex: number, id: string): number | undefined =>
    entries[dayIndex].companies[id]?.[purity];

  // 1. どの社が、何日ぶん記録されているか
  const coverage = new Map<string, number>();
  entries.forEach((_, i) => {
    for (const id of Object.keys(entries[i].companies)) {
      if (priceOn(i, id) !== undefined) coverage.set(id, (coverage.get(id) ?? 0) + 1);
    }
  });

  const needed = entries.length * PANEL_COVERAGE;
  const panel = [...coverage.entries()]
    .filter(([, n]) => n >= needed)
    .map(([id]) => id);
  if (panel.length < MIN_PANEL) return null;

  // 2. パネル全員の値がある日だけを使う
  const usable = entries
    .map((e, i) => ({ e, i }))
    .filter(({ i }) => panel.every((id) => priceOn(i, id) !== undefined));
  if (usable.length < MIN_DAYS) return null;

  const companies = rawCompanies as Company[];
  const nameOf = (id: string) => companies.find((c) => c.id === id)?.name ?? id;

  const daily: DailyRow[] = [];
  const winDays = new Map<string, number>();
  let leaderChanges = 0;
  let lastLeader: string | null = null;

  for (const { e, i } of usable) {
    const rows = panel
      .map((id) => ({ id, price: priceOn(i, id)! }))
      .sort((a, b) => b.price - a.price);
    const leader = rows[0];
    if (lastLeader !== null && lastLeader !== leader.id) leaderChanges++;
    lastLeader = leader.id;
    winDays.set(leader.id, (winDays.get(leader.id) ?? 0) + 1);
    daily.push({
      date: e.date,
      high: leader.price,
      low: rows[rows.length - 1].price,
      median: median(rows.map((r) => r.price).sort((a, b) => a - b)),
      leaderName: nameOf(leader.id),
    });
  }

  const gaps = daily.map((d) => d.high - d.low).sort((a, b) => a - b);
  const medians = daily.map((d) => d.median);
  const medianLow = Math.min(...medians);
  const medianHigh = Math.max(...medians);

  const shops: ShopMovement[] = panel
    .map((id) => {
      const values = usable.map(({ i }) => priceOn(i, id)!);
      let changedDays = 0;
      for (let k = 1; k < values.length; k++) if (values[k] !== values[k - 1]) changedDays++;
      const low = Math.min(...values);
      const high = Math.max(...values);
      return { name: nameOf(id), low, high, range: high - low, changedDays, comparedDays: values.length - 1 };
    })
    .sort((a, b) => b.range - a.range);

  return {
    purity,
    from: daily[0].date,
    to: daily[daily.length - 1].date,
    days: daily.length,
    panelSize: panel.length,
    panelNames: panel.map(nameOf),
    daily,
    gapMin: gaps[0],
    gapMax: gaps[gaps.length - 1],
    gapMedian: median(gaps),
    medianRange: medianHigh - medianLow,
    medianLow,
    medianHigh,
    medianLowDate: daily.find((d) => d.median === medianLow)!.date,
    medianHighDate: daily.find((d) => d.median === medianHigh)!.date,
    leaders: [...winDays.entries()]
      .map(([id, days]) => ({ name: nameOf(id), days }))
      .sort((a, b) => b.days - a.days),
    leaderChanges,
    shops,
  };
}
