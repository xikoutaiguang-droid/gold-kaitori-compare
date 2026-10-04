/**
 * 税について記事で引いている原文。
 *
 * なぜ別ファイルに置くか:
 * 本文に文字列として書くと、相手が書き換えたときに気づけない。
 * 2026年10月4日に各社の引用を照合し直したら、4件が原文から消えていた。
 * 法令と国税庁のページも同じで、国税庁のタックスアンサーは毎年
 * 「[令和◯年4月1日現在法令等]」で作り直される。
 *
 * ここに置いておけば scripts/verify-quotes.mjs が毎日取り直して照合する。
 * 法令検索のページは本文をJavaScriptで描くので、人が開くURL(sourceUrl)と
 * 機械が照合するURL(verifyUrl: 法令APIの条単位)を分けている。
 */

export interface LawQuote {
  /** 照合スクリプトがレコードを割るための識別子 */
  sourceId: string;
  /** 記事に出す出典名 */
  label: string;
  /** 原文のまま。要約しない */
  quote: string;
  /** 人が開くURL */
  sourceUrl: string;
  /** 機械が照合するURL。省略時は sourceUrl を使う */
  verifyUrl?: string;
}

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const TAX_CHECKED_AT = "2026年10月4日";

/** 国税庁タックスアンサーの、いつ現在の法令かの表示 */
export const NTA_AS_OF = "令和8年4月1日現在法令等";

// 記事の「参考」欄で使う。レコードの sourceUrl はここを参照せず、1件ずつ
// 文字列で書いてある(変数で組むと照合スクリプトの対象から外れるため)。
export const NTA_3161 = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3161.htm";
export const NTA_3105 = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3105.htm";
export const NTA_3152 = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3152.htm";

export const TAX_QUOTES: Record<string, LawQuote> = {
  // ---- 国税庁タックスアンサー ----
  bullionIsCapitalGain: {
    sourceId: "nta-3161-gist",
    label: "国税庁 タックスアンサー No.3161「金地金の譲渡による所得」",
    quote:
      "金地金を売ったときの所得は、原則、譲渡所得として、給与所得など他の所得と合わせて総合課税の対象となります。",
    sourceUrl: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3161.htm",
  },
  continuousIsBusiness: {
    sourceId: "nta-3161-business",
    label: "国税庁 タックスアンサー No.3161「金地金の譲渡による所得」",
    quote:
      "金地金の譲渡が営利を目的として継続的に行われている場合には、その実態に応じて事業所得または雑所得となります。",
    sourceUrl: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3161.htm",
  },
  gainFormula: {
    sourceId: "nta-3161-formula",
    label: "国税庁 タックスアンサー No.3161「金地金の譲渡による所得」",
    quote: "譲渡価額－（取得費＋譲渡費用）＝金地金の譲渡益",
    sourceUrl: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3161.htm",
  },
  deductionFormula: {
    sourceId: "nta-3161-deduction",
    label: "国税庁 タックスアンサー No.3161「金地金の譲渡による所得」",
    quote:
      "｛［金地金の譲渡益］＋［その年の金地金以外の総合課税の譲渡益］｝－譲渡所得の特別控除50万円＝課税される譲渡所得の金額",
    sourceUrl: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3161.htm",
  },
  deductionCap: {
    sourceId: "nta-3161-cap",
    label: "国税庁 タックスアンサー No.3161「金地金の譲渡による所得」",
    quote:
      "譲渡所得の特別控除の額は、その年の金地金の譲渡益とそれ以外の総合課税の譲渡益の合計額に対して50万円です。" +
      "これらの譲渡益の合計額が50万円以下のときはその金額までしか控除できません。",
    sourceUrl: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3161.htm",
  },
  longTermHalf: {
    sourceId: "nta-3161-half",
    label: "国税庁 タックスアンサー No.3161「金地金の譲渡による所得」",
    quote: "（譲渡所得の金額）× 1/2 = 課税される譲渡所得の金額",
    sourceUrl: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3161.htm",
  },
  dailyGoods: {
    sourceId: "nta-3105-daily",
    label: "国税庁 タックスアンサー No.3105「譲渡所得の対象となる資産と課税方法」",
    quote: "家具、じゅう器、通勤用の自動車、衣服などの生活に通常必要な動産の譲渡による所得です。",
    sourceUrl: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3105.htm",
  },
  dailyGoodsException: {
    sourceId: "nta-3105-exception",
    label: "国税庁 タックスアンサー No.3105「譲渡所得の対象となる資産と課税方法」",
    quote:
      "ただし、貴金属や宝石、書画、骨とうなどで、1個または1組の価額が30万円を超えるものの譲渡による所得は除きます。",
    sourceUrl: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3105.htm",
  },

  // ---- 法令 ----
  nonTaxableAct: {
    sourceId: "act-9-1-9",
    label: "所得税法（昭和四十年法律第三十三号）第9条第1項第9号",
    quote:
      "自己又はその配偶者その他の親族が生活の用に供する家具、じゆう器、衣服その他の資産で政令で定めるものの譲渡による所得",
    sourceUrl: "https://laws.e-gov.go.jp/law/340AC0000000033#Mp-At_9",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/340AC0000000033?response_format=json&elm=Mp-At_9",
  },
  nonTaxableOrder: {
    sourceId: "order-25",
    label: "所得税法施行令（昭和四十年政令第九十六号）第25条",
    quote:
      "法第九条第一項第九号（非課税所得）に規定する政令で定める資産は、生活に通常必要な動産のうち、" +
      "次に掲げるもの（一個又は一組の価額が三十万円を超えるものに限る。）以外のものとする。",
    sourceUrl: "https://laws.e-gov.go.jp/law/340CO0000000096#Mp-At_25",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/340CO0000000096?response_format=json&elm=Mp-At_25",
  },
  nonTaxableOrderItem: {
    sourceId: "order-25-1",
    label: "所得税法施行令第25条第1号",
    quote: "貴石、半貴石、貴金属、真珠及びこれらの製品、べつこう製品、さんご製品、こはく製品、ぞうげ製品並びに七宝製品",
    sourceUrl: "https://laws.e-gov.go.jp/law/340CO0000000096#Mp-At_25",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/340CO0000000096?response_format=json&elm=Mp-At_25",
  },
  // 1文が長いので、条文から続きの部分をそのまま2つに分けて引く。
  // 間を「…」でつなぐと原文との照合ができなくなるため、省略は入れない。
  specialDeductionAct: {
    sourceId: "act-33-4",
    label: "所得税法第33条第4項（譲渡所得）",
    quote: "前項に規定する譲渡所得の特別控除額は、五十万円（譲渡益が五十万円に満たない場合には、当該譲渡益）とする。",
    sourceUrl: "https://laws.e-gov.go.jp/law/340AC0000000033#Mp-At_33",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/340AC0000000033?response_format=json&elm=Mp-At_33",
  },
  inheritedHolding: {
    sourceId: "act-60-1",
    label: "所得税法第60条第1項（贈与等により取得した資産の取得費等）",
    quote:
      "居住者が次に掲げる事由により取得した前条第一項に規定する資産を譲渡した場合における事業所得の金額、" +
      "山林所得の金額、譲渡所得の金額又は雑所得の金額の計算については、その者が引き続きこれを所有していたものとみなす。",
    sourceUrl: "https://laws.e-gov.go.jp/law/340AC0000000033#Mp-At_60",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/340AC0000000033?response_format=json&elm=Mp-At_60",
  },
  noticeActWho: {
    sourceId: "act-224-6-who",
    label: "所得税法第224条の6（金地金等の譲渡の対価の受領者の告知）",
    quote:
      "金若しくは白金の地金又は金貨若しくは白金貨（以下この条において「金地金等」という。）の譲渡をした者",
    sourceUrl: "https://laws.e-gov.go.jp/law/340AC0000000033#Mp-At_224_6",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/340AC0000000033?response_format=json&elm=Mp-At_224_6",
  },
  noticeActWhat: {
    sourceId: "act-224-6-what",
    label: "所得税法第224条の6（金地金等の譲渡の対価の受領者の告知）",
    quote:
      "その金地金等の譲渡の対価（その額が政令で定める金額以下のものを除く。）の支払を受けるものは、" +
      "政令で定めるところにより、その支払を受けるべき時までに、その者の氏名又は名称、住所",
    sourceUrl: "https://laws.e-gov.go.jp/law/340AC0000000033#Mp-At_224_6",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/340AC0000000033?response_format=json&elm=Mp-At_224_6",
  },
  noticeActObligation: {
    sourceId: "act-224-6-obligation",
    label: "所得税法第224条の6（金地金等の譲渡の対価の受領者の告知）",
    quote:
      "その金地金等の譲渡を受けた者（金地金等の売買を業として行う者に限る。以下この条において「支払者」という。）に告知しなければならない。",
    sourceUrl: "https://laws.e-gov.go.jp/law/340AC0000000033#Mp-At_224_6",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/340AC0000000033?response_format=json&elm=Mp-At_224_6",
  },
  noticeLimit: {
    sourceId: "order-350-7",
    label: "所得税法施行令第350条の7（金地金等の譲渡の対価の受領者の告知を要しない譲渡の対価の上限額）",
    quote: "法第二百二十四条の六（金地金等の譲渡の対価の受領者の告知）に規定する政令で定める金額は、二百万円とする。",
    sourceUrl: "https://laws.e-gov.go.jp/law/340CO0000000096#Mp-At_350_7",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/340CO0000000096?response_format=json&elm=Mp-At_350_7",
  },
  paymentRecord: {
    sourceId: "act-225-1-14",
    label: "所得税法第225条第1項第14号（支払調書及び支払通知書）",
    quote:
      "居住者又は恒久的施設を有する非居住者に対し国内において前条に規定する金地金等の譲渡の対価の支払をする同条に規定する支払者",
    sourceUrl: "https://laws.e-gov.go.jp/law/340AC0000000033#Mp-At_225",
    verifyUrl: "https://laws.e-gov.go.jp/api/2/law_data/340AC0000000033?response_format=json&elm=Mp-At_225",
  },
};
