import { PURITY_FINENESS } from "@/lib/units";
import type { Purity } from "@/lib/types";

/**
 * 刻印の記事で引いている造幣局の原文。
 *
 * なぜ別ファイルに置くか:
 * /column/hallmark は造幣局の一文を引いていたが、出典のURLを持っておらず、
 * 日次の照合(scripts/verify-quotes.mjs)の対象にもなっていなかった。
 * 当サイトの他の記事は全部そうしているのに、この記事だけ素の文章になっていた。
 * 書いたのが早い時期で、あとから決めた作法が適用されていなかったためである。
 *
 * 造幣局(mint.go.jp)の robots.txt が止めているのは /wp-admin/ だけで、
 * ここは許可されている。
 *
 * URLは変数で組まずに1件ずつ書く(組むと照合の対象から外れる)。
 */

export interface MintQuote {
  sourceId: string;
  /** 記事に出す出典名 */
  label: string;
  /** 原文のまま。要約しない */
  quote: string;
  sourceUrl: string;
}

/** 引用をこの日に取り直して原文と一致することを確かめた */
export const MINT_CHECKED_AT = "2026年10月14日";

export const MINT_QUOTES: Record<string, MintQuote> = {
  // 誰が、何をして、何を打つのか
  what: {
    sourceId: "mint-certification-what",
    label: "造幣局「貴金属製品の品位証明」",
    quote:
      "造幣局では、公的な第三者として、貴金属製品の製造又は販売をしている事業者の方々からの依頼に応じて、貴金属製品の品位試験（分析を行い、製品に含まれる貴金属の純度の割合を調べること）を行い、この試験に合格したものには、次のような証明記号を打刻してその品位を証明しています。",
    sourceUrl:
      "https://www.mint.go.jp/operations/exam/certification_mark/operations_certification-01.html",
  },
  // 義務ではない。刻印が無いことは、偽物であることを意味しない
  voluntary: {
    sourceId: "mint-certification-voluntary",
    label: "造幣局「貴金属製品の品位証明」",
    quote:
      "このマークは任意の制度として設けられています。そのため、市販されている貴金属製品にはマークのない製品もあります。",
    sourceUrl:
      "https://www.mint.go.jp/operations/exam/certification_mark/operations_certification-01.html",
  },
  // この記事のいちばんの要点
  notMintMark: {
    sourceId: "mint-certification-not-k18",
    label: "造幣局「貴金属製品の品位証明」",
    quote: "K18、Pt900などの記号は造幣局の証明記号ではありません。",
    sourceUrl:
      "https://www.mint.go.jp/operations/exam/certification_mark/operations_certification-01.html",
  },
  k18Only: {
    sourceId: "mint-marks-k18-only",
    label: "造幣局「貴金属製品の品位区分と証明記号」",
    quote: "Ｋ１８とだけ刻印のある金製品は、造幣局で品位を証明したものではありません。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  divisions: {
    sourceId: "mint-marks-divisions",
    label: "造幣局「貴金属製品の品位区分と証明記号」",
    quote:
      "品位証明は、白金製品については４区分、金製品については６区分、銀製品については５区分、白金及び金を接合した製品については５区分により行っています。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  karatIsTraditional: {
    sourceId: "mint-marks-karat-def",
    label: "造幣局「貴金属製品の品位区分と証明記号」",
    quote:
      "これは、金の品位表示法として伝統的に使われているもので、純金を２４として計算され、カラット（Ｋ）を単位としています。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  karatTable: {
    sourceId: "mint-marks-karat-table",
    label: "造幣局「貴金属製品の品位区分と証明記号」",
    quote:
      "造幣局ではカラット表示の刻印は行っておりませんが、造幣局の品位証明区分とカラット表示との対応は表のようになります。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  // 古い品物の刻印が今の表と合わない理由。ここを書いている解説は少ない
  iso: {
    sourceId: "mint-marks-iso",
    label: "造幣局「貴金属製品の品位区分と証明記号」(注)",
    quote:
      "平成２４年４月以降に受付した製品から貴金属合金の品位を定める国際標準規格（ISO9202）及び日本産業規格（JIS H6309）に準じた新しい品位表示となりました。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  thousandIs999: {
    sourceId: "mint-marks-999",
    label: "造幣局「貴金属製品の品位区分と証明記号」(注)",
    quote: "品位「９９９」の表示は、改正以前に受付した「１０００」表示と、証明している品位は同じです。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  renumbered: {
    sourceId: "mint-marks-916",
    label: "造幣局「貴金属製品の品位区分と証明記号」(注)",
    quote:
      "同様に、金製品の品位「９１７」を「９１６」、品位「４１７」を「４１６」と表示するようになりました。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  discontinued: {
    sourceId: "mint-marks-835",
    label: "造幣局「貴金属製品の品位区分と証明記号」(注)",
    quote:
      "また、「８３５」「６２５」「５００」の品位区分は平成24年4月以降に廃止されましたが、これらのホールマークが入った製品は、平成２４年４月以降も品位が証明されたものとして扱っていただけます。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  // 色の名前は品位とは別のこと
  sameMark: {
    sourceId: "mint-marks-same-mark",
    label: "造幣局「貴金属製品の品位区分と証明記号」",
    quote:
      "金の品位（純度）が同じであれば、ホワイトゴールドもピンクゴールドも同じホールマーク表示となります。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  // 白いものには何が混ざっているか。比重で純度を当てられない理由にもなる
  whiteGoldMetals: {
    sourceId: "mint-marks-white-gold-metals",
    label: "造幣局「貴金属製品の品位区分と証明記号」",
    quote:
      "その他の金属（白色系のニッケルや銀、パラジウムなど）が１０００分の２５０含まれているということです。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  whiteGold: {
    sourceId: "mint-marks-white-gold",
    label: "造幣局「貴金属製品の品位区分と証明記号」",
    quote:
      "なお、ホワイトゴールドを日本語に直訳すると「白金」となりますが、本来の白金はプラチナのことでありホワイトゴールドとはまったく異なるものです。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
  sterling: {
    sourceId: "mint-marks-sterling",
    label: "造幣局「貴金属製品の品位区分と証明記号」",
    quote:
      "スターリングシルバーと呼ばれるものは、銀の品位（純度）が１０００分の９２５、その他の金属（主に銅）が１０００分の７５含まれています。",
    sourceUrl: "https://www.mint.go.jp/operations/exam/operations_certification-02.html",
  },
};

/**
 * 造幣局が公表している、金の品位証明区分とカラット表示の対応表そのもの。
 * 上の karatTable の引用が指している表を、数字だけ転記したもの。
 */
export const MINT_GOLD_KARAT: { fineness: number; purity: Purity }[] = [
  { fineness: 999, purity: "k24" },
  { fineness: 916, purity: "k22" },
  { fineness: 750, purity: "k18" },
  { fineness: 585, purity: "k14" },
  { fineness: 416, purity: "k10" },
  { fineness: 375, purity: "k9" },
];

/** 平成24年4月に廃止された品位区分。古い品物にはまだ入っている */
export const MINT_DISCONTINUED = [835, 625, 500] as const;

/**
 * 当サイトが計算に使っている品位(lib/units.ts)が、造幣局の対応表とずれていないか。
 *
 * ずれたまま公開すると、刻印の記事と計算ページで違う数字が出る。
 * 気づくのは読んだ人のほうが先になるので、ビルドで止める。
 * K24だけは別扱い: 造幣局の区分は999だが、当サイトはK24の刻印に対する名目値として
 * 1.0を使っている(lib/units.ts にその理由がある)。
 */
export function assertFinenessMatchesMint(): void {
  for (const { fineness, purity } of MINT_GOLD_KARAT) {
    if (purity === "k24") continue;
    const ours = Math.round(PURITY_FINENESS[purity] * 1000);
    if (ours !== fineness) {
      throw new Error(
        `lib/hallmarkMint.ts: ${purity} の品位が造幣局の区分と合いません(当サイト ${ours} / 造幣局 ${fineness})。` +
          `lib/units.ts の PURITY_FINENESS を確かめてください。`,
      );
    }
  }
}

/**
 * 刻印の違いが金額に出ている例。掲載社の価格ページの注記から。
 *
 * 記事に文章として書いてあったが、出典のURLを持っていなかったので照合されていなかった。
 * 各社の注記は予告なく書き換わる(2026年10月4日に買取エリートの手数料の記載が
 * 逆の意味に変わっていた)。ここに置いて毎日取り直す。
 */
export const SHOP_HALLMARK_NOTE: MintQuote = {
  sourceId: "otakaraya-hallmark-basis",
  label: "おたからや 金買取相場ページの注記",
  quote:
    "24金(K24)の掲載価格 は､ホールマーク(造幣局刻印)付きのメダルや小判など､特定の製品を基準とした参考買取価格です。アクセサリーや金工芸品など､その他の24金製品(スクラップ品)につきましては査定額が異なる場合がございます。",
  sourceUrl: "https://www.otakaraya.jp/gold/souba/",
};
