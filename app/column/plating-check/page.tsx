import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";
import ColumnHero from "@/components/ColumnHero";
import { PURITY_LABELS } from "@/lib/types";
import { MINT_CHECKED_AT, MINT_QUOTES, type MintQuote } from "@/lib/hallmarkMint";
import {
  BASE_METALS,
  CUSTOMS_QUOTES,
  CUSTOMS_REPORT,
  DENSITY,
  DENSITY_CHECKED_AT,
  MEASURED_BULLION,
  MOHS,
  goldAlloyDensities,
  heaviestBaseMetal,
  lowestGoldAlloyDensity,
  overlappingPairs,
} from "@/lib/densityTest";

const PATH = "/column/plating-check";

/**
 * 数字は lib/densityTest.ts に置いてある(出どころは税関の分析所の報告)。
 * 合金の密度は含有率から計算して出す。本文に書くと、品位の定義を直したときにずれる。
 *
 * この記事は長いあいだ磁石の話だけだった。検索で来ている言葉を見ると
 * 「金かどうか調べる方法 水」のように比重を探している人がいるのに、
 * そのことが1行も書かれていなかった。
 */

export const metadata: Metadata = {
  title: "メッキと金の見分け方 ― 磁石と、水に入れて重さで調べる方法",
  description:
    "磁石で分かることと分からないこと、水に入れて密度を出す方法の式、" +
    "そして税関の分析所が使っている金属の密度の値まで。" +
    "金メッキの土台に使われる金属と金合金は密度がはっきり違うので、家庭でもふるい分けはできます。" +
    "できないこと（タングステン、空洞、はかりの精度）も書きました。",
  alternates: { canonical: PATH },
};

function Quote({ entry }: { entry: MintQuote }) {
  return (
    <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
      <p>「{entry.quote}」</p>
      <footer className="mt-2 text-xs text-muted">
        出典:{" "}
        <a
          href={entry.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {entry.label}
        </a>
        （{MINT_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

const d2 = (n: number) => n.toFixed(2);

export default function PlatingCheckPage() {
  const alloys = goldAlloyDensities();
  const lowest = lowestGoldAlloyDensity();
  const heaviestBase = heaviestBaseMetal();
  const overlaps = overlappingPairs();
  const gap = lowest - heaviestBase.density;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, metadata), columnBreadcrumb(PATH, metadata)]} />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-3 text-xl font-semibold leading-snug sm:text-2xl">
        メッキと金の見分け方 ― 磁石と、水に入れて重さで調べる方法
      </h1>

      <ColumnHero href={PATH} />

      <p className="mb-4 text-base leading-relaxed">
        引き出しから出てきたネックレスが本物なのか、金色なだけなのか。売りに行く前に自分で確かめたい、という話をよく聞きます。
      </p>
      <p className="mb-8 text-base leading-relaxed">
        先に結論を書くと、家でできるのは
        <strong>「明らかに違うものをふるい落とす」ところまで</strong>
        です。純度まで当てることはできません。造幣局もそう書いています。
      </p>
      <Quote entry={MINT_QUOTES.voluntary} />
      <p className="mb-10 text-base leading-relaxed">
        刻印は任意の制度なので、無いこと自体は珍しくありません。刻印が読めない品物で何ができるかを、確からしい順に並べます。
      </p>

      {/* 1. 磁石 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">1. 磁石を近づけてみる</h2>
        <p className="mb-3 text-base leading-relaxed">
          いちばん手軽な方法です。
          <strong>金・銀・銅・プラチナは磁石に付きません</strong>
          。だからはっきり磁石に引き寄せられるなら、中身に鉄やニッケルが入っていることになります。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          これは実際にメッキの土台として使われている金属です。税関の分析所が押収品を調べた報告に、こう書かれています。
        </p>
        <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          <p>「{CUSTOMS_QUOTES.plating.quote}」</p>
          <footer className="mt-2 text-xs text-muted">
            出典:{" "}
            <a
              href={CUSTOMS_QUOTES.plating.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {CUSTOMS_QUOTES.plating.label}
            </a>
            （{DENSITY_CHECKED_AT}に確認）
          </footer>
        </blockquote>
        <p className="mb-3 text-base leading-relaxed">
          ただし、<strong>逆は言えません。</strong>
          付かなかったからといって金とはかぎりません。真鍮（銅と亜鉛）も、銅も、アルミニウムも磁石に付かないからです。金色のメッキの下が真鍮という品物はいくらでもあります。
        </p>
        <p className="text-base leading-relaxed">
          つまり磁石で分かるのは「鉄やニッケルが入っているかどうか」だけです。付いたら金ではない、付かなくても何も言えない。ここまでです。
        </p>
      </section>

      {/* 2. 比重 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          2. 水に入れて、重さの差から密度を出す
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          磁石より一段確かなのがこちらです。
          <strong>金は、ほかの金属よりはっきり重い</strong>
          という性質を使います。同じ大きさなら何倍も重いので、体積あたりの重さ（密度）を測れば区別がつきます。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          体積は、水に沈めたときに軽くなる分から分かります。{CUSTOMS_REPORT.publisher}
          が密輸品の鑑定に使っている式は、次のものです。
        </p>
        <div className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          <p className="mb-2">
            <strong>密度 ＝ 空中での重さ ÷（空中での重さ − 水中での重さ）× 水の密度</strong>
          </p>
          <p className="text-xs text-muted">
            水の密度は常温でほぼ1g/cm³なので、家でやるなら「空中の重さ ÷ 減った重さ」でかまいません。品物を糸で吊るして、水を入れたコップごとはかりに載せる方法でも同じ値が出ます。
          </p>
        </div>
        <p className="mb-3 text-base leading-relaxed">
          出た数字を、金属ごとの密度と比べます。次の値は、同じ報告の表（貴金属とおもな卑金属の密度）からの転記です。
        </p>
        <div className="mb-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full table-fixed text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="px-3 py-2 font-medium">金属</th>
                <th className="px-3 py-2 text-right font-medium">密度 (g/cm³)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(DENSITY).map(([name, v]) => (
                <tr key={name} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">{name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-base leading-relaxed">
          メッキの土台に使われる{BASE_METALS.join("・")}
          は、いちばん重い{heaviestBase.name}でも{heaviestBase.density}です。金の{DENSITY.金}
          とは比べるまでもありません。
        </p>
      </section>

      {/* 3. 合金の場合 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          K18のような合金でも、土台の金属とは重なりません
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          手元の品物が純金ということはまずありません。{PURITY_LABELS.k18}
          なら4分の1は別の金属です。それでも密度は十分に高いままです。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          混ぜものに何がどれだけ入っているかは製品ごとに違って分かりません。そこで、
          <strong>金以外がすべて銅だった場合と、すべて銀だった場合</strong>
          の2つを計算して、幅として出しました。実際の品物はこの間に入ります。
        </p>
        <div className="mb-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full table-fixed text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="px-3 py-2 font-medium">純度</th>
                <th className="px-3 py-2 text-right font-medium">
                  金以外を銅／銀と置いた密度 (g/cm³)
                </th>
              </tr>
            </thead>
            <tbody>
              {alloys.map((a) => (
                <tr key={a.purity} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">{PURITY_LABELS[a.purity]}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {a.low === a.high ? d2(a.low) : `${d2(a.low)} 〜 ${d2(a.high)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mb-3 text-base leading-relaxed">
          いちばん金の少ない{PURITY_LABELS.k9}でも{d2(lowest)}、メッキの土台でいちばん重い
          {heaviestBase.name}が{heaviestBase.density}。
          <strong>間が{d2(gap)}も空いています</strong>
          。家庭のはかりでも、ここを取り違えることはまずありません。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          ただし、この幅は
          <strong>金以外が銅か銀だと置いた場合のもの</strong>
          です。白っぽい金にはそれ以外が入ります。
        </p>
        <Quote entry={MINT_QUOTES.whiteGoldMetals} />
        <p className="mb-3 text-base leading-relaxed">
          パラジウムは銀より重い金属なので、同じ{PURITY_LABELS.k18}
          でも上の表より重く出ます。つまりこの幅は、純度を当てるための範囲ではありません。
          {overlaps.length > 0 && (
            <>
              計算した幅どうしで見ても、
              {overlaps.map((o) => `${PURITY_LABELS[o.a]}と${PURITY_LABELS[o.b]}`).join("、")}
              は重なっています。
            </>
          )}
        </p>
        <p className="text-base leading-relaxed">
          <strong>「何金か」を密度で当てることはできません。</strong>
          分かるのは「金が入っているか、入っていないか」までです。
        </p>
      </section>

      {/* 4. 限界 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">この方法で分からないこと</h2>
        <ul className="mb-3 list-disc space-y-2 rounded-xl border border-border bg-surface p-4 pl-9 text-sm leading-relaxed">
          <li>
            <strong>タングステンは見分けられません。</strong>
            密度が{DENSITY.タングステン}で、金の{DENSITY.金}
            とほぼ同じだからです。実際、上の報告でも密度では分けられず、硬さで判別しています（モース硬度は金が
            {MOHS.金}、タングステンが{MOHS.タングステン}）。鋼のはさみで切れるかどうかを試す、という方法です。
          </li>
          <li>
            <strong>空洞や、くぼみがあると狂います。</strong>
            中に空気が残ると体積が大きく出て、密度が低く計算されます。報告では、こうした品物は真空乾燥器で減圧して空気を抜いてから測っています。家ではできません。中空のチェーンや、石の付いた指輪は向きません。
          </li>
          <li>
            <strong>実測は文献値より下に出ます。</strong>
            同じ報告で、金地金{MEASURED_BULLION.samples}塊を測った密度の平均は
            {MEASURED_BULLION.mean}で、文献値の{DENSITY.金}
            より低い値でした。専用の比重計を使った国の分析所でこれです。家庭のはかりならもっとずれます。
          </li>
          <li>
            <strong>軽い品物は、はかりの桁が足りません。</strong>
            1g単位のはかりで5gの指輪を測ると、水中で減る重さは0.3g程度にしかなりません。表示が動かないか、動いても誤差のほうが大きくなります。
          </li>
        </ul>
        <p className="text-base leading-relaxed">
          ここまでの方法はどれも、売る前の目安です。買取価格は純度ごとに決まるので、最後は査定を受けることになります。
        </p>
      </section>

      {/* 5. 先に刻印 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">その前に、刻印を探してください</h2>
        <p className="mb-3 text-base leading-relaxed">
          ここまで書いておいて何ですが、
          <strong>いちばん確かなのは刻印を読むこと</strong>
          です。K18や750と入っていれば、密度を測るまでもありません。
        </p>
        <p className="text-base leading-relaxed">
          逆に「K18GP」のように数字のうしろに英字が続いていたら、それはメッキです。刻印の場所と読み方は{" "}
          <Link href="/column/hallmark" className="underline underline-offset-2">
            金の刻印はどこにある？
          </Link>
          にまとめています。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          密度の値・測定式・実測の平均・モース硬度は、
          <a
            href={CUSTOMS_REPORT.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {CUSTOMS_REPORT.title}
          </a>
          （{CUSTOMS_REPORT.publisher}）から{DENSITY_CHECKED_AT}
          に読んで転記しました。金の密輸が増えたため、めっきや塗装で偽装された品物を税関でどう見分けるかをまとめた報告です。家庭でやることと目的が同じなので、ここを典拠にしています。出典がPDFのため、当サイトの日次の点検では中身まで照合できません（URLが生きているかだけ見ています）。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          合金の密度は、当サイトが計算に使っている純度から、体積が足し合わせになると置いて計算したものです。混ぜものの中身は品物ごとに違うため、1つの値ではなく幅で出しています。造幣局の記載は
          {MINT_CHECKED_AT}に確認し、毎日取り直して照合しています。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          ここに書いたのは売る前の目安で、品位を保証するものではありません。薬品を使う試金は品物を傷めるため扱っていません。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
