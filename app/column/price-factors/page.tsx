import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import ColumnHero from "@/components/ColumnHero";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import { getFxData, latestDriver, measureDrivers, totalOver, verdictOf } from "@/lib/marketDrivers";
import { measureAgainstBenchmark } from "@/lib/priceMeaning";
import { PURITY_LABELS } from "@/lib/types";

const PATH = "/column/price-factors";

/**
 * 以前この記事は、国際価格・為替・世界情勢を言葉だけで説明していた。
 * ところが当サイトは /drivers で同じことを毎日測っている。
 * 説明している当のものを measure できるのに一般論で書いてある、という状態だったので、
 * 数字のほうに置き換えた。
 *
 * 測れないこと(為替で説明できない残りが、なぜ動いたのか)は、
 * 測れないと書く。原因を推し量って書き足さない。
 */

/** 分解をまとめて見せる日数。1か月ぶんの目安 */
const WINDOW_DAYS = 30;

const yen = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Math.round(n)).toLocaleString("ja-JP")}`;
const plain = (n: number) => Math.round(n).toLocaleString("ja-JP");
const jaDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[2])}月${Number(m[3])}日` : iso;
};

export const metadata: Metadata = {
  title: "金相場はなぜ動くのか ― 円建ての値動きを為替とそれ以外に分ける",
  description:
    "円建ての金価格は「ドル建ての価格 × ドル円」で決まります。だから値上がりしても、" +
    "金そのものが上がったのか円が安くなっただけなのかは、価格だけ見ても分かりません。" +
    "当サイトが毎日記録している先物価格とドル円から、その日の値動きを2つに分けて示します。",
  alternates: { canonical: PATH },
};

export default function PriceFactorsColumnPage() {
  const days = measureDrivers();
  const latest = latestDriver(days);
  const span = totalOver(days, WINDOW_DAYS);
  const fx = getFxData();
  const bench = measureAgainstBenchmark("k24");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, metadata), columnBreadcrumb(PATH, metadata)]} />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-3 text-xl font-semibold leading-snug sm:text-2xl">
        金相場はなぜ動くのか ― 円建ての値動きを為替とそれ以外に分ける
      </h1>

      <ColumnHero href={PATH} />

      <p className="mb-4 text-base leading-relaxed">
        「昨日と今日で買取価格が違う」のは珍しいことではありません。ただ、
        <strong>上がった理由は1つではありません</strong>。
      </p>
      <p className="mb-8 text-base leading-relaxed">
        金は世界ではドル建てで取引されています。日本で見ている円建ての価格は、おおまかに
        <strong>ドル建ての価格 × ドル円</strong>
        です。かけ算の左が動いても右が動いても、円建ては動きます。だから「金が上がった」と言われても、金そのものが上がったのか、円が安くなっただけなのかは、価格だけを見ても分かりません。
      </p>

      {/* ---- 1. 分けてみる ---- */}
      {span ? (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">
            実際に分けると、こうなっています
          </h2>
          <p className="mb-3 text-base leading-relaxed">
            {jaDate(span.from)}から{jaDate(span.to)}までの{span.days}
            日ぶんを足し合わせたものです。円建ての動きのうち、ドル円の動きで説明できる分と、そうでない分に分けました。
          </p>
          <div className="mb-3 overflow-hidden rounded-xl border border-border">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">円建ての金価格が動いた分</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {yen(span.changeJpy)}円/g
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">　うち、ドル円で説明できる分</td>
                  <td className="px-3 py-2 text-right tabular-nums">{yen(span.fxPart)}円/g</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">　うち、それ以外</td>
                  <td className="px-3 py-2 text-right tabular-nums">{yen(span.restPart)}円/g</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-base leading-relaxed">
            足し算が合うように分けているだけで、どちらが「本当の理由」かを決めているわけではありません。ただ、
            <strong>為替だけで説明できる値動きではない</strong>
            ことも、<strong>為替を無視しては説明できない</strong>ことも、この表から読めます。
          </p>
        </section>
      ) : null}

      {/* ---- 2. 1日で見る ---- */}
      {latest && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">1日ぶんで見ると、分かりやすくなります</h2>
          <p className="mb-3 text-base leading-relaxed">
            いちばん新しい記録は{jaDate(latest.date)}です。前の記録日（{jaDate(latest.previousDate)}
            ）と比べます。
          </p>
          <div className="mb-3 overflow-hidden rounded-xl border border-border">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">金（円建て・先物）</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {plain(latest.goldJpy)}円/g（{yen(latest.changeJpy)}）
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">ドル円</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {latest.usdJpy.toFixed(2)}円（
                    {latest.fxChange > 0 ? "+" : latest.fxChange < 0 ? "−" : ""}
                    {Math.abs(latest.fxChange).toFixed(2)}）
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">　為替で説明できる分</td>
                  <td className="px-3 py-2 text-right tabular-nums">{yen(latest.fxPart)}円/g</td>
                </tr>
                <tr className="bg-accent-soft/40">
                  <td className="px-3 py-2">　それ以外</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {yen(latest.restPart)}円/g
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-3 text-base leading-relaxed">
            {(() => {
              const v = verdictOf(latest);
              if (v === "flat") return "この日はほとんど動いていません。";
              if (v === "fx")
                return "この日の動きは、ほとんどが為替で説明できます。金そのものの値段は、ドルで見ればあまり変わっていません。";
              if (v === "rest")
                return "この日の動きは、ほとんどが為替以外です。ドルで見た金そのものの値段が動いた、ということになります。";
              return "この日は、為替とそれ以外が両方効いています。";
            })()}
          </p>
          <p className="text-base leading-relaxed">
            日ごとの分解は{" "}
            <Link href="/drivers" className="underline underline-offset-2">
              値動きの理由
            </Link>
            に毎日ためています。どちらが効く日が多いかは、月によって変わります。
          </p>
        </section>
      )}

      {/* ---- 3. 測れないこと ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          「それ以外」の中身は、当サイトでは分かりません
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          為替で説明できない分が動いた理由としては、世界情勢や金利、中央銀行の売買、産出量といったものが挙げられます。ただ、
          <strong>どれがどれだけ効いたのかを当サイトは測っていません</strong>
          。分けられるのは「為替かどうか」までです。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          よく「不安が高まると金が買われる」と言われます。実際にそう動く場面はありますが、当サイトが持っているのは価格と為替の記録だけなので、ある日の値動きをその理由に結びつけることはできません。できないことを、できるように書かないことにしています。
        </p>
        <p className="text-base leading-relaxed">
          将来どう動くかについても、当サイトは何も言いません。
          <Link href="/trend" className="underline underline-offset-2">
            今が売り時？
          </Link>
          のページも、過去の記録を並べているだけで、予測ではありません。
        </p>
      </section>

      {/* ---- 4. 買取価格はさらにその先 ---- */}
      {bench && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">
            そして、買取価格は相場そのものではありません
          </h2>
          <p className="mb-3 text-base leading-relaxed">
            ここまでは相場の話です。実際に受け取る金額は、そこからさらに各社の取り分を引いたものになります。
            {jaDate(bench.referenceDate)}の{PURITY_LABELS.k24}で、
            <a
              href={bench.referenceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-2"
            >
              {bench.reference.toLocaleString("ja-JP")}円/gという建値
            </a>
            に対して、掲載社がどこに位置しているかを並べました。
          </p>
          <div className="mb-3 overflow-hidden rounded-xl border border-border">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">建値に対していちばん高い社</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {bench.rows[0].ratio.toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">まん中</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {bench.medianRatio.toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">いちばん低い社</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {bench.rows[bench.rows.length - 1].ratio.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-base leading-relaxed">
            相場が同じでも、この幅のぶんだけ受け取る額は変わります。相場の動きを待つより先に確かめられるのはこちらです。各社の単価が何を指しているかは{" "}
            <Link href="/column/what-a-gram-means" className="underline underline-offset-2">
              「1gいくら」は、店ごとに同じ意味ではない
            </Link>
            に、日と店のどちらが効くかは{" "}
            <Link href="/column/timing-vs-shop" className="underline underline-offset-2">
              売る日と売る店、どちらが金額を動かすのか
            </Link>
            にまとめています。
          </p>
        </section>
      )}

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          円建ての金価格は大阪取引所の金先物の清算値段、ドル円は{fx.source}
          から、いずれも当サイトが毎日記録しているものです。{fx.notes}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          分解は「前日の円建て価格 ÷ 前日のドル円 × ドル円の変化」を為替の分とし、残りをそれ以外としています。足し算が合うように分けた目安で、原因を特定するものではありません。計算のもとになった数字は{" "}
          <Link href="/drivers" className="underline underline-offset-2">
            値動きの理由
          </Link>
          に日ごとに出しています。当サイトは投資助言を行うものではなく、将来の価格を予測するものでもありません。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
