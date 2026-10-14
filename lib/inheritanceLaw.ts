import type { LawQuote } from "@/lib/taxLaw";

/**
 * 遺品整理の記事で引いている民法の条文。
 *
 * なぜ要るか:
 * この記事は「原則として相続財産にあたります」「相続人の一人が独断で売却すると
 * トラブルにつながることがあります」と書いていたが、出典が無かった。
 * 当サイトは古物営業法・質屋営業法・計量法を条文で引いているのに、
 * ここだけ伝聞の形になっていた。読む人にとっては、いちばん不安な部分である。
 *
 * e-Gov法令検索のページは本文をJavaScriptで描くため、人が開くURL(sourceUrl)とは別に、
 * 条単位で取れる法令APIのURL(verifyUrl)を持たせている。
 * URLは変数で組まずに1件ずつ書く(組むと照合の対象から外れる)。
 */

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const INHERITANCE_CHECKED_AT = "2026年10月15日";

export const INHERITANCE_QUOTES: Record<string, LawQuote> = {
  // そもそも遺品は誰のものになるのか
  succession: {
    sourceId: "civil-896",
    label: "民法（明治二十九年法律第八十九号）第896条（相続の一般的効力）",
    quote: "相続人は、相続開始の時から、被相続人の財産に属した一切の権利義務を承継する。",
    sourceUrl: "https://laws.e-gov.go.jp/law/129AC0000000089#Mp-At_896",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/129AC0000000089?response_format=json&elm=Mp-At_896",
  },
  // 相続人が複数いるときは共有。だから一人では決められない
  coOwned: {
    sourceId: "civil-898",
    label: "民法第898条第1項（共同相続の効力）",
    quote: "相続人が数人あるときは、相続財産は、その共有に属する。",
    sourceUrl: "https://laws.e-gov.go.jp/law/129AC0000000089#Mp-At_898",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/129AC0000000089?response_format=json&elm=Mp-At_898",
  },
  // 分割前に売ってしまった場合の扱い
  disposedBefore: {
    sourceId: "civil-906-2-1",
    label: "民法第906条の2第1項（遺産の分割前に遺産に属する財産が処分された場合の遺産の範囲）",
    quote:
      "遺産の分割前に遺産に属する財産が処分された場合であっても、共同相続人は、その全員の同意により、当該処分された財産が遺産の分割時に遺産として存在するものとみなすことができる。",
    sourceUrl: "https://laws.e-gov.go.jp/law/129AC0000000089#Mp-At_906_2",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/129AC0000000089?response_format=json&elm=Mp-At_906_2",
  },
  // 売った本人の同意は要らない = 売った人が不利を負う
  disposerExcluded: {
    sourceId: "civil-906-2-2",
    label: "民法第906条の2第2項",
    quote:
      "前項の規定にかかわらず、共同相続人の一人又は数人により同項の財産が処分されたときは、当該共同相続人については、同項の同意を得ることを要しない。",
    sourceUrl: "https://laws.e-gov.go.jp/law/129AC0000000089#Mp-At_906_2",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/129AC0000000089?response_format=json&elm=Mp-At_906_2",
  },
};
