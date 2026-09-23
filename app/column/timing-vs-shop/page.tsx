import type { Metadata } from "next";
import Link from "next/link";
import { measureTimingVsShop } from "@/lib/timingVsShop";
import { PURITY_LABELS } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";

// 見出しも測った結果で決める。どちらが大きいかは記録が伸びれば入れ替わりうるので、
// 「店のほうが効く」と決め打ちにしない。
export function generateMetadata(): Metadata {
  const m = measureTimingVsShop("k24");
  if (!m) {
    return {
      title: "売る日と売る店、どちらが金額を動かすのか",
      description:
        "同じ金でも、売る日をずらした場合と売る店を変えた場合で、1gあたりいくら変わるのかを記録から測ります。",
      alternates: { canonical: "/column/timing-vs-shop" },
    };
  }
  const shopWins = m.gapMedian > m.medianRange;
  const ratio = Math.round((Math.max(m.gapMedian, m.medianRange) / Math.min(m.gapMedian, m.medianRange)) * 10) / 10;
  return {
    title: shopWins
      ? `金を売るなら、日を選ぶより店を選ぶほうが${ratio}倍効く`
      : `金を売るなら、店を選ぶより日を選ぶほうが${ratio}倍効く`,
    description:
      `${m.panelSize}社の公表買取価格を${m.days}日間記録し、売る日をずらしたときの差と、売る店を変えたときの差を` +
      `同じ1gあたりの金額で比べました。同じ日の店による差は${m.gapMin.toLocaleString("ja-JP")}〜` +
      `${m.gapMax.toLocaleString("ja-JP")}円/g、期間中に相場が動いた幅は${m.medianRange.toLocaleString("ja-JP")}円/gでした。`,
    alternates: { canonical: "/column/timing-vs-shop" },
  };
}

const yen = (n: number) => n.toLocaleString("ja-JP");

function jaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[2])}月${Number(m[3])}日`;
}

/** 記事の数字を、実際に持ち込む重さに置き換える */
const WEIGHTS = [
  { label: "K24の地金 20g", grams: 20 },
  { label: "K24の地金 100g", grams: 100 },
];

export default function TimingVsShopPage() {
  const m = measureTimingVsShop("k24");

  if (!m) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-muted">
          比較に使える記録がまだ足りないため、この記事を一時的に出していません。
          各社の価格を毎日記録しているので、日数がたまり次第また出します。
        </p>
      </div>
    );
  }

  const shopWins = m.gapMedian > m.medianRange;
  const ratio =
    Math.round((Math.max(m.gapMedian, m.medianRange) / Math.min(m.gapMedian, m.medianRange)) * 10) / 10;
  const topLeader = m.leaders[0];
  const latestLeader = m.daily[m.daily.length - 1].leaderName;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd
        data={[
          articleJsonLd("/column/timing-vs-shop", generateMetadata()),
          columnBreadcrumb("/column/timing-vs-shop", generateMetadata()),
        ]}
      />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        {shopWins
          ? `金を売るなら、日を選ぶより店を選ぶほうが${ratio}倍効く`
          : `金を売るなら、店を選ぶより日を選ぶほうが${ratio}倍効く`}
      </h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        「もう少し上がってから売ろう」と待つ人は多いと思います。では、日をずらすと1gあたりいくら変わり、
        店を変えると1gあたりいくら変わるのか。当サイトが{m.days}日ぶん記録した{m.panelSize}社の公表価格で、
        両方を同じ単位で並べて測りました。
      </p>

      {/* ---- 測り方 ---- */}
      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">先に、測り方について</h2>
        <p className="text-sm leading-relaxed text-foreground/80">
          {jaDate(m.from)}から{jaDate(m.to)}までのうち、{m.panelNames.join("・")}の{m.panelSize}社すべての
          {PURITY_LABELS[m.purity]}の価格がそろった{m.days}日ぶんを使いました。
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          この{m.panelSize}社に絞ったのは、日によって記録できた社数が違うからです。
          その日だけ記録された安い1社が混ざると、「差が広がった」のか
          「安い社がその日だけ入っていた」のかが区別できなくなります。
          全日そろっている社だけで見れば、動いたのは価格そのものだけになります。
        </p>
      </section>

      {/* ---- 店による差 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">同じ日に、店でいくら違ったか</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          {m.days}日のあいだ、同じ日のいちばん高い店といちばん安い店の差は、最小で{yen(m.gapMin)}円/g、
          最大で{yen(m.gapMax)}円/g、まん中で{yen(m.gapMedian)}円/gでした。
          差が{yen(m.gapMin)}円/gを下回った日は、この{m.days}日のあいだ一度もありません。
        </p>
        <div className="rounded-xl border border-accent/40 bg-accent-soft/60 p-4">
          <p className="text-sm text-foreground/80">同じ日に、店を変えるだけで動く額（まん中の日）</p>
          <p className="font-serif-jp mt-1 text-2xl font-semibold tabular-nums">{yen(m.gapMedian)}円/g</p>
        </div>
      </section>

      {/* ---- 日による差 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">日をずらすと、いくら違ったか</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          同じ{m.panelSize}社の中央値を日ごとに追うと、いちばん高かったのが{jaDate(m.medianHighDate)}の
          {yen(m.medianHigh)}円/g、いちばん安かったのが{jaDate(m.medianLowDate)}の{yen(m.medianLow)}円/gでした。
          {m.days}日かけて動いた幅は{yen(m.medianRange)}円/gです。
          これは、いちばん安い日に売ってしまった場合と、いちばん高い日に売れた場合の差にあたります。
          売る前にその日が底だったか天井だったかは分かりませんから、実際にこの幅いっぱいを取ることはできません。
        </p>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-foreground/80">{m.days}日かけて相場が動いた幅（最大でも）</p>
          <p className="font-serif-jp mt-1 text-2xl font-semibold tabular-nums">{yen(m.medianRange)}円/g</p>
        </div>
      </section>

      {/* ---- 比較 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">並べるとこうなります</h2>
        <div className="mb-3 overflow-x-auto">
          <table className="w-full min-w-[20rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 font-medium">何を変えるか</th>
                <th className="py-2 text-right font-medium">動く額</th>
                <th className="py-2 text-right font-medium">いつ効くか</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2">売る店を変える</td>
                <td className="py-2 text-right tabular-nums">{yen(m.gapMedian)}円/g</td>
                <td className="py-2 text-right text-xs text-muted">毎日</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2">売る日を変える</td>
                <td className="py-2 text-right tabular-nums">{yen(m.medianRange)}円/g</td>
                <td className="py-2 text-right text-xs text-muted">{m.days}日かけて最大</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-foreground/80">
          {shopWins ? (
            <>
              店を変えたときの差のほうが、{m.days}日ぶんの相場の動きより{ratio}倍大きいという結果でした。
              しかも相場の動きは待たないと手に入りませんが、店の差はその日のうちに取れます。
            </>
          ) : (
            <>
              この{m.days}日では、相場の動いた幅のほうが店による差より{ratio}倍大きいという結果でした。
              ただし相場の動きは、底と天井が事前に分かる場合の最大値です。店の差はその日のうちに確定します。
            </>
          )}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[20rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 font-medium">重さ</th>
                <th className="py-2 text-right font-medium">店を変えると</th>
                <th className="py-2 text-right font-medium">日を変えると</th>
              </tr>
            </thead>
            <tbody>
              {WEIGHTS.map((w) => (
                <tr key={w.label} className="border-b border-border">
                  <td className="py-2">{w.label}</td>
                  <td className="py-2 text-right tabular-nums">{yen(m.gapMedian * w.grams)}円</td>
                  <td className="py-2 text-right tabular-nums">{yen(m.medianRange * w.grams)}円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- 1位は入れ替わるか ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">「いちばん高い店」は決まっているのか</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          {m.leaders.length === 1 ? (
            <>
              この{m.days}日は、{topLeader.name}が一度も譲らず1位でした。
              ただし{m.panelSize}社のうち1社が勝ち続けただけで、この先も続くとは限りません。
            </>
          ) : (
            <>
              この{m.days}日で1位に立ったのは{m.leaders.length}社、顔ぶれが入れ替わったのは{m.leaderChanges}回でした。
              内訳は{m.leaders.map((l) => `${l.name}が${l.days}日`).join("、")}です。
              {latestLeader === topLeader.name
                ? `直近の${jaDate(m.to)}時点では、通算最多の${topLeader.name}が1位です。`
                : `直近の${jaDate(m.to)}時点で1位なのは${latestLeader}で、通算最多の${topLeader.name}ではありません。`}
            </>
          )}
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          {m.leaders.length === 1
            ? "1社だけを見て決めてよいかは、もう少し記録がたまってから言えることです。"
            : "つまり「この店がいちばん高い」という覚え方は、しばらく経つと外れます。売る日に調べ直すしかありません。"}
        </p>
      </section>

      {/* ---- 社ごとの値動き ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">店ごとに、値の動かし方が違う</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          同じ{m.days}日を、社ごとに見たものです。値を動かした日数には差があります。
          毎日のように動かす店もあれば、数日おきにまとめて変える店もあります。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[24rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 font-medium">買取店</th>
                <th className="py-2 text-right font-medium">最安</th>
                <th className="py-2 text-right font-medium">最高</th>
                <th className="py-2 text-right font-medium">値幅</th>
                <th className="py-2 text-right font-medium">動かした日</th>
              </tr>
            </thead>
            <tbody>
              {m.shops.map((s) => (
                <tr key={s.name} className="border-b border-border">
                  <td className="py-2 break-keep">{s.name}</td>
                  <td className="py-2 text-right tabular-nums">{yen(s.low)}</td>
                  <td className="py-2 text-right tabular-nums">{yen(s.high)}</td>
                  <td className="py-2 text-right tabular-nums">{yen(s.range)}</td>
                  <td className="py-2 text-right text-xs tabular-nums text-muted">
                    {s.changedDays}/{s.comparedDays}日
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          単位は円/g。{PURITY_LABELS[m.purity]}の公表買取価格です。
        </p>
      </section>

      {/* ---- 結論 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">この数字をどう使うか</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          相場を読むのは難しく、当たるかどうかも分かりません。一方で、同じ日に各社がいくら出しているかは、
          調べれば分かります。{m.days}日ぶんの記録で見るかぎり、後者のほうが確実で、金額としても
          {shopWins ? "大きい" : "取りこぼしにくい"}ものでした。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          今日の各社の価格は
          <Link href="/compare" className="mx-1 underline underline-offset-2 hover:text-accent">
            相場比較
          </Link>
          に、重さを入れた概算は
          <Link href="/simulator" className="mx-1 underline underline-offset-2 hover:text-accent">
            シミュレーター
          </Link>
          にあります。なお、ここで比べているのは各社が公表している1gあたりの参考価格です。
          店頭では品物の状態や手数料で最終額が変わるため、
          <Link href="/column/what-a-gram-means" className="mx-1 underline underline-offset-2 hover:text-accent">
            「1gいくら」が店ごとに同じ意味ではない
          </Link>
          ことも合わせて見てください。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記録について</h2>
        <p className="text-xs leading-relaxed text-muted">
          各社が公式サイトで公表している買取参考価格を、当サイトが1日2回取得して記録したものです。
          日付はその社が価格を公表した日で、取得できなかった日は記録していません。
          買取店の公式サイトは自社の当日の価格しか載せないため、過去にさかのぼった比較は
          記録している側でしか作れません。数字はページを作るたびに最新の記録から計算し直しています。
        </p>
      </section>

      <OtherColumns current="/column/timing-vs-shop" />
    </div>
  );
}
