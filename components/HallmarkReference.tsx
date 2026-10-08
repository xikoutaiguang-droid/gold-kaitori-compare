import Link from "next/link";
import { PURITY_PAGES } from "@/lib/purityPages";
import { PURITY_FINENESS } from "@/lib/units";
import { GOLD_PURITIES, PLATINUM_PURITIES } from "@/lib/types";

/**
 * 刻印の表記と、それが指す純度の対応表。
 *
 * なぜ要るか:
 * 「金の純度を表す文字」で検索して来る人がいる(5.5位)。知りたいのは
 * 「750とは何か」「K18と刻印の数字はどう対応するか」で、計算機の入力欄ではない。
 *
 * 表記も品位も lib/purityPages.ts と lib/units.ts が持っている値をそのまま使う。
 * ここに書き写すと、純度ページの表示とこの表が食い違う。
 */

const groupOf = (slug: string) => {
  const page = PURITY_PAGES.find((p) => p.slug === slug);
  if (!page) return "その他";
  if (GOLD_PURITIES.includes(page.purity)) return "金";
  if (PLATINUM_PURITIES.includes(page.purity)) return "プラチナ";
  return "銀";
};

export default function HallmarkReference() {
  const rows = PURITY_PAGES.map((p) => ({
    slug: p.slug,
    label: p.label,
    marks: p.marks,
    fineness: PURITY_FINENESS[p.purity],
    group: groupOf(p.slug),
  }));

  return (
    <section className="mt-10">
      <h2 className="font-serif-jp mb-3 text-lg font-semibold">刻印の表記と、その純度</h2>
      <p className="mb-3 text-sm leading-relaxed text-muted">
        品物に打たれている数字は千分率です。「750」は1000分の750＝75%が金、という意味になります。
      </p>
      <div className="mb-3 overflow-hidden rounded-xl border border-border">
        <table className="w-full table-fixed text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-accent bg-table-head text-left">
              <th className="w-14 px-2 py-2 font-medium">金属</th>
              <th className="w-20 px-2 py-2 font-medium">品位</th>
              <th className="px-2 py-2 font-medium">刻印の表記</th>
              <th className="w-16 px-2 py-2 text-right font-medium">含有率</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-b border-border last:border-0 even:bg-table-stripe">
                <td className="px-2 py-2 text-muted">{r.group}</td>
                <td className="px-2 py-2">
                  <Link href={`/price/${r.slug}`} className="underline underline-offset-2">
                    {r.label}
                  </Link>
                </td>
                <td className="px-2 py-2 leading-relaxed">{r.marks}</td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {(r.fineness * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        刻印の数字は四捨五入の仕方で1刻み違うことがあります。たとえばK10は24分の10＝41.67%で、刻印は「417」ですが、当サイトは価格の比較に41.6%を使っています。K20には24分率の833と、国内のホールマークに由来する835の2通りがあり、当サイトは835を採っています。刻印が読めない・見当たらない場合は{" "}
        <Link href="/column/hallmark" className="underline underline-offset-2">
          刻印の探し方
        </Link>
        と{" "}
        <Link href="/column/plating-check" className="underline underline-offset-2">
          メッキの見分け方
        </Link>
        をご覧ください。
      </p>
    </section>
  );
}
