import { getReferenceRate } from "@/lib/companies";

/**
 * 税の話に出てくる金額が、金なら何グラムにあたるのかを出す。
 *
 * 条文の金額(30万円・50万円・200万円)は長く変わらないので本文に直接書く。
 * 変わるのは「それが何グラムか」のほうで、相場が動けば毎日変わる。
 * 記事に「約130g」と書いてしまうと、半年後には黙って嘘になる。
 * だからグラム数は書かずに、ここで当日の参考価格から出す。
 *
 * 使うのは田中貴金属の店頭買取価格(税込)。各社の宝飾品スクラップ価格ではなく
 * 地金の基準値なので、「インゴットを何本売ったら」という話に合う。
 * 価格が取れていないときは null を返す。推測した数字を出すくらいなら、
 * その一文ごと出さないほうがいい。
 */

/** 生活用動産が非課税から外れる線(所得税法施行令第25条)。1個または1組につき */
export const NON_TAXABLE_ITEM_LIMIT = 300_000;
/** 譲渡所得の特別控除(所得税法第33条)。売った額ではなく、もうけから引く */
export const SPECIAL_DEDUCTION = 500_000;
/** 支払調書が出る線(所得税法施行令第350条の7)。これ「以下」なら告知は要らない */
export const PAYMENT_RECORD_LIMIT = 2_000_000;

export interface GramsAt {
  /** 元になった金額(円) */
  amount: number;
  /** その金額にあたる純金の重さ(g) */
  grams: number;
  /** 使った1gあたりの単価(円) */
  unitPrice: number;
  source: string;
  sourceUrl: string;
  /** その単価がいつのものか */
  updatedAt: string;
}

/**
 * ある金額が、当日の参考価格で純金何グラムにあたるか。
 * 参考価格が無ければ null。
 */
export function gramsOfGold(amount: number): GramsAt | null {
  const rate = getReferenceRate();
  const unitPrice = rate.prices.k24;
  if (!unitPrice || !Number.isFinite(unitPrice) || unitPrice <= 0) return null;
  return {
    amount,
    grams: amount / unitPrice,
    unitPrice,
    source: rate.source,
    sourceUrl: rate.sourceUrl,
    updatedAt: rate.updatedAt,
  };
}

/** 表示用。10g未満は小数第1位まで、それ以上は整数に丸める */
export function formatGrams(grams: number): string {
  return grams < 10 ? grams.toFixed(1) : Math.round(grams).toLocaleString("ja-JP");
}
