/**
 * 土日の記事で引いている各社の記載。
 *
 * なぜ別ファイルに置くか:
 * この記事は3件を引用していたのにページの中に直接書いてあり、
 * 日次の照合(scripts/verify-quotes.mjs)の対象外だった。
 * 田中貴金属の注記は「前日比をどう計算しているか」という、記事の結論そのものを
 * 支えている文なので、書き換わったときに気づけないのは具合が悪い。
 *
 * URLは変数で組まずに1件ずつ書く(組むと照合の対象から外れる)。
 */

export interface WeekendQuote {
  sourceId: string;
  /** 記事に出す出典名 */
  label: string;
  /** 原文のまま。要約しない */
  quote: string;
  sourceUrl: string;
}

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const WEEKEND_CHECKED_AT = "2026年10月15日";

/** 建値を出している側が、土日と前日比をどう扱うと書いているか */
export const BENCHMARK_QUOTES: WeekendQuote[] = [
  {
    sourceId: "tanaka-prev-day",
    label: "田中貴金属工業「貴金属価格情報」",
    quote: "※前日比は、土日・祝日を除く前営業日の9:30の価格と比較して算出しています。",
    sourceUrl: "https://gold.tanaka.co.jp/commodity/souba/",
  },
  {
    sourceId: "tanaka-weekend",
    label: "田中貴金属工業「貴金属価格情報」",
    quote: "※土日・祝日の地金価格は、マーケット市況情報をご参照ください。",
    sourceUrl: "https://gold.tanaka.co.jp/commodity/souba/",
  },
];

/** 送った場合、どの日の価格が使われるか */
export const SHIPPING_DAY_QUOTE: WeekendQuote = {
  sourceId: "nexus-arrival-day",
  label: "ネクサス「買取についての注意事項」",
  quote: "宅配買取をご利用の場合、到着日の買取価格で査定致します。",
  sourceUrl: "https://www.nexus13.co.jp/buy2/notice.php",
};
