import { getCompanies } from "@/lib/companies";
import type { Purity } from "@/lib/types";

/**
 * 純度別のページ。
 *
 * 検索されているのは「K18 買取価格 今日」「プラチナ 買取 相場」のように
 * 純度を含む言い方で、/compare の純度セレクタはクライアント側の切り替えなので
 * 検索結果には出ない。実際 Search Console の上位クエリにも
 * 「24金相場 1g 今日 コメ兵」のように純度が入っている。
 *
 * 絞り込んだだけのページは重複と見なされうるので、各ページは
 * ・その純度の今日の高値・中央値・安値(数字が純度ごとに違う)
 * ・刻印の呼び方と、よくある品物(純度ごとに違う)
 * ・重さ別の概算額(純度ごとに違う)
 * を持つ。導入文も1本ずつ書いている。
 */
export interface PurityPageConfig {
  slug: string;
  purity: Purity;
  /** 見出しに使う呼び方 */
  label: string;
  /** 刻印の表記ゆれ。本文で触れる */
  marks: string;
  /** その純度でよく持ち込まれる品物。推測ではなく一般的な用途の説明に留める */
  typical: string;
  intro: string;
}

export const PURITY_PAGES: PurityPageConfig[] = [
  {
    slug: "k24",
    purity: "k24",
    label: "K24(純金)",
    marks: "K24・24K・999・9999・FINE GOLD",
    typical: "インゴット(金地金)、記念コイン、小判、純金メダル、仏具",
    intro:
      "K24は純度99.99%前後の純金です。地金やコインは製品としての加工が少ないぶん、各社の提示額が相場に近くなりやすい一方、メダルや小判を基準にした価格と、指輪などのスクラップで査定が分かれる社があります。",
  },
  {
    slug: "k22",
    purity: "k22",
    label: "K22",
    marks: "K22・22K・916",
    typical: "海外製のコイン、ブレスレット、インド・中東系のジュエリー",
    intro:
      "K22は金が約91.6%です。日本国内の宝飾品では多くありませんが、海外で購入したコインやアクセサリーに使われています。",
  },
  {
    slug: "k21-6",
    purity: "k21_6",
    label: "K21.6",
    marks: "K21.6・900",
    typical: "金貨(メイプルリーフ金貨などの一部)、海外製の装飾品",
    intro: "K21.6は金が90%です。特定の金貨に使われている純度で、国内の宝飾品ではあまり見かけません。",
  },
  {
    slug: "k20",
    purity: "k20",
    label: "K20",
    marks: "K20・20K・835",
    typical: "古い指輪、仏具、海外製の装飾品",
    intro: "K20は金が約83.5%です。流通量は多くありませんが、古い製品や海外製のものに見られます。",
  },
  {
    slug: "k18",
    purity: "k18",
    label: "K18",
    marks: "K18・18K・750",
    typical: "ネックレス、指輪、ブレスレット、ピアス、時計のケース",
    intro:
      "K18は金が75%で、日本の宝飾品でいちばん多い純度です。残りの25%は銀や銅などで、色味(イエロー・ピンク・ホワイト)はその配合の違いです。売る品物としても持ち込まれる量がもっとも多く、各社の価格差がそのまま金額差になりやすい純度です。",
  },
  {
    slug: "k14",
    purity: "k14",
    label: "K14",
    marks: "K14・14K・585",
    typical: "ネックレスチェーン、ピアス、海外製のジュエリー",
    intro:
      "K14は金が約58.5%です。アメリカなど海外では一般的な純度で、国内でもチェーンやピアスに使われています。GF(金張り)やGP(金メッキ)と刻印が似ているので、売る前に確認したい純度です。",
  },
  {
    slug: "k10",
    purity: "k10",
    label: "K10",
    marks: "K10・10K・417",
    typical: "カジュアルなアクセサリー、ピアス、チェーン",
    intro:
      "K10は金が約41.7%で、半分以上が他の金属です。手頃な価格帯のアクセサリーに使われます。金の割合が少ないぶん、1gあたりの単価もK18の半分前後になります。",
  },
  {
    slug: "k9",
    purity: "k9",
    label: "K9",
    marks: "K9・9K・375",
    typical: "イギリス製を中心とした海外のジュエリー",
    intro: "K9は金が37.5%です。イギリスでは一般的な純度で、アンティークジュエリーに見られます。",
  },
  {
    slug: "pt1000",
    purity: "pt1000",
    label: "Pt1000(純プラチナ)",
    marks: "Pt1000・PT1000・Pm1000・999",
    typical: "インゴット、コイン、一部のネックレス",
    intro: "Pt1000はプラチナ99.9%以上です。地金やコインに使われ、宝飾品ではPt900・Pt950のほうが多く見られます。",
  },
  {
    slug: "pt950",
    purity: "pt950",
    label: "Pt950",
    marks: "Pt950・PT950・Pm950",
    typical: "結婚指輪、婚約指輪、ネックレス",
    intro: "Pt950はプラチナ95%です。Pt900と並んで宝飾品でよく使われ、刻印の数字が1つ違うだけで単価が変わります。",
  },
  {
    slug: "pt900",
    purity: "pt900",
    label: "Pt900",
    marks: "Pt900・PT900・Pm900",
    typical: "結婚指輪、婚約指輪、台座つきのリング",
    intro:
      "Pt900はプラチナ90%で、日本の結婚指輪にもっとも多く使われている純度です。石つきのリングは石の重さを除いた地金分で計算されるため、総重量そのままの金額にはなりません。",
  },
  {
    slug: "pt850",
    purity: "pt850",
    label: "Pt850",
    marks: "Pt850・PT850・Pm850",
    typical: "ネックレスチェーン、ブレスレット",
    intro: "Pt850はプラチナ85%です。チェーン類に使われることが多い純度です。",
  },
  {
    slug: "silver",
    purity: "ag",
    label: "シルバー(Sv1000)",
    marks: "SV・SILVER・925・1000",
    typical: "食器、置物、記念メダル、アクセサリー",
    intro:
      "銀は1gあたりの単価が金の数十分の一なので、金額が出るかどうかは重さ次第です。食器や置物などまとまった重さがあるものでなければ、まとまった額にはなりにくい金属です。",
  },
];

export function getPurityPageBySlug(slug: string): PurityPageConfig | undefined {
  return PURITY_PAGES.find((p) => p.slug === slug);
}

export interface PurityMarket {
  /** その純度を公表している社数 */
  count: number;
  high: number;
  highName: string;
  median: number;
  low: number;
  lowName: string;
  /** 最高値と最安値の差 */
  spread: number;
  /** 価格の公表日ごとの社数(新しい順) */
  dates: { date: string; count: number }[];
}

/** その純度の今日の相場を、掲載データから数える。文章に数字を手で書かないため */
export function measurePurity(purity: Purity): PurityMarket | null {
  const rows = getCompanies()
    .filter((c) => c.priceData.prices[purity] !== undefined)
    .map((c) => ({ name: c.name, value: c.priceData.prices[purity] as number, date: c.priceData.updatedAt }))
    .sort((a, b) => b.value - a.value);

  if (rows.length === 0) return null;

  const counts = new Map<string, number>();
  for (const r of rows) {
    if (!r.date) continue;
    counts.set(r.date, (counts.get(r.date) ?? 0) + 1);
  }

  const mid = rows[(rows.length - 1) >> 1].value;

  return {
    count: rows.length,
    high: rows[0].value,
    highName: rows[0].name,
    median: mid,
    low: rows[rows.length - 1].value,
    lowName: rows[rows.length - 1].name,
    spread: rows[0].value - rows[rows.length - 1].value,
    dates: [...counts.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
}
