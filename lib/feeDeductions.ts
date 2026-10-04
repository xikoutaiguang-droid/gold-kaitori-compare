/**
 * 「表示単価で計算した金額」から、実際に引かれるぶんを機械的に出す。
 *
 * lib/fees.ts は各社の記載をそのまま文章で持っている(引用と確認日が主目的)。
 * そこに書いてある金額は人が読む前提の自由記述なので、計算には使えない。
 * シミュレーターで「で、いくら受け取れるのか」を出すために、
 * 金額が公表されている社だけを階段として持ち直したのがこのファイル。
 *
 * 守っていること:
 * - 公表されていない額は推測しない。「引かれるが金額は未公表」として出す。
 * - 送料のように地域で変わるものは固定値にしない。下限だけを出す。
 * - 実際に引かれる額(税込)で出す。公表が税抜の社は、同じ換算を使っている
 *   lib/priceMeaning.ts の実装をそのまま借りる。ここで階段を書き写すと
 *   /column/fees の表と食い違うので、数値は持たない。
 */
import { MANEKIYA_FEE, manekiyaFee } from "@/lib/priceMeaning";

export type DeductionScope = "all" | "shipping";

export interface DeductionTier {
  /** この金額未満に適用(nullなら上限なし) */
  under: number | null;
  /** 引かれる額(円)。null は「公表されていない」 */
  amount: number | null;
  /** 金額が分かっているぶんだけの下限。送料など変動ぶんがある社で使う */
  atLeast?: number;
  note?: string;
}

export interface FeeDeductionRule {
  companyId: string;
  /** 店頭でも引かれるのか、宅配のときだけか */
  scope: DeductionScope;
  /** 1点ごとか、1回の取引ごとか */
  per: "item" | "transaction";
  tiers: DeductionTier[];
  label: string;
  sourceUrl: string;
  checkedAt: string;
}

export const FEE_DEDUCTIONS: FeeDeductionRule[] = [
  {
    // 買取金額の階段で分析料が変わる。1点ごとなので、点数が増えるとそのぶん効く。
    // 20万円以上は「お問い合わせください」としか書かれていないので、額を置かない。
    // 階段そのものは MANEKIYA_FEE が持っている。2026-10-04に同社の表を取り直して
    // 4段とも一致することを確認済み。
    companyId: "manekiya",
    scope: "all",
    per: "item",
    label: "分析料",
    tiers: [
      ...MANEKIYA_FEE.tiers.map(([under]) => ({
        under,
        // 公表は税抜。実際に引かれるのは税込なので、記事と同じ換算を通す
        amount: manekiyaFee(under - 1),
      })),
      { under: null, amount: null, note: "20万円以上は「お問い合わせください」と書かれています" },
    ],
    sourceUrl: MANEKIYA_FEE.sourceUrl,
    checkedAt: "2026-10-04",
  },
  {
    // 宅配買取のうち、ノンブランドの貴金属だけを送って20万円未満だった場合。
    // 店頭は対象外と書かれているので scope は shipping。
    // ベーシックとスピードで額が違うが、高いほう(ベーシック)を出す。
    companyId: "refasta",
    scope: "shipping",
    per: "transaction",
    label: "宅配買取のご負担金",
    tiers: [
      {
        under: 200_000,
        amount: 1_650,
        note: "ベーシック宅配買取の額です。スピード宅配買取は1,100円と書かれています",
      },
      { under: null, amount: 0 },
    ],
    sourceUrl: "https://kinkaimasu.jp/kiyaku/",
    checkedAt: "2026-10-03",
  },
  {
    // 送料は地域で変わる(同社の例は関西から1,034円)ので固定値にしない。
    // 金額が分かっている事務手数料だけを下限として出す。
    companyId: "nexus13",
    scope: "shipping",
    per: "transaction",
    label: "送料・事務手数料",
    tiers: [
      {
        under: 70_000,
        amount: null,
        atLeast: 770,
        note: "送料と事務手数料770円。宅配キットを使うとさらに実費550円〜が加わります",
      },
      { under: 100_000, amount: null, atLeast: 770, note: "送料と事務手数料770円が引かれます" },
      { under: 150_000, amount: null, atLeast: 0, note: "送料が引かれます(地域により変わります)" },
      { under: null, amount: 0 },
    ],
    sourceUrl: "https://www.nexus13.co.jp/buy2/notice.php",
    checkedAt: "2026-10-03",
  },
];

export interface DeductionResult {
  rule: FeeDeductionRule;
  /** 確実に引かれると分かっている額。未公表なら null */
  amount: number | null;
  /** 金額の一部しか分からないときの下限 */
  atLeast: number | null;
  note?: string;
  /** 引かれないと分かっている場合 */
  none: boolean;
}

/**
 * ある社に、ある金額で持ち込んだときに引かれるぶん。
 *
 * @param gross 表示単価で計算した金額(1点あたり、または1回あたり)
 * @param method 持ち込み方。店頭なら宅配だけの差し引きは効かない
 */
export function deductionFor(
  companyId: string,
  gross: number,
  method: "storefront" | "shipping",
): DeductionResult | null {
  const rule = FEE_DEDUCTIONS.find((r) => r.companyId === companyId);
  if (!rule) return null;
  if (rule.scope === "shipping" && method === "storefront") {
    return { rule, amount: 0, atLeast: null, none: true };
  }

  const tier = rule.tiers.find((t) => t.under === null || gross < t.under);
  if (!tier) return null;

  if (tier.amount === 0) return { rule, amount: 0, atLeast: null, none: true, note: tier.note };
  return {
    rule,
    amount: tier.amount,
    atLeast: tier.atLeast ?? null,
    note: tier.note,
    none: false,
  };
}

/**
 * 手数料が「かかる」とだけ書かれていて、金額が公表されていない社。
 *
 * 買取エリートは2026-10-01時点では「買取手数料・査定料￥０」と書いていたので
 * 無料として扱っていた。10-04に引用を照合し直したらその一文が消えていて、
 * 「買取相場価格に手数料は含まれておりません」に変わっていたので移した。
 * シミュレーターでは、この社を「差し引き無し」として手取りの比較に使っていたため、
 * 直さないと順位の説明そのものが間違ったままになる。
 */
export const UNDISCLOSED_FEE_COMPANIES = ["nanboya", "brand-revalue", "kaitori-elite"];
