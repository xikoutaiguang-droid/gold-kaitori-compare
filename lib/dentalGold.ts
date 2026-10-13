import dentalAlloy from "@/data/dentalAlloy.json";
import { measureSpread } from "@/lib/spread";

/**
 * 「金歯は売れるのか」で引いている原文と、計算のもとになる数字。
 *
 * 置き方は lib/taxLaw.ts・lib/scaleLaw.ts と同じ。本文に文字列で書くと
 * 相手が書き換えたときに気づけないので、引用はここに集めて
 * scripts/verify-quotes.mjs に毎日取り直させる。
 * URLは変数で組まずに1件ずつ書く(組むと照合の対象から外れる)。
 *
 * 数字の扱いが2種類あることに注意:
 * ・厚生労働省の材料価格は告示なので、改正されるまで動かない。だから引用に数字を含める。
 *   改正されれば引用が原文から消えるので、照合で気づける。
 * ・買取価格は毎日動く。だからこちらは引用に数字を入れず、data/dentalAlloy.json を
 *   scripts/scrape/record-dental.mjs が毎日書き換え、ページはそれを読んで計算する。
 */

export interface DentalQuote {
  sourceId: string;
  /** 記事に出す出典名 */
  label: string;
  /** 原文のまま。要約しない */
  quote: string;
  sourceUrl: string;
  /** 掲載社の記載なら、その社のID(/company/ へのリンクに使う) */
  shopId?: string;
}

/**
 * 上の調査をした時点で当サイトが掲載していた社数。
 *
 * 掲載社は増えるので、記事には「いま何社か」ではなくこの数を出す。
 * 調べた範囲を書いているのであって、現在の掲載数を書いているのではない。
 */
export const SURVEYED_SHOPS = 25;

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const DENTAL_CHECKED_AT = "2026年10月13日";

/**
 * 保険診療で使う歯科材料の価格。厚生労働省の告示「特定保険医療材料及びその材料価格
 * (材料価格基準)」に品名ごとの1gあたりの金額が並んでいる。
 *
 * 大事な点: これは買取価格ではない。歯科医院が治療に使ったときに、
 * 診療報酬として算定される価格である。記事の本文でもそう書く。
 *
 * 出典は厚生労働省の法令等データベース。robots.txt が禁じているのは
 * /cgi-bin/ と /images/ と個別の1ページで、/web/ は許可されている。
 */
export const MATERIAL_QUOTES: Record<string, DentalQuote> = {
  // 材料価格が何であるかの定義。「消費税を含む」もここに書かれている
  basis: {
    sourceId: "mhlw-material-basis",
    label: "特定保険医療材料及びその材料価格(材料価格基準)（平成20年厚生労働省告示第61号）",
    quote:
      "特定保険医療材料及びその材料価格は、別表に収載されている特定保険医療材料及び当該特定保険医療材料について同表に定める価格(消費税及び地方消費税に相当する額を含む。)とする。",
    sourceUrl: "https://www.mhlw.go.jp/web/t_doc?dataId=84aa9731&dataType=0&pageNo=1",
  },
  // いわゆる「金パラ」。日本の保険診療の金属冠・インレーで使われてきたもの
  kinpara: {
    sourceId: "mhlw-material-kinpara",
    label: "同 別表Ⅵ 歯科点数表の第2章第12部に規定する特定保険医療材料及びその材料価格",
    quote: "006 歯科鋳造用金銀パラジウム合金(金12％以上 JIS適合品) 1g 5,746円",
    sourceUrl: "https://www.mhlw.go.jp/web/t_doc?dataId=84aa9731&dataType=0&pageNo=3",
  },
  // 同じ表に14カラット(金58.33％以上)の項目もある。純度が違えば価格の桁も違う
  gold14: {
    sourceId: "mhlw-material-gold14",
    label: "同 別表Ⅵ",
    quote: "002 歯科鋳造用14カラット金合金 インレー用(JIS適合品) 1g 16,789円",
    sourceUrl: "https://www.mhlw.go.jp/web/t_doc?dataId=84aa9731&dataType=0&pageNo=3",
  },
  braze: {
    sourceId: "mhlw-material-braze",
    label: "同 別表Ⅵ",
    quote: "010 歯科用金銀パラジウム合金ろう(金15％以上 JIS適合品) 1g 8,250円",
    sourceUrl: "https://www.mhlw.go.jp/web/t_doc?dataId=84aa9731&dataType=0&pageNo=3",
  },
  // 「銀歯」と呼ばれるもののうち、本当に銀が主体の合金はこの値段
  silver: {
    sourceId: "mhlw-material-silver",
    label: "同 別表Ⅵ",
    quote: "011 歯科鋳造用銀合金 第1種(銀60％以上インジウム5％未満 JIS適合品) 1g 327円",
    sourceUrl: "https://www.mhlw.go.jp/web/t_doc?dataId=84aa9731&dataType=0&pageNo=3",
  },
  // この告示に当サイトが読んだ時点で反映されていた、いちばん新しい改正
  amendment: {
    sourceId: "mhlw-material-amendment",
    label: "同 改正文の一覧",
    quote: "改正文 (令和八年五月二九日厚生労働省告示第二三二号) 抄 令和八年六月一日から適用する。",
    sourceUrl: "https://www.mhlw.go.jp/web/t_doc?dataId=84aa9731&dataType=0&pageNo=5",
  },
};

/**
 * 掲載社が「歯科で使ったもの」について公式サイトに書いていること。
 *
 * 2026年10月13日に、その時点で掲載していた25社の価格表と公式トップを機械的に読んで拾った。
 * 歯科材の1gあたりの金額を数字で出していたのはリファスタだけで、
 * 他に価格表に項目があった大黒屋は「ASK」だった。
 */
export const SHOP_QUOTES: Record<string, DentalQuote> = {
  refasta: {
    sourceId: "refasta-dental-row",
    label: "リファスタ 貴金属買取価格相場表",
    // 数字は入れない。毎日動くので、ここに書くと翌日から合わなくなる。
    // 金額は data/dentalAlloy.json のほうを毎日取り直している。
    quote: "Au12Pd20歯科材 銀歯要問合せ",
    sourceUrl: "https://kinkaimasu.jp/",
    shopId: "refasta",
  },
  daikokuRow: {
    sourceId: "daikoku-dental-row",
    label: "大黒屋 パラジウム買取価格表",
    quote: "歯科用12％金パラジウム(未開封)",
    sourceUrl: "https://kaitori.e-daikoku.com/brand/genre/gold.html",
    shopId: "e-daikoku",
  },
  daikokuAsk: {
    sourceId: "daikoku-dental-ask",
    label: "大黒屋 パラジウム買取価格表（買取価格の欄）",
    quote: "金12％パラジウム20％ ASK",
    sourceUrl: "https://kaitori.e-daikoku.com/brand/genre/gold.html",
    shopId: "e-daikoku",
  },
  ginzaya: {
    sourceId: "ginzaya-dental",
    label: "銀座屋 金・貴金属買取",
    quote:
      "金杯、金歯など歯科で使用したもの、など金やプラチナが少しでも含まれているものはすべて買取対象です。",
    sourceUrl: "https://ginzaya.co.jp/items/gold/",
    shopId: "ginzaya",
  },
  kingram: {
    sourceId: "kingram-dental",
    label: "キングラム 金・プラチナ買取",
    quote: "金歯 交換で不要になった金歯、買取できます。",
    sourceUrl: "https://kingram.jp/lineup/goldplatinum/gold/",
    shopId: "kingram",
  },
  jewelCafe: {
    sourceId: "jewel-cafe-dental",
    label: "ジュエルカフェ 金・貴金属買取",
    quote: "工業用・歯科スクラップも買取強化中",
    sourceUrl: "https://www.jewel-cafe.jp/kaitori/gold/",
    shopId: "jewel-cafe",
  },
};

/** 告示に書かれている1gあたりの材料価格。上の引用から転記したもの */
export const MATERIAL_PRICE = {
  /** 歯科鋳造用金銀パラジウム合金(金12％以上) */
  kinpara: 5746,
  /** 歯科鋳造用14カラット金合金 インレー用 */
  gold14: 16789,
  /** 歯科鋳造用銀合金 第1種 */
  silver: 327,
} as const;

/**
 * 金パラの中身のうち、当サイトが単価を持っている2つの金属。
 * 「Au12Pd20」という品名のとおり、金12％とパラジウム20％。
 * 告示の品名は「金12％以上」なので、12％は下限である。
 */
export const KINPARA_COMPOSITION = { goldPercent: 12, palladiumPercent: 20 } as const;

export interface DentalMath {
  /** リファスタが公表している歯科材の買取単価 */
  buyPerGram: number;
  /** その価格が何日時点のものか */
  buyUpdatedAt: string;
  /** パラジウム(純度1000)の買取単価。取れていなければ null */
  palladiumPerGram: number | null;
  /** K24の掲載社中央値 */
  goldPerGram: number;
  goldShops: number;
  /** 金12％分を、当日のK24中央値で換算した額 */
  goldPart: number;
  /** パラジウム20％分 */
  palladiumPart: number | null;
  /** 分かっている2金属だけを足した額(= 中身の価値の下限) */
  knownFloor: number | null;
  /** 買取単価が、その下限に対して何％か */
  ratioToFloor: number | null;
  /** 買取単価が、保険の材料価格に対して何％か */
  ratioToMaterial: number;
}

/**
 * 記事に出す数字をまとめて計算する。
 *
 * 本文に数字を書かないのは、相場が動けば翌日に嘘になるため。
 * K24の単価が取れていなければ null を返し、ページ側はその節を出さない。
 */
export function measureDental(): DentalMath | null {
  const k24 = measureSpread("k24");
  if (!k24) return null;

  const buyPerGram = dentalAlloy.dental.pricePerGram;
  const palladiumPerGram = dentalAlloy.palladium?.pricePerGram ?? null;
  // 表に出す額と合計が合うように、先に円単位へ丸めてから足す。
  // 小数のまま足して最後に丸めると、画面の縦の足し算が1円ずれる。
  const goldPart = Math.round((k24.median * KINPARA_COMPOSITION.goldPercent) / 100);
  const palladiumPart =
    palladiumPerGram === null
      ? null
      : Math.round((palladiumPerGram * KINPARA_COMPOSITION.palladiumPercent) / 100);
  const knownFloor = palladiumPart === null ? null : goldPart + palladiumPart;

  return {
    buyPerGram,
    buyUpdatedAt: dentalAlloy.updatedAt,
    palladiumPerGram,
    goldPerGram: k24.median,
    goldShops: k24.count,
    goldPart,
    palladiumPart,
    knownFloor,
    ratioToFloor: knownFloor === null ? null : (buyPerGram / knownFloor) * 100,
    ratioToMaterial: (buyPerGram / MATERIAL_PRICE.kinpara) * 100,
  };
}
