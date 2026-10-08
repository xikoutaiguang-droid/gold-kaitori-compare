import rawFx from "@/data/fxRate.json";
import { getFuturesOutlook } from "@/lib/futuresOutlook";

/**
 * 「今日の金価格は、なぜその値動きになったのか」を数字で分ける。
 *
 * 考え方は1本の式だけ:
 *
 *   円建ての金価格 = ドル建ての金価格 × ドル円
 *
 * だから前日からの動きは、為替が動いたぶんと、それ以外に分けられる。
 *
 *   為替で説明できる分 = (前日の円建て価格 ÷ 前日のドル円) × ドル円の変化
 *   残り              = 円建ての変化 − 為替で説明できる分
 *
 * 大事なのは、これが予想でも相場観でもないこと。前日と今日の2つの数字から出る計算で、
 * 誰でも同じ答えになる。ニュースを読んで「これは良い材料」と仕分ける作りにしなかったのは、
 * その仕分けが当サイトの主張になってしまい、外れても誰も検証できないため。
 *
 * ドル建ての金価格そのものは当サイトでは取得していない(無料で再配布できる出どころが
 * 見つからなかった)。だから「残り」は、金そのものの需給だけでなく、
 * 時点のずれや国内のその他の事情もまとめて含む。ページ側でもそう書いている。
 */

export interface FxEntry {
  date: string;
  usdJpy: number;
}

export interface FxData {
  source: string;
  sourceUrl: string;
  via: string;
  notes: string;
  entries: FxEntry[];
}

export interface DriverDay {
  date: string;
  /** 大阪取引所の金先物(スポット相当)の清算値段(円/g) */
  goldJpy: number;
  usdJpy: number;
  /** 前日比(円/g) */
  changeJpy: number;
  /** そのうち為替の動きで説明できる分(円/g) */
  fxPart: number;
  /** 為替では説明できない残り(円/g) */
  restPart: number;
  /** 前日比のドル円(円) */
  fxChange: number;
  /** 直前の記録日 */
  previousDate: string;
}

export function getFxData(): FxData {
  return rawFx as FxData;
}

/**
 * 金価格と為替の両方が記録されている日だけを並べ、前の記録日との差を分解する。
 *
 * 片方しか無い日は捨てる。取引所が休みの日の値を前日で埋めると、
 * 動いていないものが動いたことになる。
 */
export function measureDrivers(): DriverDay[] {
  const fx = new Map(getFxData().entries.map((e) => [e.date, e.usdJpy]));
  const gold = getFuturesOutlook().entries;

  const paired = gold
    .filter((g) => fx.has(g.date))
    .map((g) => ({ date: g.date, goldJpy: g.spotPrice, usdJpy: fx.get(g.date) as number }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const out: DriverDay[] = [];
  for (let i = 1; i < paired.length; i += 1) {
    const prev = paired[i - 1];
    const cur = paired[i];
    const changeJpy = cur.goldJpy - prev.goldJpy;
    const fxChange = cur.usdJpy - prev.usdJpy;
    // 前日のドル建て価格(円建て ÷ ドル円)に、為替の変化を掛けたもの
    const fxPart = (prev.goldJpy / prev.usdJpy) * fxChange;
    out.push({
      date: cur.date,
      goldJpy: cur.goldJpy,
      usdJpy: cur.usdJpy,
      changeJpy,
      fxPart,
      restPart: changeJpy - fxPart,
      fxChange,
      previousDate: prev.date,
    });
  }
  return out;
}

/** 直近の1日。記録が足りなければ null */
export function latestDriver(days: DriverDay[]): DriverDay | null {
  return days.length ? days[days.length - 1] : null;
}

/**
 * ある日の動きを、どちらが主だったかで言い分ける。
 *
 * 文章を分岐で作ると、境目の値で言い回しがぶれる。ここでは3つにしか分けない。
 * 判定に使う数字もそのまま返すので、読む人が自分で確かめられる。
 */
export type DriverVerdict = "fx" | "rest" | "mixed" | "flat";

export function verdictOf(day: DriverDay): DriverVerdict {
  // 1円未満の動きは、丸めの範囲なので「ほぼ動いていない」とする
  if (Math.abs(day.changeJpy) < 1) return "flat";
  const fxShare = Math.abs(day.fxPart) / (Math.abs(day.fxPart) + Math.abs(day.restPart));
  if (fxShare >= 0.7) return "fx";
  if (fxShare <= 0.3) return "rest";
  return "mixed";
}

/** 期間の合計。何日分を見ているかも返す(「31日で」と書けるように) */
export function totalOver(days: DriverDay[], count: number) {
  const slice = days.slice(-count);
  if (!slice.length) return null;
  return {
    days: slice.length,
    from: slice[0].previousDate,
    to: slice[slice.length - 1].date,
    changeJpy: slice.reduce((s, d) => s + d.changeJpy, 0),
    fxPart: slice.reduce((s, d) => s + d.fxPart, 0),
    restPart: slice.reduce((s, d) => s + d.restPart, 0),
  };
}
