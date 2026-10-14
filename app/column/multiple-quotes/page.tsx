import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";
import ColumnHero from "@/components/ColumnHero";
import { measureTimingVsShop } from "@/lib/timingVsShop";
import { measureSpread } from "@/lib/spread";
import { FEE_DEDUCTIONS, deductionFor } from "@/lib/feeDeductions";
import { getCompanies } from "@/lib/companies";
import {
  CONDITION_QUOTES,
  PREP_CHECKED_AT,
  PRODUCT_VALUE_QUOTES,
  type PrepQuote,
} from "@/lib/sellPrep";
import { PURITY_LABELS } from "@/lib/types";

const PATH = "/column/multiple-quotes";

/**
 * この記事は、以前は出典も計算も無い助言の箇条書きだった。
 * 「品物をきれいにしておく」のように、各社が「効かない」と書いていることを
 * 当サイトが「やったほうがいい」と書いていた項目もあった。
 *
 * いまは、相見積もりの効き目を毎日の記録から測り、
 * 効かないことは各社の記載を引いて効かないと書く。
 * 数字はここに持たない(相場が動けば翌日に嘘になる)。
 */

/** 計算の例に使う重さ。この数字自体に根拠はなく、桁を見せるためだけのもの */
const EXAMPLE_GRAMS = 10;
/** 差し引きの重さを見せるための例。少額のときほど効くことを示す */
const SMALL_LOT_YEN = 20000;

function Quote({ entry }: { entry: PrepQuote }) {
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
        （{PREP_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

export const metadata: Metadata = {
  title: "金買取の相見積もり ― 売る前にできる5つの準備",
  description:
    "同じ日の同じ品物でも、店によって1gあたりの金額は違います。その差を毎日の記録から測り、" +
    "相見積もりにどれだけの意味があるかを数字で出しました。" +
    "磨いても単価が上がらないことなど、やっても効かない準備も各社の記載から区別しています。",
  alternates: { canonical: PATH },
};

const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");
const jaDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[2])}月${Number(m[3])}日` : iso;
};

export default function MultipleQuotesColumnPage() {
  const k18 = measureSpread("k18");
  const t = measureTimingVsShop("k18");

  // 少額だと引かれる割合が大きい、という話に使う実例。
  // 店頭でも効く差し引きだけを採る(宅配だけの負担金は条件が違う)。
  const companies = getCompanies();
  const smallLot = FEE_DEDUCTIONS.map((rule) => {
    const d = deductionFor(rule.companyId, SMALL_LOT_YEN, "storefront");
    const name = companies.find((c) => c.id === rule.companyId)?.name;
    if (!d || d.none || !d.amount || !name) return null;
    return { name, amount: d.amount };
  })
    .filter((x): x is { name: string; amount: number } => x !== null)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, metadata), columnBreadcrumb(PATH, metadata)]} />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-3 text-xl font-semibold leading-snug sm:text-2xl">
        金買取の相見積もり ― 売る前にできる5つの準備
      </h1>

      <ColumnHero href={PATH} />

      <p className="mb-4 text-base leading-relaxed">
        売る前にできることは、思っているより少ないです。磨いても、持っていく時間を選んでも、金額はほとんど変わりません。
      </p>
      <p className="mb-8 text-base leading-relaxed">
        はっきり効くのは<strong>どの店に持っていくか</strong>
        だけで、それを知る方法が相見積もりです。どれくらい効くのかを、毎日の記録から測りました。
      </p>

      {/* ---- 1. 同じ日でも店で違う ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          同じ日・同じ純度で、ここまで違います
        </h2>
        {k18 ? (
          <>
            <p className="mb-3 text-base leading-relaxed">
              {PURITY_LABELS.k18}を公表している{k18.count}社の、同じ日の1gあたりの金額です。
            </p>
            <div className="mb-3 overflow-hidden rounded-xl border border-border">
              <table className="w-full table-fixed text-xs sm:text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2">いちばん高い店</td>
                    <td className="px-3 py-2 text-right tabular-nums">{yen(k18.high.price)}円/g</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2">まん中</td>
                    <td className="px-3 py-2 text-right tabular-nums">{yen(k18.median)}円/g</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2">いちばん安い店</td>
                    <td className="px-3 py-2 text-right tabular-nums">{yen(k18.low.price)}円/g</td>
                  </tr>
                  <tr className="bg-accent-soft/40">
                    <td className="px-3 py-2 font-medium">差</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">
                      {yen(k18.range)}円/g
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-3 text-base leading-relaxed">
              {EXAMPLE_GRAMS}gなら<strong>{yen(k18.range * EXAMPLE_GRAMS)}円</strong>の違いです。
            </p>
            <p className="mb-3 text-base leading-relaxed">
              この幅は端の2社で大きくなっています。上下1社ずつを外すと1gあたり
              {yen(k18.trimmedRange)}円まで縮みます。それでも{EXAMPLE_GRAMS}gで
              {yen(k18.trimmedRange * EXAMPLE_GRAMS)}
              円の違いが残るので、安いほうの1社を避ければ済む、という話ではありません。
            </p>
            <p className="text-base leading-relaxed">
              1軒目で出た金額が、この幅のどこにあるのかは、そこだけを見ていても分かりません。
            </p>
          </>
        ) : (
          <p className="text-base leading-relaxed">
            いまは各社の価格が揃っていないため、差の計算を表示していません。
          </p>
        )}
      </section>

      {/* ---- 2. 1位は固定ではない ---- */}
      {t && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">
            「ここがいちばん高い」は、覚えておけません
          </h2>
          <p className="mb-3 text-base leading-relaxed">
            一度調べて終わりにできるなら、相見積もりは要りません。{jaDate(t.from)}から
            {jaDate(t.to)}までの{t.days}日間で、{PURITY_LABELS.k18}
            の順位を数えました。期間を通して毎日そろっている{t.panelSize}
            社だけで比べています（途中から記録が始まった社を混ぜると、順位が上がったのか記録が増えただけなのか分からなくなるためです）。1位になったのは
            {t.leaders.length}社でした。
          </p>
          <div className="mb-3 overflow-hidden rounded-xl border border-border">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-3 py-2 font-medium">1位になった社</th>
                  <th className="px-3 py-2 text-right font-medium">日数</th>
                </tr>
              </thead>
              <tbody>
                {t.leaders.map((l) => (
                  <tr key={l.name} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">{l.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.days}日</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-base leading-relaxed">
            {t.leaders.length > 1
              ? `顔ぶれは${t.leaderChanges}回入れ替わりました。先月いちばん高かった店が、今日もいちばん高いとはかぎりません。`
              : `この期間は入れ替わりませんでしたが、1社だけを見て決める理由にはなりません。各社とも毎日値を動かしています。`}
          </p>
        </section>
      )}

      {/* ---- 3. 日より店 ---- */}
      {t && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">
            売る日を選ぶより、売る店を選ぶほうが効きます
          </h2>
          <p className="mb-3 text-base leading-relaxed">
            「相場が上がるまで待つ」という考え方があります。同じ{t.days}日間で、2つを比べました。
          </p>
          <div className="mb-3 overflow-hidden rounded-xl border border-border">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2">同じ日に、店を変えたときの差（中央値）</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {yen(t.gapMedian)}円/g
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">期間中に、まん中の値が動いた幅</td>
                  <td className="px-3 py-2 text-right tabular-nums">{yen(t.medianRange)}円/g</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-3 text-base leading-relaxed">
            {t.gapMedian >= t.medianRange ? (
              <>
                店を変えたときの差のほうが大きくなっています。
                <strong>待つより、その日に何社か当たるほうが確かです</strong>。
              </>
            ) : (
              <>
                この期間は、相場そのものの動きのほうが大きくなりました。ただし、いつどちらに動くかは事前には分かりません。店の差のほうは、今日その場で確かめられます。
              </>
            )}
          </p>
          <p className="text-base leading-relaxed">
            日と店のどちらが効くかを詳しく測ったものは{" "}
            <Link href="/column/timing-vs-shop" className="underline underline-offset-2">
              売る日と売る店、どちらが金額を動かすのか
            </Link>
            にまとめています。
          </p>
        </section>
      )}

      {/* ---- 4. 効かない準備 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">磨いても、単価は上がりません</h2>
        <p className="mb-3 text-base leading-relaxed">
          売る前に磨いておく、という話をよく見ます。ただ、買う側はそう書いていません。
        </p>
        {CONDITION_QUOTES.map((q) => (
          <Quote key={q.sourceId} entry={q} />
        ))}
        <p className="mb-3 text-base leading-relaxed">
          地金としての金額は<strong>重さと純度だけ</strong>
          で決まります。汚れも傷も変形も、そこには入りません。磨く時間があるなら、もう1社に見せたほうが金額は動きます。
        </p>
        <p className="text-base leading-relaxed">
          強く磨けば、そのぶん削れて軽くなります。重さがそのまま金額なので、落とすのは表面のほこり程度にとどめてください。
        </p>
      </section>

      {/* ---- 5. 付属品が効く場合 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          箱や保証書が効くのは、地金ではないほうです
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          一方で、品物によっては地金の金額に上乗せが付くことがあります。効くのはこちらです。
        </p>
        {PRODUCT_VALUE_QUOTES.map((q) => (
          <Quote key={q.sourceId} entry={q} />
        ))}
        <p className="text-base leading-relaxed">
          ブランドのジュエリーや、製品として売れる状態のものは、溶かさずに売られる可能性があります。その場合は箱・保証書・鑑定書が効きます。逆に、切れたチェーンや片方だけのピアスは地金として量られるので、付属品を探す必要はありません。壊れた品物の扱いは{" "}
          <Link href="/column/broken-jewelry" className="underline underline-offset-2">
            壊れていても、金の単価は下がりません
          </Link>
          にまとめています。
        </p>
      </section>

      {/* ---- 6. まとめて出す ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          まとめて出すのは、気前よくしてもらうためではありません
        </h2>
        {smallLot.length > 0 ? (
          <>
            <p className="mb-3 text-base leading-relaxed">
              少量でも受け付ける社がほとんどです。それでもまとめたほうがいいのは、
              <strong>引かれる額が品物ごと・1回ごとに決まっている社があるため</strong>
              です。金額が小さいほど、同じ手数料が重くのしかかります。
            </p>
            <div className="mb-3 overflow-hidden rounded-xl border border-border">
              <table className="w-full table-fixed text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-left">
                    <th className="px-3 py-2 font-medium">社</th>
                    <th className="px-3 py-2 text-right font-medium">
                      {yen(SMALL_LOT_YEN)}円のときに引かれる額
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {smallLot.map((s) => (
                    <tr key={s.name} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{yen(s.amount)}円</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-base leading-relaxed">
              同じ額でも、{yen(SMALL_LOT_YEN)}円から引かれるのと{yen(SMALL_LOT_YEN * 10)}
              円から引かれるのとでは、手取りに対する重さが10倍違います。何回かに分けるより、1回にまとめたほうが引かれる回数も減ります。社ごとの条件は{" "}
              <Link href="/column/fees" className="underline underline-offset-2">
                金買取の手数料は、どこでいくら引かれるのか
              </Link>
              に集めています。
            </p>
          </>
        ) : (
          <p className="text-base leading-relaxed">
            いま確認できている範囲では、品物ごと・1回ごとに引かれる社はありません。社ごとの条件は{" "}
            <Link href="/column/fees" className="underline underline-offset-2">
              金買取の手数料は、どこでいくら引かれるのか
            </Link>
            にまとめています。
          </p>
        )}
      </section>

      {/* ---- 7. 手順 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">やることは、この順番です</h2>
        <ol className="mb-3 list-decimal space-y-2 rounded-xl border border-border bg-surface p-4 pl-9 text-sm leading-relaxed">
          <li>
            <strong>刻印を読む。</strong>
            純度が分からないと、どの表を見ればいいかも決まりません。読み方は{" "}
            <Link href="/column/hallmark" className="underline underline-offset-2">
              金の刻印はどこにある？
            </Link>
            に。
          </li>
          <li>
            <strong>その純度で、今日の各社の金額を見る。</strong>
            <Link href="/compare" className="underline underline-offset-2">
              買取価格の比較
            </Link>
            に並べています。持っていく前に、幅が分かります。
          </li>
          <li>
            <strong>引かれるものを引いた額で比べる。</strong>
            表示単価が1位の店が、手取りでも1位とはかぎりません。
            <Link href="/simulator" className="underline underline-offset-2">
              シミュレーター
            </Link>
            が重さを入れて計算します。
          </li>
          <li>
            <strong>2社以上に実際に見せる。</strong>
            公表価格は品物を見る前の参考値で、現物を見てからの金額は別です。査定だけで断れる店がほとんどです。
          </li>
          <li>
            <strong>磨かない。急がない。</strong>
            単価は重さと純度で決まります。手を加えても上がりません。
          </li>
        </ol>
        <p className="text-base leading-relaxed">
          出張や宅配で売る場合、断れる期間が売り方によって違います。
          <Link href="/column/visit-purchase" className="underline underline-offset-2">
            出張買取の8日間
          </Link>
          を先に読んでおいてください。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          店による差と、1位の入れ替わりは、当サイトが毎日取得している各社の公表価格から、このページを作るたびに計算しています。
          {EXAMPLE_GRAMS}gという重さと{yen(SMALL_LOT_YEN)}
          円という金額は、桁を見せるために置いた例で、それ以上の意味はありません。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          各社の記載は{PREP_CHECKED_AT}
          に公式サイトから引きました。要約ではなく原文のままで、出典から消えていないかは当サイトの日次の点検で毎日取り直して照合しています。公表価格は品物を見る前の参考値で、実際の査定額は状態や店の基準によります。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
