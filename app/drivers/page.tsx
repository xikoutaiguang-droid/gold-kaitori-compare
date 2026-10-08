import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import RelatedColumns from "@/components/RelatedColumns";
import { breadcrumbJsonLd } from "@/lib/structuredData";
import { SITE_NAME } from "@/lib/siteConfig";
import { getFuturesOutlook } from "@/lib/futuresOutlook";
import {
  getFxData,
  latestDriver,
  measureDrivers,
  totalOver,
  verdictOf,
  type DriverDay,
} from "@/lib/marketDrivers";
import DriverLog from "@/components/DriverLog";

const PATH = "/drivers";

/**
 * 値動きの理由を数字で分けて出すページ。
 *
 * 本文に数値も結論も書かない。「今日は為替で動いた」のような言い切りは、
 * その日の記録から組み立てる。ニュースを読んで良し悪しを仕分ける作りにしなかったのは、
 * 仕分けが当サイトの相場観になってしまい、外れても誰も検証できないため。
 * ここに出るのは前日と当日の2つの数字から誰でも同じ答えになる計算だけ。
 */

export function generateMetadata(): Metadata {
  return {
    title: "金の値動きは、為替のせいか金のせいか",
    description:
      "円建ての金価格は「ドル建ての金価格 × ドル円」で決まります。毎日の清算値と為替の記録から、" +
      "その日の値動きのうち為替で説明できる分と、そうでない分に分けて記録しています。" +
      "大阪取引所と欧州中央銀行の公表値から計算したもので、相場の見通しではありません。",
    alternates: { canonical: PATH },
  };
}

const yen = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n)).toLocaleString("ja-JP")}円`;

/** その日の動きを、どちらが主だったかで言い分ける */
function verdictText(day: DriverDay): string {
  switch (verdictOf(day)) {
    case "flat":
      return "この日はほとんど動いていません。";
    case "fx":
      return day.fxChange >= 0
        ? "この日の動きは、ほとんど円安で説明できます。金そのものの値段はあまり動いていません。"
        : "この日の動きは、ほとんど円高で説明できます。金そのものの値段はあまり動いていません。";
    case "rest":
      return "この日の動きは、為替ではほとんど説明できません。金そのものの値段が動いています。";
    default:
      return "この日は、為替と、為替以外の要因が両方効いています。";
  }
}

export default function DriversPage() {
  const days = measureDrivers();
  const latest = latestDriver(days);
  const total = totalOver(days, days.length);
  const fx = getFxData();
  const outlook = getFuturesOutlook();
  // source は「名前 + URL」の1文で持っている。URLだけ取り出す。
  // 取り出せなければ取引所のトップに送る(壊れたリンクを出さない)。
  const jpxUrl =
    /https?:\/\/\S+/.exec(outlook.source)?.[0] ?? "https://www.jpx.co.jp/";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: SITE_NAME, path: "/" },
          { name: "値動きの理由", path: PATH },
        ])}
      />

      <h1 className="font-serif-jp mb-3 text-xl font-semibold sm:text-2xl">
        金の値動きは、為替のせいか金のせいか
      </h1>
      <p className="mb-6 text-base leading-relaxed">
        円建ての金価格は<strong>「ドル建ての金価格 × ドル円」</strong>で決まります。だから値が上がっても、金そのものが買われたのか、円が安くなっただけなのかは、価格を見ているだけでは分かりません。毎日の記録から、その日の動きを2つに分けています。
      </p>

      {!latest ? (
        <p className="rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted">
          金価格と為替の両方が揃っている日がまだありません。記録がたまると、ここに出ます。
        </p>
      ) : (
        <>
          {/* ---- 直近の1日 ---- */}
          <section className="mb-8 rounded-2xl border border-accent/30 bg-accent-soft/40 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2 className="text-sm font-semibold">直近の1日</h2>
              <span className="text-xs text-muted">
                {latest.previousDate.replace(/^\d+-/, "").replace("-", "/")} →{" "}
                {latest.date.replace(/^\d+-/, "").replace("-", "/")}
              </span>
            </div>

            <p className="mb-1 text-3xl font-semibold tabular-nums">
              {yen(latest.changeJpy)}
              <span className="ml-1 text-base font-normal text-muted">/g</span>
            </p>
            <p className="mb-4 text-sm text-muted">
              金先物(スポット相当) {latest.goldJpy.toLocaleString("ja-JP")}円/g ・ 1ドル=
              {latest.usdJpy.toFixed(2)}円
            </p>

            <dl className="mb-3 flex flex-col gap-2 rounded-xl bg-surface p-3">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-sm">為替で説明できる分</dt>
                <dd className="text-base font-semibold tabular-nums">{yen(latest.fxPart)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-sm">
                  残り
                  <span className="ml-1 text-xs text-muted">(金そのものの値段など)</span>
                </dt>
                <dd className="text-base font-semibold tabular-nums">{yen(latest.restPart)}</dd>
              </div>
            </dl>

            <p className="text-sm leading-relaxed">{verdictText(latest)}</p>
          </section>

          {/* ---- 日々の記録 ---- */}
          <section className="mb-8">
            <h2 className="font-serif-jp mb-3 text-lg font-semibold">日々の記録</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted">
              金価格と為替の両方が記録できている日だけを並べています。どちらかが休場の日は飛ばしています。前の記録日からの差です。
            </p>
            <DriverLog days={days} />
          </section>

          {/* ---- 期間の合計 ---- */}
          {total && total.days >= 2 && (
            <section className="mb-8 rounded-2xl border border-border bg-surface p-4 sm:p-5">
              <h2 className="font-serif-jp mb-3 text-lg font-semibold">記録している期間の合計</h2>
              <p className="text-base leading-relaxed">
                {total.from.replace(/^\d+-/, "").replace("-", "/")}から
                {total.to.replace(/^\d+-/, "").replace("-", "/")}までの{total.days}日ぶんで、金価格は
                <strong className="mx-1 tabular-nums">{yen(total.changeJpy)}/g</strong>
                動きました。そのうち為替で説明できるのが
                <strong className="mx-1 tabular-nums">{yen(total.fxPart)}</strong>、残りが
                <strong className="mx-1 tabular-nums">{yen(total.restPart)}</strong>です。
              </p>
            </section>
          )}
        </>
      )}

      {/* ---- 出典と限界 ---- */}
      <section className="mb-8 rounded-2xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この数字について</h2>
        <p className="mb-3 text-xs leading-relaxed text-muted">
          計算はこの1本の式だけです。
        </p>
        <p className="mb-3 rounded-lg bg-block p-3 text-xs leading-relaxed">
          為替で説明できる分 =（前日の円建て価格 ÷ 前日のドル円）× ドル円の変化
          <br />
          残り = 円建ての変化 − 為替で説明できる分
        </p>
        <ul className="mb-3 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-muted">
          <li>
            金価格は{" "}
            <a href={jpxUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              大阪取引所の清算値段
            </a>
            （金先物・スポット相当）。業者の手数料が入らない、取引所の値です。
          </li>
          <li>
            為替は{" "}
            <a
              href={fx.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {fx.source}
            </a>
            。中央銀行の公表値で、どの業者の建値でもありません。
          </li>
          <li>
            <strong>時点はぴったり揃っていません。</strong>
            ECBの参照相場は中央ヨーロッパ時間の午後に決まり、国内の清算値が決まる時刻とはずれます。同じ日付でも、同じ瞬間の値ではありません。
          </li>
          <li>
            <strong>「残り」は金そのものの値動きだけではありません。</strong>
            ドル建ての金価格を当サイトでは取得していないため、この項目には時点のずれや、ここで扱っていない事情もまとめて入ります。
          </li>
        </ul>
        <p className="text-xs leading-relaxed text-muted">
          ここに出しているのは、起きたことの内訳です。これから上がるか下がるかを示すものではなく、当サイトは投資助言を行いません。売却の判断はご自身の事情に基づいて行ってください。金価格が何で動くのかという仕組みは{" "}
          <Link href="/column/price-factors" className="underline underline-offset-2">
            金相場はなぜ変動するのか
          </Link>
          にまとめています。
        </p>
      </section>

      <p className="mb-2 text-sm">
        <Link href="/trend" className="text-accent-strong hover:underline">
          価格の推移をグラフで見る →
        </Link>
      </p>

      <RelatedColumns context="trend" />
    </div>
  );
}
