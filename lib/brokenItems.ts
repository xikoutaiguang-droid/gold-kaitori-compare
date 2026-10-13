import { measureSpread } from "@/lib/spread";
import type { Purity } from "@/lib/types";

/**
 * 「壊れていても、金の単価は下がりません」で引いている各社の記載。
 *
 * 置き方は lib/dentalGold.ts と同じ。本文に文字列で書くと相手が書き換えたときに
 * 気づけないので、引用はここに集めて scripts/verify-quotes.mjs に毎日取り直させる。
 * URLは変数で組まずに1件ずつ書く(組むと照合の対象から外れる)。
 *
 * 集め方:
 * 2026年10月13日に、その時点で掲載していた25社の価格表ページと公式トップを機械的に読み、
 * 「壊れ」「変形」「歪」「切れ」「片方」「欠け」を含む文を拾った。
 * そのうち、金・プラチナの買取についてはっきり書いてある社の文だけを載せている。
 * ブランド品やバッグについての記載は、地金の話と混ざるので採らない。
 *
 * 「載っていない社」は「断る社」ではない。当サイトが見た2ページに
 * 書かれていなかっただけなので、記事でもそう書く。
 */

export interface BrokenQuote {
  sourceId: string;
  /** 記事に出す出典名 */
  label: string;
  /** 原文のまま。要約しない */
  quote: string;
  sourceUrl: string;
  /** 掲載社のID(/company/ へのリンクに使う) */
  shopId: string;
}

/** 上の調査をした時点で当サイトが掲載していた社数。調べた範囲であって、現在の掲載数ではない */
export const SURVEYED_SHOPS = 25;

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const BROKEN_CHECKED_AT = "2026年10月13日";

/**
 * 「壊れていても価格は変わらない」とまで書いている社。
 * 「買取できます」だけの社とは別に置く。言っていることの強さが違う。
 */
export const SAME_PRICE_QUOTES: BrokenQuote[] = [
  {
    sourceId: "ginzaya-same-price",
    label: "銀座屋 よくあるご質問",
    quote:
      "金やプラチナなど貴金属のアクセサリー類は、壊れていても壊れていないものと同じ金額で買取が可能です。",
    sourceUrl: "https://ginzaya.co.jp/",
    shopId: "ginzaya",
  },
  {
    sourceId: "rodeodrive-same-price",
    label: "ロデオドライブ 金・プラチナ買取のQ&A",
    quote:
      "たとえ壊れていても、金やプラチナは素材の重量と純度など地金の価値で買取価格を算出していますので、形状問わず買取が可能です。形状によって買取価格が下がることもございませんので",
    sourceUrl: "https://kaitori.rodeodrive.co.jp/gold/",
    shopId: "rodeodrive",
  },
];

/** 理由(溶かして使うから形は関係ない)まで書いている社 */
export const REASON_QUOTES: BrokenQuote[] = [
  {
    sourceId: "galleryrare-melt",
    label: "ギャラリーレア 金・プラチナ買取",
    quote: "溶かして再利用するため、もちろん汚れていても欠けていても大丈夫。",
    sourceUrl: "https://galleryrare.jp/goldplatinum/",
    shopId: "galleryrare",
  },
  {
    sourceId: "fukuchan-weight",
    label: "福ちゃん 金・貴金属買取のよくあるご質問",
    quote:
      "破損したアクセサリーなどでも、問題なくお買取させていただきます。金やプラチナなどは重量で買取価格をご提示させていただきますので",
    sourceUrl: "https://fuku-chan.info/gold/",
    shopId: "fukuchan",
  },
];

/** 受け付けると書いている社。状態をどこまで挙げているかが社ごとに違う */
export const ACCEPTED_QUOTES: BrokenQuote[] = [
  {
    sourceId: "e-daikoku-broken",
    label: "大黒屋 金買取",
    quote: "古いもの、珍品、壊れたものでも金商品・金製品なら何でもお買取りいたします。",
    sourceUrl: "https://kaitori.e-daikoku.com/brand/genre/gold.html",
    shopId: "e-daikoku",
  },
  {
    sourceId: "refasta-broken",
    label: "リファスタ よくあるご質問",
    quote:
      "当社では、壊れた貴金属ジュエリーや切れたネックレスチェーン、指輪1点など、少量からでもお買い取りしております。",
    sourceUrl: "https://kinkaimasu.jp/",
    shopId: "refasta",
  },
  {
    sourceId: "kingram-deform",
    label: "キングラム 金・プラチナ買取",
    quote: "力仕事をして変形してしまった指輪など、指輪の形状をしていなくも金であれば買取りします。",
    sourceUrl: "https://kingram.jp/lineup/goldplatinum/gold/",
    shopId: "kingram",
  },
  {
    sourceId: "kaitori-elite-broken",
    label: "買取エリート 金買取",
    quote: "サイズが合わない、デザインが古い、壊れているなどでも喜んで買取をさせていただきます！",
    sourceUrl: "https://kaitori-off.net/gold/",
    shopId: "kaitori-elite",
  },
  {
    sourceId: "netoff-broken-list",
    label: "ネットオフ 金・貴金属買取（こんなものでもOK!）",
    quote: "石が欠けているもの ／ 変形したもの",
    sourceUrl: "https://www.netoff.co.jp/brand/jewelry/gold/",
    shopId: "netoff",
  },
  {
    sourceId: "best-life-broken-list",
    label: "ベストライフ 金・貴金属買取（どんな状態でもしっかり買取）",
    quote: "石が外れていても、 変形していてもOK",
    sourceUrl: "https://e-kaitori.jp/kaitori/gold/",
    shopId: "best-life",
  },
  {
    sourceId: "jewel-cafe-single-pierce",
    label: "ジュエルカフェ 金・貴金属買取（片方だけのピアス）",
    quote: "片方なくしてしまったピアス、捨てる前にお持ち下さい！",
    sourceUrl: "https://www.jewel-cafe.jp/kaitori/gold/",
    shopId: "jewel-cafe",
  },
];

/**
 * 壊れていないことが効く場合。ここが記事のもう半分。
 *
 * 「壊れていても下がらない」と「壊れていないと上がる」は両立する。
 * 下がらないのは地金としての値段で、上乗せがあるかどうかは別の話である。
 * これも各社が自分で書いている。
 */
export const PREMIUM_QUOTES: BrokenQuote[] = [
  {
    sourceId: "ginzaya-product-premium",
    label: "銀座屋 金・貴金属買取",
    quote: "製品として販売可能なアクセサリーについてはプラスでお値段をお付けさせていただきます。",
    sourceUrl: "https://ginzaya.co.jp/items/gold/",
    shopId: "ginzaya",
  },
  {
    sourceId: "galleryrare-stone-separate",
    label: "ギャラリーレア 金・プラチナ買取",
    quote: "地金をグラム単位で査定。宝石の査定額と合わせて買取しています。",
    sourceUrl: "https://galleryrare.jp/goldplatinum/",
    shopId: "galleryrare",
  },
  {
    sourceId: "kingram-small-stone",
    label: "キングラム 金・プラチナ買取",
    quote:
      "ジュエリーや指輪については、他店ではお値段の付かないような小さな宝石でもそれぞれにお値段をお付けしています",
    sourceUrl: "https://kingram.jp/lineup/goldplatinum/gold/",
    shopId: "kingram",
  },
];

/** 引用した社の数。重複を除いて数える */
export function countQuotedShops(): number {
  const ids = new Set<string>();
  for (const list of [SAME_PRICE_QUOTES, REASON_QUOTES, ACCEPTED_QUOTES, PREMIUM_QUOTES]) {
    for (const q of list) ids.add(q.shopId);
  }
  return ids.size;
}

export interface ShopGap {
  purity: Purity;
  shops: number;
  median: number;
  high: number;
  low: number;
  /** 最高と最低の1gあたりの差 */
  gap: number;
  /** 5gのときに、店の違いで何円変わるか */
  gapAt5g: number;
}

/**
 * 「壊れているかどうか」では動かないのに、「どの店か」では動く額を測る。
 *
 * 記事の本文に数字を書くと翌日に嘘になるので、毎ビルドここで測り直す。
 * 5gという重さは、計算の例として置いているだけの数字。
 */
export function measureShopGap(purity: Purity): ShopGap | null {
  const s = measureSpread(purity);
  if (!s) return null;
  return {
    purity,
    shops: s.count,
    median: s.median,
    high: s.high.price,
    low: s.low.price,
    gap: s.range,
    gapAt5g: s.range * 5,
  };
}
