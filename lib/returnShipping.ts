import { FEE_DISCLOSURES } from "@/lib/fees";
import { SERVICE_RECORDS } from "@/lib/services";

/**
 * 宅配買取で「金額に納得できず返してもらう」ときに、各社が何と書いているか。
 *
 * 「金 買取 返送料」で来る人への答え。新しく各社のページを読んだものではなく、
 * 手数料(lib/fees.ts)と買取方法(lib/services.ts)の調査で、すでに引用している文言から拾っている。
 * 文字列をここに写さず、元の記録から引くのは、元が直されたときに食い違わないようにするため。
 *
 * 機械的に「返送」で探すと、さのやの「宅配キットにお品物を入れ返送していただき」
 * (こちらから送る意味)が引っかかる。読んだうえで手で分けている。
 *
 * 分け方:
 * - returnFee: 返送料そのものに触れている
 * - cancelOnly: キャンセル料には触れているが、返送料という言葉は無い。
 *   キャンセル料と返送料は別の費用なので、ここに入る社は返送料を別に確かめる必要がある
 */
export type ReturnMention = "returnFee" | "cancelOnly";

export interface ReturnShippingNote {
  companyId: string;
  mention: ReturnMention;
  quote: string;
  sourceUrl?: string;
  /** 文言を読んだ日 */
  checkedAt: string;
  /** 文言に条件があるときの補足 */
  note?: string;
}

function fromFees(companyId: string, mention: ReturnMention, note?: string): ReturnShippingNote | null {
  const d = FEE_DISCLOSURES.find((x) => x.companyId === companyId);
  return d ? { companyId, mention, quote: d.quote, sourceUrl: d.sourceUrl, checkedAt: d.checkedAt, note } : null;
}

function fromServices(companyId: string, mention: ReturnMention, note?: string): ReturnShippingNote | null {
  const r = SERVICE_RECORDS.find((x) => x.companyId === companyId);
  const quote = r?.shipping?.quote;
  return r && quote ? { companyId, mention, quote, sourceUrl: r.sourceUrl, checkedAt: r.checkedAt, note } : null;
}

export const RETURN_SHIPPING_NOTES: ReturnShippingNote[] = [
  // リファスタのよくある質問。2026-10-02に読んだ(app/column/mail-in-purchase の READ_AT)。
  // 当時ページのURLを記録していなかったので、リンクは付けない。
  {
    companyId: "refasta",
    mention: "returnFee",
    quote:
      "査定後のキャンセル料、返送料は無料。返却は一部、全品どちらも対応しております。なお、お送りいただいたお品物すべてにお値段が付かなかった場合のみ着払いにて返送いたしております。",
    checkedAt: "2026-10-02",
    note: "送った品すべてに値段が付かなかったときだけ着払い。",
  },
  fromFees("netoff", "returnFee"),
  fromServices("e-daikoku", "cancelOnly", "「往復送料」は、宅配キットで送って返ってくるまでの送料とも読めますが、返送料という言葉はありません。"),
  fromServices("nanboya", "cancelOnly"),
  fromFees("brandcom", "cancelOnly"),
].filter((x): x is ReturnShippingNote => x !== null);

/** 宅配に対応していて、上のどちらにも当たらない社(当サイトが読んだ範囲で記載が無かった社) */
export function companiesWithoutReturnNote(): string[] {
  const noted = new Set(RETURN_SHIPPING_NOTES.map((n) => n.companyId));
  return SERVICE_RECORDS.filter((r) => r.shipping && !noted.has(r.companyId)).map((r) => r.companyId);
}
