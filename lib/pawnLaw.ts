/**
 * 質屋についての記事で引いている原文。
 *
 * 置き方は lib/taxLaw.ts と同じ。本文に文字列で書くと、相手が書き換えても
 * 気づけないので、引用はここに集めて scripts/verify-quotes.mjs に毎日照合させる。
 * e-Gov法令検索のページは本文をJavaScriptで描くため、人が開くURL(sourceUrl)とは別に、
 * 条単位で取れる法令APIのURL(verifyUrl)を持たせている。
 */

import type { LawQuote } from "@/lib/taxLaw";

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const PAWN_CHECKED_AT = "2026年10月4日";

// 照合スクリプトは構文解析をしない素朴な読み取りなので、URLは組み立てずに
// 1件ずつそのまま書く。変数で組むと、照合の対象から外れて気づけなくなる。
/** 質に預けるページ(高山質店)。当サイトが価格を見ている社の中では数少ない質屋 */
export const TAKAYAMA_PAWN_URL = "https://takayama78.co.jp/%e8%b3%aa%e3%81%ab%e9%a0%90%e3%81%91%e3%82%8b/";

export const PAWN_QUOTES: Record<string, LawQuote> = {
  definition: {
    sourceId: "pawn-act-1",
    label: "質屋営業法（昭和二十五年法律第百五十八号）第1条",
    quote:
      "この法律において「質屋営業」とは、物品（有価証券を含む。第二十二条を除き、以下同じ。）を質に取り、" +
      "流質期限までに当該質物で担保される債権の弁済を受けないときは、当該質物をもつてその弁済に充てる約款を附して、" +
      "金銭を貸し付ける営業をいう。",
    sourceUrl: "https://laws.e-gov.go.jp/law/325AC0000000158#Mp-At_1",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/325AC0000000158?response_format=json&elm=Mp-At_1",
  },
  threeMonths: {
    sourceId: "pawn-act-16",
    label: "質屋営業法第16条第2項（掲示）",
    quote:
      "前項第三号の流質期限は、質契約成立の日から三月未満（質置主が物品を取り扱う営業者であり、" +
      "かつ、その質に入れようとする物品がその取り扱つている物品である場合においては、一月未満）の期間で定めてはならない。",
    sourceUrl: "https://laws.e-gov.go.jp/law/325AC0000000158#Mp-At_16",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/325AC0000000158?response_format=json&elm=Mp-At_16",
  },
  redeem: {
    sourceId: "pawn-act-17",
    label: "質屋営業法第17条（質物の返還）",
    quote: "質置主は、流質期限前は、いつでも元利金を弁済して、その質物を受け戻すことができる。",
    sourceUrl: "https://laws.e-gov.go.jp/law/325AC0000000158#Mp-At_17",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/325AC0000000158?response_format=json&elm=Mp-At_17",
  },
  forfeit: {
    sourceId: "pawn-act-18",
    label: "質屋営業法第18条（流質物の取得及び処分）",
    quote: "質屋は、流質期限を経過した時において、その質物の所有権を取得する。",
    sourceUrl: "https://laws.e-gov.go.jp/law/325AC0000000158#Mp-At_18",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/325AC0000000158?response_format=json&elm=Mp-At_18",
  },
  // 出資法の上限(年20%)を、質屋についてはこの数字に読み替える条文。
  // 読み替え規定なので、引用は数字の部分だけを切り出す。
  interestCap: {
    sourceId: "pawn-act-36",
    label: "質屋営業法第36条",
    quote:
      "百九・五パーセント（二月二十九日を含む一年については年百九・八パーセントとし、一日当たりについては〇・三パーセントとする。）",
    sourceUrl: "https://laws.e-gov.go.jp/law/325AC0000000158#Mp-At_36",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/325AC0000000158?response_format=json&elm=Mp-At_36",
  },

  // ---- 実際の店の記載 ----
  shopLoan: {
    sourceId: "takayama-loan",
    label: "高山質店「質に預ける」",
    quote: "質はお客様の大事な品物を一旦お預かりし、その品物の価値に合わせてご融資をさせていただきます。",
    sourceUrl: "https://takayama78.co.jp/%e8%b3%aa%e3%81%ab%e9%a0%90%e3%81%91%e3%82%8b/",
  },
  shopNoScreening: {
    sourceId: "takayama-screening",
    label: "高山質店「質に預ける」",
    quote: "審査・信用調査は一切行いません。",
    sourceUrl: "https://takayama78.co.jp/%e8%b3%aa%e3%81%ab%e9%a0%90%e3%81%91%e3%82%8b/",
  },
  shopThreeMonths: {
    sourceId: "takayama-three-months",
    label: "高山質店「質に預ける」",
    quote:
      "お預かり期間は3ヶ月間で、期限内に元金と保管料をお支払い頂ければ、お預かりした品物はお客様の手元に戻ってきます。",
    sourceUrl: "https://takayama78.co.jp/%e8%b3%aa%e3%81%ab%e9%a0%90%e3%81%91%e3%82%8b/",
  },
  shopExtend: {
    sourceId: "takayama-extend",
    label: "高山質店「質に預ける」",
    quote:
      "期間内に返済できなそうな場合は保管料を追加で支払うことでお預かり期間を延長することが可能です。",
    sourceUrl: "https://takayama78.co.jp/%e8%b3%aa%e3%81%ab%e9%a0%90%e3%81%91%e3%82%8b/",
  },
  shopForfeit: {
    sourceId: "takayama-forfeit",
    label: "高山質店「質に預ける」",
    quote: "保管期間内に期間の延長やお手元に戻されない場合、お預かりした品物の所有権が当社へ移ります。",
    sourceUrl: "https://takayama78.co.jp/%e8%b3%aa%e3%81%ab%e9%a0%90%e3%81%91%e3%82%8b/",
  },
  // 原文のまま。「返済済義務」は同社の表記で、こちらで直していない。
  shopNoDebt: {
    sourceId: "takayama-no-debt",
    label: "高山質店「質に預ける」",
    quote: "その場合でも 元金の返済済義務はなく、取り立てなどない安心なシステムです。",
    sourceUrl: "https://takayama78.co.jp/%e8%b3%aa%e3%81%ab%e9%a0%90%e3%81%91%e3%82%8b/",
  },
};
