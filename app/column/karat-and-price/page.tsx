import type { Metadata } from "next";
import Link from "next/link";
import { KARAT_ORDER, measureKaratPricing, medianK24 } from "@/lib/karat";
import { PURITY_LABELS } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";

export function generateMetadata(): Metadata {
  return {
    title: "K18は「金75%」。では値段も75%になるのか",
    description:
      "K24・K22・K18・K14・K10といった刻印が示す金の含有率と、その純度に実際いくら払われているかを、掲載中の買取店の公表価格から測りました。純度が下がるほど、含有率よりも安く買われています。",
    alternates: { canonical: "/column/karat-and-price" },
  };
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

/** 刻印から分かること。数字は PURITY_FINENESS と同じ定義値を使う */
const CHARACTER: Partial<Record<(typeof KARAT_ORDER)[number], string>> = {
  k24: "純金。やわらかく傷が付きやすいため、指輪よりインゴットや金貨に使われます。実際の地金は99.99%などと表示されます。",
  k22: "コインやアジア圏のジュエリーに多い純度です。",
  k21_6: "金貨の一部に使われる純度です。",
  k20: "国内では多くありません。刻印が835になっていることがあります。",
  k18: "日本のジュエリーでもっともよく使われる純度です。",
  k14: "強度があり、普段使いのアクセサリーに向きます。",
  k10: "金の比率は半分以下。傷に強く、手ごろな価格帯の製品に使われます。",
  k9: "国内では少なく、英国などで一般的な純度です。",
};

export default function KaratAndPricePage() {
  const rows = measureKaratPricing();
  const k24 = medianK24();

  if (!rows.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-muted">価格データが揃っていないため、この記事を一時的に出していません。</p>
      </div>
    );
  }

  const k18 = rows.find((r) => r.purity === "k18");
  const lowest = rows[rows.length - 1];
  const belowRows = rows.filter((r) => r.purity !== "k24" && r.gap < 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd("/column/karat-and-price", generateMetadata()), columnBreadcrumb("/column/karat-and-price", generateMetadata())]} />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        K18は「金75%」。では値段も75%になるのか
      </h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        指輪の内側にある「K18」「750」といった刻印は、その品物に金が何%入っているかを表しています。
        ここまでは決まった数字なので、どこで調べても同じです。
        では、その含有率どおりの金額で買い取られるのか。掲載中の買取店が純度ごとに公表している
        価格を使って、実際に確かめました。
      </p>

      {/* 1. 刻印の意味 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">刻印が示す金の含有率</h2>
        <div className="mb-3 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-2 pr-3 font-medium">刻印</th>
                <th className="py-2 pr-3 text-right font-medium">金の含有率</th>
                <th className="py-2 font-medium">主な使われ方</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.purity} className="border-b border-border/60">
                  <td className="py-2 pr-3 font-medium">{PURITY_LABELS[r.purity]}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{pct(r.fineness)}</td>
                  <td className="py-2 text-xs leading-relaxed text-muted">{CHARACTER[r.purity]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          Kのあとの数字は24分率です。K18なら18/24で75%。刻印が「750」「585」のように
          千分率で書かれていることもあり、意味は同じです。
          なおK24をここでは100%としていますが、これは24/24という刻印上の定義で、
          純度100%の金を作ることは実際にはできません。地金は99.99%などと表示されます。
          {k24 ? `本日のK24の買取価格は、掲載社の中央値で1gあたり${k24.toLocaleString("ja-JP")}円です。` : ""}
        </p>
      </section>

      {/* 2. 本題 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">含有率どおりには買われていない</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          各社がK24とそれ以外の純度で公表している価格を割り算すると、
          「K24を100としたとき、その純度はいくらで買われているか」が出ます。
          これを含有率と並べたのが次の表です。
        </p>
        <div className="mb-3 overflow-x-auto">
          <table className="w-full min-w-[460px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-2 pr-3 font-medium">刻印</th>
                <th className="py-2 pr-3 text-right font-medium">含有率</th>
                <th className="py-2 pr-3 text-right font-medium">実際の価格比</th>
                <th className="py-2 pr-3 text-right font-medium">差</th>
                <th className="py-2 text-right font-medium">社数</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.purity} className="border-b border-border/60">
                  <td className="py-2 pr-3">{PURITY_LABELS[r.purity]}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-muted">{pct(r.fineness)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{pct(r.priceRatio)}</td>
                  <td
                    className={`py-2 pr-3 text-right tabular-nums ${
                      r.gap > 0.05 ? "text-emerald-700 dark:text-emerald-400" : "text-muted"
                    }`}
                  >
                    {r.purity === "k24" ? "—" : `${r.gap > 0 ? "+" : ""}${r.gap.toFixed(1)}pt`}
                  </td>
                  <td className="py-2 text-right tabular-nums text-muted">{r.count}社</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-xs text-muted">
          各社のK24価格を1としたときの比の中央値です。K24を基準にしているため、K24の行は必ず100%になります。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          純度が下がるほど、含有率より安く買われていることが分かります。
          {lowest && (
            <>
              いちばん低い{PURITY_LABELS[lowest.purity]}では、含有率{pct(lowest.fineness)}に対して
              実際は<span className="font-semibold">{pct(lowest.priceRatio)}</span>、
              差は{Math.abs(lowest.gap).toFixed(1)}ポイントです。
              比較できた{lowest.count}社のうち、含有率を上回る価格を出していたのは
              {lowest.above}社でした。
            </>
          )}
        </p>
      </section>

      {/* 3. K18の例外 */}
      {k18 && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">K18だけは逆になる</h2>
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">
            例外がひとつあります。K18は含有率75%に対して、実際の価格比は
            <span className="font-semibold">{pct(k18.priceRatio)}</span>。
            含有率を<span className="font-semibold">{k18.gap.toFixed(1)}ポイント上回って</span>います。
            比較できた{k18.count}社のうち{k18.above}社が、含有率より高い価格を付けていました。
            一部の店の傾向ではなく、ほとんどの店がそうしているということです。
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            K18は日本のジュエリーでもっとも多い純度です。ただ、なぜこの純度だけ扱いが違うのかは、
            各社が理由を公表していないため当サイトでは分かりません。分かるのは、そうなっているという事実だけです。
          </p>
        </section>
      )}

      {/* 4. 理由として考えられること */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">低い純度ほど不利になる理由</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          買取店は買い取った金を精錬して金属に戻します。その費用について、おたからやは自社サイトで
          こう書いています。
        </p>
        <figure className="my-4 border-l-2 border-accent/50 pl-4">
          <blockquote className="text-sm leading-relaxed text-foreground/80">
            買取価格は、精錬・加工に要する費用等を差し引いた金額となります。
          </blockquote>
          <figcaption className="mt-1 text-xs text-muted">
            おたからや「金の買取相場」より（2026年9月22日閲覧）
          </figcaption>
        </figure>
        <p className="text-sm leading-relaxed text-foreground/80">
          この費用が、品物の重さに対してかかるのだとすれば、純度が低いほど取り出せる金は少なく、
          同じ手間に対して回収できる金属が減ります。そのぶん差し引く幅が広くなる、という説明は成り立ちます。
          ただしこれは表の形からの推測で、各社が費用の内訳を公表しているわけではありません。
        </p>
      </section>

      {/* 5. 使い方 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">売るときに効いてくること</h2>
        <ul className="mb-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-foreground/80">
          <li>
            K24の価格だけを見て「自分のK18はその75%だろう」と見積もると、実際とずれます。
            {belowRows.length > 0 && (
              <>
                特に{belowRows.map((r) => PURITY_LABELS[r.purity]).slice(-3).join("・")}
                のような低い純度では、含有率から計算した金額より下がります。
              </>
            )}
          </li>
          <li>
            店を比べるときは、自分の持っている純度の価格で比べてください。
            K24で上位の店が、K10でも上位とは限りません。
          </li>
          <li>
            刻印が読めない、または刻印がない場合は、純度が確定しないため金額も出せません。
            その場合は査定で確認することになります。
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-foreground/80">
          当サイトの比較表は純度を選んで並べ替えられます。K24ではなく、売りたい品物の刻印で見てください。
        </p>
      </section>

      <div className="flex flex-col gap-2 text-sm">
        <Link href="/compare" className="underline underline-offset-2">
          純度を選んで各社の価格を比べる
        </Link>
        <Link href="/tools/purity-calculator" className="underline underline-offset-2">
          純度と重さから、含まれる純金属の量を計算する
        </Link>
        <Link href="/column/plating-check" className="underline underline-offset-2">
          刻印がないとき、メッキかどうかを確かめる方法
        </Link>
      </div>
    </div>
  );
}
