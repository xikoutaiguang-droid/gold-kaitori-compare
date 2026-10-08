import { WEIGHT_UNIT_TO_GRAM } from "@/lib/units";

/**
 * よく使う重さの換算を、計算機とは別に表で出す。
 *
 * なぜ要るか:
 * 「1トロイオンスは何グラム」で検索して来る人が一定数いる(3か月で4回表示、6.0位)。
 * 求めているのは入力欄ではなく答えの数字で、これまでその数字はページ下部の
 * 「よくある質問」の中にしか無かった。探す前に目に入る位置に置く。
 *
 * 数字はすべて lib/units.ts の係数から計算する。表に書き写すと、
 * 係数を直したときに表だけ古くなる。
 */

/** 常衡オンス(ふつうの「オンス」)。金では使わないが、取り違えやすいので併記する */
const AVOIRDUPOIS_OUNCE_G = 28.349523125;

const ROWS: { from: string; grams: number; note: string }[] = [
  { from: "1匁(もんめ)", grams: WEIGHT_UNIT_TO_GRAM.momme, note: "尺貫法の単位。日本の宝飾・貴金属業界で今も使われます" },
  {
    from: "1トロイオンス(toz)",
    grams: WEIGHT_UNIT_TO_GRAM.oz,
    note: "金・プラチナの国際取引で使う単位。海外の相場はこの単位で出ます",
  },
  {
    from: "1オンス(常衡/oz)",
    grams: AVOIRDUPOIS_OUNCE_G,
    note: "食品などで使う一般的なオンス。貴金属では使いません",
  },
  { from: "1キログラム", grams: WEIGHT_UNIT_TO_GRAM.kg, note: "地金(インゴット)でよく使われる単位" },
];

const fmt = (n: number) =>
  n.toLocaleString("ja-JP", { maximumFractionDigits: 7, minimumFractionDigits: 0 });

export default function UnitReference() {
  return (
    <section className="mt-10">
      <h2 className="font-serif-jp mb-3 text-lg font-semibold">よく使う換算</h2>
      <div className="mb-3 overflow-hidden rounded-xl border border-border">
        <table className="w-full table-fixed text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-accent bg-table-head text-left">
              <th className="w-28 px-3 py-2 font-medium">単位</th>
              <th className="w-24 px-3 py-2 text-right font-medium">グラム</th>
              <th className="px-3 py-2 font-medium">使われる場面</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.from} className="border-b border-border last:border-0 even:bg-table-stripe">
                <td className="px-3 py-2">{r.from}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(r.grams)}g</td>
                <td className="px-3 py-2 leading-relaxed text-muted">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm leading-relaxed text-muted">
        逆に、1gは{fmt(Number((1 / WEIGHT_UNIT_TO_GRAM.momme).toFixed(4)))}匁、
        {fmt(Number((1 / WEIGHT_UNIT_TO_GRAM.oz).toFixed(5)))}トロイオンスです。 金地金1kgは
        {fmt(Number((WEIGHT_UNIT_TO_GRAM.kg / WEIGHT_UNIT_TO_GRAM.oz).toFixed(3)))}トロイオンスにあたります。
      </p>
    </section>
  );
}
