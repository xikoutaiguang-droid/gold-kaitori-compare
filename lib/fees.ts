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
];

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
