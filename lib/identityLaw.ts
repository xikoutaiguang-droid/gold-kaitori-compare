import type { LawQuote } from "@/lib/taxLaw";

/**
 * 本人確認の記事で引いている条文と各社の記載。
 *
 * なぜ別ファイルに置くか:
 * この記事は14か所で条文と規約を引いているのに、引用がページの中に直接書かれていて、
 * URLも定数で組まれていた。そのため scripts/verify-quotes.mjs の対象外で、
 * 法令が改正されても各社が規約を書き換えても気づけない状態だった。
 * 国税庁の8件が同じ理由で黙って未照合だったことがある。
 *
 * e-Gov法令検索のページは本文をJavaScriptで描くため、人が開くURL(sourceUrl)とは別に、
 * 条単位で取れる法令APIのURL(verifyUrl)を持たせている。
 * URLは変数で組まずに1件ずつ書く(組むと照合の対象から外れる)。
 */

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const IDENTITY_CHECKED_AT = "2026年10月15日";

export const IDENTITY_QUOTES: Record<string, LawQuote> = {
  // 原則。確認するのは住所・氏名・職業・年齢の4つで、「身分証を見せること」ではない
  principle: {
    sourceId: "kobutsu-act-15-1",
    label: "古物営業法（昭和二十四年法律第百八号）第15条第1項",
    quote:
      "古物商は、古物を買い受け、若しくは交換し、又は売却若しくは交換の委託を受けようとするときは、相手方の真偽を確認するため、次の各号のいずれかに掲げる措置をとらなければならない。",
    sourceUrl: "https://laws.e-gov.go.jp/law/324AC0000000108#Mp-At_15",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/324AC0000000108?response_format=json&elm=Mp-At_15",
  },
  whatToConfirm: {
    sourceId: "kobutsu-act-15-1-1",
    label: "古物営業法第15条第1項第1号",
    quote: "相手方の住所、氏名、職業及び年齢を確認すること。",
    sourceUrl: "https://laws.e-gov.go.jp/law/324AC0000000108#Mp-At_15",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/324AC0000000108?response_format=json&elm=Mp-At_15",
  },
  // 例外
  exception: {
    sourceId: "kobutsu-act-15-2",
    label: "古物営業法第15条第2項",
    quote: "前項の規定にかかわらず、次に掲げる場合には、同項に規定する措置をとることを要しない。",
    sourceUrl: "https://laws.e-gov.go.jp/law/324AC0000000108#Mp-At_15",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/324AC0000000108?response_format=json&elm=Mp-At_15",
  },
  underAmount: {
    sourceId: "kobutsu-act-15-2-1",
    label: "古物営業法第15条第2項第1号",
    quote:
      "対価の総額が国家公安委員会規則で定める金額未満である取引をする場合（特に前項に規定する措置をとる必要があるものとして国家公安委員会規則で定める古物に係る取引をする場合を除く。）",
    sourceUrl: "https://laws.e-gov.go.jp/law/324AC0000000108#Mp-At_15",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/324AC0000000108?response_format=json&elm=Mp-At_15",
  },
  // 金額は規則のほう
  amount: {
    sourceId: "kobutsu-rule-16-1",
    label: "古物営業法施行規則（平成七年国家公安委員会規則第十号）第16条第1項",
    quote: "法第十五条第二項第一号の国家公安委員会規則で定める金額は、一万円とする。",
    sourceUrl: "https://laws.e-gov.go.jp/law/407M50400000010#Mp-At_16",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/407M50400000010?response_format=json&elm=Mp-At_16",
  },
  excludedIntro: {
    sourceId: "kobutsu-rule-16-2",
    label: "古物営業法施行規則第16条第2項",
    quote: "法第十五条第二項第一号の国家公安委員会規則で定める古物は、次の各号に該当する古物とする。",
    sourceUrl: "https://laws.e-gov.go.jp/law/407M50400000010#Mp-At_16",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/407M50400000010?response_format=json&elm=Mp-At_16",
  },
  // 宅配買取で身分証の「厚み」を撮らされる根拠(第15条第3項第8号)
  ekycThickness: {
    sourceId: "kobutsu-rule-15-3-8",
    label: "古物営業法施行規則第15条第3項第8号",
    quote:
      "当該写真付き身分証明書等に記載された住所、氏名及び年齢又は生年月日、当該写真付き身分証明書等に貼り付けられた写真並びに当該写真付き身分証明書等の厚みその他の特徴を確認することができるものをいう。",
    sourceUrl: "https://laws.e-gov.go.jp/law/407M50400000010#Mp-At_15",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/407M50400000010?response_format=json&elm=Mp-At_15",
  },
};

/**
 * 1万円未満でも本人確認が要る古物（施行規則第16条第2項）。
 *
 * 短すぎる項目(「電線」「書籍」)は照合スクリプトの対象にならないので、
 * 一覧はデータとして持ち、長い項目のほうを引用として照合させる。
 * 項目が増減したときは、下の EXCLUDED_LONG_FORM の引用が原文から外れて気づける。
 *
 * 2026年10月15日に数え直したところ7項目あった。この記事は当初5項目しか書いておらず、
 * 「電線」と「書籍」が抜けていた。結論(貴金属は入っていない)は変わらないが、
 * 一覧としては不正確だった。
 */
export const EXCLUDED_GOODS = [
  "自動二輪車及び原動機付自転車（部分品を含む）",
  "エアコンディショナーの室外ユニット及び電気温水機器のヒートポンプ",
  "専ら家庭用コンピュータゲームに用いられるプログラムを記録した物",
  "光学的方法により音又は影像を記録した物",
  "電線",
  "グレーチング（金属製のものに限る）",
  "書籍",
] as const;

/** 上の一覧のうち、原文と照合できる長さのあるもの */
export const EXCLUDED_LONG_FORM: LawQuote[] = [
  {
    sourceId: "kobutsu-rule-16-2-1",
    label: "古物営業法施行規則第16条第2項第1号",
    quote:
      "自動二輪車及び原動機付自転車（これらの部分品（ねじ、ボルト、ナット、コードその他の汎用性の部分品を除く。）を含む。）",
    sourceUrl: "https://laws.e-gov.go.jp/law/407M50400000010#Mp-At_16",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/407M50400000010?response_format=json&elm=Mp-At_16",
  },
  {
    sourceId: "kobutsu-rule-16-2-2",
    label: "古物営業法施行規則第16条第2項第2号",
    quote: "エアコンディショナーの室外ユニット及び電気温水機器のヒートポンプ",
    sourceUrl: "https://laws.e-gov.go.jp/law/407M50400000010#Mp-At_16",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/407M50400000010?response_format=json&elm=Mp-At_16",
  },
  {
    sourceId: "kobutsu-rule-16-2-3",
    label: "古物営業法施行規則第16条第2項第3号",
    quote: "専ら家庭用コンピュータゲームに用いられるプログラムを記録した物",
    sourceUrl: "https://laws.e-gov.go.jp/law/407M50400000010#Mp-At_16",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/407M50400000010?response_format=json&elm=Mp-At_16",
  },
  {
    sourceId: "kobutsu-rule-16-2-6",
    label: "古物営業法施行規則第16条第2項第6号",
    quote: "グレーチング（金属製のものに限る。）",
    sourceUrl: "https://laws.e-gov.go.jp/law/407M50400000010#Mp-At_16",
    verifyUrl:
      "https://laws.e-gov.go.jp/api/2/law_data/407M50400000010?response_format=json&elm=Mp-At_16",
  },
];

export interface ShopRuleQuote {
  sourceId: string;
  label: string;
  quote: string;
  sourceUrl: string;
  shopId: string;
}

/**
 * 各社が規約に書いていること。
 * 法令と違い、こちらは予告なく書き換わる(2026年10月4日に買取エリートの手数料の記載が
 * 逆の意味に変わっていた)。毎日取り直して照合する。
 */
export const SHOP_RULE_QUOTES: Record<string, ShopRuleQuote> = {
  ekyc: {
    sourceId: "refasta-ekyc",
    label: "リファスタ「ご利用規約」第7条",
    quote:
      "古物営業法施行規則第15条第3項第8号に定める方法により、マイページにご登録の上、身分証（表面・裏面・厚みの画像）及びお客様の容貌（セルフィー）の撮影・送信によるeKYC手続きが完了しているお客様については、査定完了後、通常のお振込方法にてお支払いいたします。",
    sourceUrl: "https://kinkaimasu.jp/kiyaku/",
    shopId: "refasta",
  },
  ekycHold: {
    sourceId: "refasta-ekyc-hold",
    label: "リファスタ「ご利用規約」第7条",
    quote:
      "お品物の査定は、eKYC手続きが未完了の場合であっても通常通り行いますが、買取代金のお振込みは、eKYC手続きが完了するまで行うことができません。",
    sourceUrl: "https://kinkaimasu.jp/kiyaku/",
    shopId: "refasta",
  },
  minor: {
    sourceId: "refasta-minor",
    label: "リファスタ「ご利用規約」第6条",
    quote: "弊社の場合、保護者の同意書があっても当サービスをご利用頂く事は出来ません。",
    sourceUrl: "https://kinkaimasu.jp/kiyaku/",
    shopId: "refasta",
  },
  account: {
    sourceId: "refasta-account",
    label: "リファスタ「ご利用規約」",
    quote:
      "買取代金の支払い先となる銀行口座は、お客様の本人確認書類に記載されているお客様ご自身の名義の口座に限定されます",
    sourceUrl: "https://kinkaimasu.jp/kiyaku/",
    shopId: "refasta",
  },
  idList: {
    sourceId: "nexus-id-list",
    label: "ネクサス「店頭買取」",
    quote: "買取ご成約の際はご本人様の確認が必要となります。",
    sourceUrl: "https://www.nexus13.co.jp/buy/",
    shopId: "nexus13",
  },
  idKinds: {
    sourceId: "nexus-id-kinds",
    label: "ネクサス「店頭買取」",
    quote: "次の身分証明証のいずれかを必ずお持ちください。",
    sourceUrl: "https://www.nexus13.co.jp/buy/",
    shopId: "nexus13",
  },
  overTwoMillion: {
    sourceId: "nexus-over-2m",
    label: "ネクサス「店頭買取」",
    quote: "200万円を超えるお取引きの場合はこちら",
    sourceUrl: "https://www.nexus13.co.jp/buy/",
    shopId: "nexus13",
  },
};
