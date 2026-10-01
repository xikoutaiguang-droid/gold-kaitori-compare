import { getCompanies } from "@/lib/companies";
import rawCompanies from "@/data/companies.json";
import type { Company } from "@/lib/types";

/**
 * 手数料・分析料の開示状況。
 *
 * 各社の価格ページに書かれている文言を転記したもの。単価と違って日々動くものではないが、
 * 転記である以上いつ読んだものかを必ず残す。書き換えられていれば古くなる。
 *
 * 「手数料無料」という同じ4文字が、店によって別のことを指している。
 * 後から引かないという意味の店もあれば、費用を単価に織り込んだうえで
 * 「手数料は取らない」と言っている店もある。並べないと見分けられない。
 */
export type FeeModel =
  /** 表示単価から、あとで引かれる */
  | "deducted"
  /** 費用を単価に織り込み済み。あとから引かれるものはない */
  | "builtIn"
  /** 引かれるものはないと明記 */
  | "free"
  /** 店舗ごとに異なる */
  | "varies";

export interface FeeDisclosure {
  companyId: string;
  model: FeeModel;
  /** 公式サイトの記載そのまま。当サイトの要約ではない */
  quote: string;
  sourceUrl: string;
  /** その文言を読んだ日 */
  checkedAt: string;
}

export const FEE_DISCLOSURES: FeeDisclosure[] = [
  {
    companyId: "manekiya",
    model: "deducted",
    quote: "分析料は商品1点ごとにかかります",
    sourceUrl: "https://manekiya.com/rate",
    checkedAt: "2026-09-22",
  },
  {
    companyId: "otakaraya",
    model: "builtIn",
    quote: "買取価格は、精錬・加工に要する費用等を差し引いた金額となります",
    sourceUrl: "https://www.otakaraya.jp/gold/souba/",
    checkedAt: "2026-09-22",
  },
  {
    companyId: "komehyo",
    model: "free",
    quote: "店頭買取、宅配買取共に手数料は一切かかりません",
    sourceUrl: "https://komehyo.jp/kaitori/gold/souba/",
    checkedAt: "2026-09-22",
  },
  // ここから下は2026-10-01に各社の価格ページを読んで追加した。
  // 引用はすべて、取得したHTMLに同じ文字列があることを確認している。
  {
    companyId: "nanboya",
    model: "deducted",
    quote:
      "買取相場価格に手数料は含まれておりません。手数料に関しては実物拝見時にご案内させていただきます。",
    sourceUrl: "https://nanboya.com/gold-kaitori/",
    checkedAt: "2026-10-01",
  },
  {
    companyId: "brand-revalue",
    model: "deducted",
    quote: "買取相場価格に手数料は含まれておりません",
    sourceUrl: "https://brandrevalue.com/cat/gold/souba",
    checkedAt: "2026-10-01",
  },
  {
    companyId: "galleryrare",
    model: "deducted",
    quote: "参考買取価格に手数料は含まれておりません",
    sourceUrl: "https://galleryrare.jp/goldplatinum/",
    checkedAt: "2026-10-01",
  },
  {
    companyId: "kaitori-elite",
    model: "free",
    quote: "金・プラチナの買取手数料・査定料￥０なので安心してご利用いただけます",
    sourceUrl: "https://kaitori-off.net/gold/",
    checkedAt: "2026-10-01",
  },
  {
    companyId: "goldmrs",
    model: "free",
    quote: "当店では、手数料は一切いただいておりません。査定は無料となっております。",
    sourceUrl: "https://goldmrs.jp/",
    checkedAt: "2026-10-01",
  },
  {
    companyId: "nexus13",
    model: "free",
    quote: "手数料は一切いただきません",
    sourceUrl: "https://www.nexus13.co.jp/metals/",
    checkedAt: "2026-10-01",
  },
  {
    companyId: "rodeodrive",
    model: "free",
    quote: "当社は査定および買取に際して手数料をいただいておりません。",
    sourceUrl: "https://kaitori.rodeodrive.co.jp/gold/",
    checkedAt: "2026-10-01",
  },
  {
    companyId: "refasta",
    model: "free",
    quote:
      "貴金属の場合「重量」×「単価」とシンプルな計算方法で、買取手数料など一切掛かりませんのでご安心願えますでしょうか。",
    sourceUrl: "https://kinkaimasu.jp/",
    checkedAt: "2026-10-01",
  },
  {
    companyId: "netoff",
    model: "free",
    quote: "送料・手数料・査定料・振込手数料・キャンセル料・返送料 すべて0円！",
    sourceUrl: "https://www.netoff.co.jp/brand/jewelry/gold/",
    checkedAt: "2026-10-01",
  },
  {
    companyId: "kaitori-daikichi",
    model: "free",
    quote: "査定料、出張料、キャンセル料などの手数料は全て無料です。",
    sourceUrl: "https://www.kaitori-daikichi.jp/",
    checkedAt: "2026-10-01",
  },
  {
    companyId: "okuraya",
    model: "free",
    quote: "大蔵屋は一切手数料はかかりません!",
    sourceUrl: "https://okuraya.jp/",
    checkedAt: "2026-10-01",
  },
];

/** その社の手数料の記載。無ければ undefined */
export function feeDisclosureFor(companyId: string): FeeDisclosure | undefined {
  return FEE_DISCLOSURES.find((d) => d.companyId === companyId);
}

export const FEE_MODEL_LABEL: Record<FeeModel, string> = {
  deducted: "表示単価から、あとで引かれる",
  builtIn: "単価に織り込み済み。あとから引かれるものはない",
  free: "引かれるものはないと明記",
  varies: "店舗ごとに異なる",
};

export interface DisclosureRow extends FeeDisclosure {
  name: string;
  /** その社のK24単価。公表していなければ null */
  k24: number | null;
}

export interface FeeLandscape {
  /** 1gあたりの価格を公表している社数 */
  priced: number;
  /** そのうち、手数料の扱いを価格ページで確認できた社数 */
  disclosed: number;
  rows: DisclosureRow[];
  /** 「手数料」や「無料」に触れている社のうち、意味が分かれている数 */
  distinctModels: number;
}

/**
 * 手数料について何が分かっているかを数える。
 *
 * 「開示していない社」とは言わない。当サイトが価格ページを読んで見つけられなかった、
 * というだけで、別のページに書かれている可能性は残る。数えているのは
 * 「価格ページを見た人が気づけるか」であって、会社の姿勢ではない。
 */
export function measureFeeLandscape(): FeeLandscape {
  const companies = getCompanies();
  const all = rawCompanies as Company[];
  const priced = companies.filter((c) => Object.keys(c.priceData.prices).length > 0).length;

  const rows: DisclosureRow[] = FEE_DISCLOSURES.map((d) => {
    const c = all.find((x) => x.id === d.companyId);
    const live = companies.find((x) => x.id === d.companyId);
    return {
      ...d,
      name: c?.name ?? d.companyId,
      k24: live?.priceData.prices.k24 ?? null,
    };
  }).sort((a, b) => (b.k24 ?? 0) - (a.k24 ?? 0));

  return {
    priced,
    disclosed: rows.length,
    rows,
    distinctModels: new Set(rows.map((r) => r.model)).size,
  };
}

/** フランチャイズ中心で、同じ看板でも店舗ごとに条件が変わりうる社 */
export function franchiseCompanies(): { name: string; id: string; note: string }[] {
  return (rawCompanies as Company[])
    .filter((c) => typeof c.priceCaveat === "string" && c.priceCaveat.includes("フランチャイズ"))
    .map((c) => ({ name: c.name, id: c.id, note: c.priceCaveat as string }));
}
