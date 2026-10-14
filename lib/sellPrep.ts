/**
 * 「売る前にできる準備」の記事で引いている各社の記載。
 *
 * なぜ要るか:
 * この記事はもともと、出典も計算も無い一般的な助言の箇条書きだった。
 * そのうちの「品物をきれいにしておく」は、各社の書いていることと食い違う。
 * 貴金属は重さと純度で決まるので、磨いても単価は上がらない、と向こうが明記している。
 * 当サイトが自分で確かめずに「やったほうがいい」と書いていたことになる。
 *
 * 置き方は lib/fees.ts などと同じ。引用はここに集めて
 * scripts/verify-quotes.mjs に毎日取り直させる。
 * URLは変数で組まずに1件ずつ書く(組むと照合の対象から外れる)。
 */

export interface PrepQuote {
  sourceId: string;
  /** 記事に出す出典名 */
  label: string;
  /** 原文のまま。要約しない */
  quote: string;
  sourceUrl: string;
  /** 掲載社のID */
  shopId: string;
}

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const PREP_CHECKED_AT = "2026年10月15日";

/**
 * 汚れや傷が地金の査定に効かない、と各社が書いているもの。
 * 「磨いてから持っていく」は、ここでは意味を持たない。
 */
export const CONDITION_QUOTES: PrepQuote[] = [
  {
    sourceId: "goldplaza-condition",
    label: "ゴールドプラザ 金・貴金属買取のよくある質問",
    quote: "貴金属に関しましては影響ありません。基本的に重量でのお買取となっております。",
    sourceUrl: "https://goldplaza.jp/gold",
    shopId: "goldplaza",
  },
  {
    sourceId: "rodeodrive-condition",
    label: "ロデオドライブ 金・プラチナ買取のQ&A",
    quote:
      "金・プラチナの場合、状態の良し悪しに関わらず、純度と重さで査定額が決定しますので、汚れている、壊れているという理由で金・プラチナの査定額が下がることはありません。",
    sourceUrl: "https://kaitori.rodeodrive.co.jp/gold/",
    shopId: "rodeodrive",
  },
];

/**
 * 逆に、地金としてではなく「製品として」値が付く場合があることを書いている社。
 * 付属品や状態が効くのはこちらで、地金のほうではない。
 */
export const PRODUCT_VALUE_QUOTES: PrepQuote[] = [
  {
    sourceId: "goldplaza-design",
    label: "ゴールドプラザ 金・貴金属買取のよくある質問",
    quote:
      "実際にはお品物のデザイン料をプラスでお付けできるかもしれませんので是非店頭にお持ちくださいませ。",
    sourceUrl: "https://goldplaza.jp/gold",
    shopId: "goldplaza",
  },
  {
    sourceId: "ginzaya-product-premium-prep",
    label: "銀座屋 金・貴金属買取",
    quote: "製品として販売可能なアクセサリーについてはプラスでお値段をお付けさせていただきます。",
    sourceUrl: "https://ginzaya.co.jp/items/gold/",
    shopId: "ginzaya",
  },
];
