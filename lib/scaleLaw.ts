import type { LawQuote } from "@/lib/taxLaw";

/**
 * はかりについての記事で引いている条文。
 *
 * 置き方は lib/taxLaw.ts・lib/pawnLaw.ts と同じ。本文に文字列で書くと改正に気づけないので、
 * 引用はここに集めて scripts/verify-quotes.mjs に毎日照合させる。
 * e-Gov法令検索のページは本文をJavaScriptで描くため、人が開くURL(sourceUrl)とは別に、
 * 条単位で取れる法令APIのURL(verifyUrl)を持たせている。
 * URLは変数で組まずに1件ずつ書く(組むと照合の対象から外れる)。
 */

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const SCALE_CHECKED_AT = "2026年10月13日";

export const SCALE_QUOTES: Record<string, LawQuote> = {
  // 取引に使うはかりは、検定に合格したものでなければならない。
  // 1文が長いので、条件の部分と禁止の部分に分けて引く(「…」でつなぐと照合できなくなる)。
  mustBeVerifiedWhat: {
    sourceId: "scale-act-16-what",
    label: "計量法（平成四年法律第五十一号）第16条第1項",
    quote: "取引又は証明における法定計量単位による計量",
    sourceUrl: "https://laws.e-gov.go.jp/law/404AC0000000051#Mp-At_16",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/404AC0000000051?response_format=json&elm=Mp-At_16",
  },
  mustBeVerifiedRule: {
    sourceId: "scale-act-16-rule",
    label: "計量法第16条第1項",
    quote: "に使用し、又は使用に供するために所持してはならない。",
    sourceUrl: "https://laws.e-gov.go.jp/law/404AC0000000051#Mp-At_16",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/404AC0000000051?response_format=json&elm=Mp-At_16",
  },
  verifiedMark: {
    sourceId: "scale-act-72",
    label: "計量法第72条第1項（検定証印）",
    quote: "検定に合格した特定計量器には、経済産業省令で定めるところにより、検定証印を付する。",
    sourceUrl: "https://laws.e-gov.go.jp/law/404AC0000000051#Mp-At_72",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/404AC0000000051?response_format=json&elm=Mp-At_72",
  },
  // 使い始めたあとも、定期的に検査を受ける
  periodicCheck: {
    sourceId: "scale-act-19",
    label: "計量法第19条第1項（定期検査）",
    quote:
      "その事業所（事業所がない者にあっては、住所。以下この節において同じ。）の所在地を管轄する都道府県知事（その所在地が特定市町村の区域にある場合にあっては、特定市町村の長）が行う定期検査を受けなければならない。",
    sourceUrl: "https://laws.e-gov.go.jp/law/404AC0000000051#Mp-At_19",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/404AC0000000051?response_format=json&elm=Mp-At_19",
  },
  periodicInterval: {
    sourceId: "scale-act-21",
    label: "計量法第21条第1項（定期検査の実施時期）",
    quote: "定期検査は、一年以上において特定計量器ごとに政令で定める期間に一回、区域ごとに行う。",
    sourceUrl: "https://laws.e-gov.go.jp/law/404AC0000000051#Mp-At_21",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/404AC0000000051?response_format=json&elm=Mp-At_21",
  },
  periodicMark: {
    sourceId: "scale-act-24",
    label: "計量法第24条第1項（定期検査済証印）",
    quote:
      "定期検査に合格した特定計量器には、経済産業省令で定めるところにより、定期検査済証印を付する。",
    sourceUrl: "https://laws.e-gov.go.jp/law/404AC0000000051#Mp-At_24",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/404AC0000000051?response_format=json&elm=Mp-At_24",
  },
  periodicMarkDate: {
    sourceId: "scale-act-24-2",
    label: "計量法第24条第2項",
    quote: "前項の定期検査済証印には、その定期検査を行った年月を表示するものとする。",
    sourceUrl: "https://laws.e-gov.go.jp/law/404AC0000000051#Mp-At_24",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/404AC0000000051?response_format=json&elm=Mp-At_24",
  },
  // 対象が「はかり」であること、その周期が2年であることは政令のほうに書かれている
  targetScales: {
    sourceId: "scale-order-10",
    label: "計量法施行令（平成五年政令第三百二十九号）第10条第1項（定期検査の対象となる特定計量器）",
    quote: "非自動はかり（第五条第一号又は第二号に掲げるものを除く。以下同じ。）、分銅及びおもり",
    sourceUrl: "https://laws.e-gov.go.jp/law/405CO0000000329#Mp-At_10",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/405CO0000000329?response_format=json&elm=Mp-At_10",
  },
  everyTwoYears: {
    sourceId: "scale-order-11",
    label: "計量法施行令第11条第1項（定期検査の実施時期）",
    quote:
      "法第二十一条第一項の政令で定める期間は、非自動はかり、分銅及びおもりにあっては二年とし、皮革面積計にあっては一年とする。",
    sourceUrl: "https://laws.e-gov.go.jp/law/405CO0000000329#Mp-At_11",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/405CO0000000329?response_format=json&elm=Mp-At_11",
  },
};
