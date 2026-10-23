import type { LawQuote } from "@/lib/taxLaw";

/**
 * 重さの単位についての条文。
 *
 * なぜ要るか:
 * 換算ツールのページには「1匁 = 3.75g」「1トロイオンス = 31.1034768g」とだけ書いてあって、
 * その数字がどこから来ているのかは書いていなかった。係数だけなら他のどのサイトにもある。
 *
 * 調べたところ、匁もトロイオンスも日本の法令に定義があり、しかも
 * 「何の計量に使ってよいか」まで決まっていた。匁は真珠、トロイオンスは金貨、
 * カラットは宝石。つまり金やプラチナの買取価格を「1匁いくら」で出すことは
 * 計量法第8条が禁じている。各社が必ずgで出しているのには理由がある。
 *
 * 置き方は lib/scaleLaw.ts・lib/taxLaw.ts と同じ。本文に文字列で書くと改正に気づけないので、
 * 引用はここに集めて scripts/verify-quotes.mjs に毎日照合させる。
 * e-Gov法令検索のページは本文をJavaScriptで描くため、人が開くURL(sourceUrl)とは別に、
 * 法令APIのURL(verifyUrl)を持たせている。
 * URLは変数で組まずに1件ずつ書く(組むと照合の対象から外れる)。
 *
 * 計量単位令の別表第六は「条」ではなく表なので、elm= で条を指定せず全文を取る。
 * 表の升目は1つずつ別の文字列になっていて、行としてつながってはいない。
 * そのため「真珠の質量の計量」と「キログラムの〇・〇〇三七五倍」のように、
 * 升目ごとに分けて引いている(つないで引くと、原文に無い文字列になり照合できない)。
 */

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const UNIT_LAW_CHECKED_AT = "2026年10月23日";

export const UNIT_LAW_QUOTES: Record<string, LawQuote> = {
  // 原則。法定計量単位(kg・g)以外は、取引や証明に使ってはいけない
  prohibition: {
    sourceId: "keiryo-act-8-1",
    label: "計量法（平成四年法律第五十一号）第8条第1項",
    quote:
      "第三条から第五条までに規定する計量単位（以下「法定計量単位」という。）以外の計量単位（以下「非法定計量単位」という。）は、第二条第一項第一号に掲げる物象の状態の量について、取引又は証明に用いてはならない。",
    sourceUrl: "https://laws.e-gov.go.jp/law/404AC0000000051#Mp-At_8",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/404AC0000000051?response_format=json&elm=Mp-At_8",
  },
  // 例外として認められている単位も、決められた計量にしか使えない
  onlyForSpecial: {
    sourceId: "keiryo-act-8-2",
    label: "計量法第8条第2項",
    quote:
      "第五条第二項の政令で定める計量単位は、同項の政令で定める特殊の計量に係る取引又は証明に用いる場合でなければ、取引又は証明に用いてはならない。",
    sourceUrl: "https://laws.e-gov.go.jp/law/404AC0000000051#Mp-At_8",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/404AC0000000051?response_format=json&elm=Mp-At_8",
  },
  // 別表第六(第五条関係)。何の計量に、どの単位を使ってよいか
  mommeUse: {
    sourceId: "tanii-order-6-pearl",
    label: "計量単位令（平成四年政令第三百五十七号）別表第六",
    quote: "真珠の質量の計量",
    sourceUrl: "https://laws.e-gov.go.jp/law/404CO0000000357",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/404CO0000000357?response_format=json",
  },
  mommeValue: {
    sourceId: "tanii-order-6-momme",
    label: "計量単位令別表第六",
    quote: "キログラムの〇・〇〇三七五倍",
    sourceUrl: "https://laws.e-gov.go.jp/law/404CO0000000357",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/404CO0000000357?response_format=json",
  },
  ozUse: {
    sourceId: "tanii-order-6-coin",
    label: "計量単位令別表第六",
    quote: "金貨の質量の計量",
    sourceUrl: "https://laws.e-gov.go.jp/law/404CO0000000357",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/404CO0000000357?response_format=json",
  },
  ozValue: {
    sourceId: "tanii-order-6-oz",
    label: "計量単位令別表第六",
    quote: "キログラムの〇・〇三一一〇三五倍",
    sourceUrl: "https://laws.e-gov.go.jp/law/404CO0000000357",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/404CO0000000357?response_format=json",
  },
  caratUse: {
    sourceId: "tanii-order-6-gem",
    label: "計量単位令別表第六",
    quote: "宝石の質量の計量",
    sourceUrl: "https://laws.e-gov.go.jp/law/404CO0000000357",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/404CO0000000357?response_format=json",
  },
  caratValue: {
    sourceId: "tanii-order-6-carat",
    label: "計量単位令別表第六",
    quote: "キログラムの〇・〇〇〇二倍",
    sourceUrl: "https://laws.e-gov.go.jp/law/404CO0000000357",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/404CO0000000357?response_format=json",
  },
};

/** 別表第六に載っている、貴金属まわりで出てくる単位 */
export interface SpecialUnit {
  /** 単位の呼び名(原文の表記) */
  unit: string;
  /** 何の計量に使ってよいか(原文の表記) */
  use: string;
  /** 原文が書いている定義 */
  definition: string;
  /** 上をgに直したもの */
  grams: number;
}

export const SPECIAL_UNITS: SpecialUnit[] = [
  { unit: "カラット", use: "宝石の質量の計量", definition: "キログラムの〇・〇〇〇二倍", grams: 0.2 },
  { unit: "もんめ", use: "真珠の質量の計量", definition: "キログラムの〇・〇〇三七五倍", grams: 3.75 },
  {
    unit: "トロイオンス",
    use: "金貨の質量の計量",
    definition: "キログラムの〇・〇三一一〇三五倍",
    grams: 31.1035,
  },
];

/**
 * 当サイトの換算に使っている値と、計量単位令が定めている値の差。
 *
 * トロイオンスは、国際的には 31.1034768g と定義されていて、当サイトの換算
 * (lib/units.ts の WEIGHT_UNIT_TO_GRAM)もこちらを使っている。
 * 計量単位令が金貨について定めているのは 31.1035g で、わずかに違う。
 * 隠すと「なぜ数字が合わないのか」が分からなくなるので、差を計算して出す。
 */
export function ozDefinitionGap(siteValue: number): {
  siteValue: number;
  lawValue: number;
  diffGrams: number;
  /** 1kgを換算したときに生じる差(g) */
  diffPerKilogram: number;
} {
  const lawValue = 31.1035;
  const diffGrams = Math.abs(lawValue - siteValue);
  return {
    siteValue,
    lawValue,
    diffGrams,
    diffPerKilogram: Math.abs(1000 / siteValue - 1000 / lawValue) * lawValue,
  };
}
