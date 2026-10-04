import type { Metadata } from "next";
import Link from "next/link";
import { measureShopChoice } from "@/lib/shopChoice";
import { PURITY_LABELS } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";

const PATH = "/column/how-to-choose";

// 見出しも測った結果から作る。相関も1位の入れ替わりも毎日変わるので、
// 「関係が無い」と決め打ちにせず、出た数字で言い方を変える。
export function generateMetadata(): Metadata {
  const m = measureShopChoice("k24");
  if (!m) {
    return {
      title: "口コミの星が高い店は、高く買ってくれるのか",
      description: "評価と買取額、そして「いちばん高い店」が続くかどうかを記録から確かめます。",
      alternates: { canonical: PATH },
    };
  }
  const weak = Math.abs(m.correlation) < 0.3;
  return {
    title: weak
      ? "口コミの星が高い店ほど高く買う、とは言えませんでした"
      : `口コミの星と買取額には、相関係数${m.correlation}の関係がありました`,
    description:
      `評価と買取額を同時に持っている${m.rated.length}社で測ると、相関係数は${m.correlation}でした。` +
      `いちばん評価の高い${m.ratingHigh.name}(★${m.ratingHigh.rating})の単価は${yen(m.ratingHigh.price)}円、` +
      `いちばん高い${m.priceHigh.name}は★${m.priceHigh.rating}です。` +
      `さらに${m.days}日の記録で、${PURITY_LABELS[m.purity]}の1位は${m.changes}回入れ替わっていました。`,
    alternates: { canonical: PATH },
  };
}

function yen(n: number): string {
  return n.toLocaleString("ja-JP");
}

function jaDate(iso: string): string {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return d ? `${Number(d[2])}/${Number(d[3])}` : iso;
}

export default function HowToChoosePage() {
  const m = measureShopChoice("k24");

  if (!m) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-muted">
          比べられるだけの記録がまだ足りないため、この記事を一時的に出していません。
        </p>
      </div>
    );
  }

  const meta = generateMetadata();
  const label = PURITY_LABELS[m.purity];
  const weak = Math.abs(m.correlation) < 0.3;
  const minPrice = Math.min(...m.rated.map((r) => r.price));
  const maxPrice = Math.max(...m.rated.map((r) => r.price));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, meta), columnBreadcrumb(PATH, meta)]} />

      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>

      <h1 className="font-serif-jp mb-3 text-2xl font-semibold leading-snug sm:text-3xl">
        {String(meta.title)}
      </h1>

      <p className="mb-8 text-base leading-relaxed">
        店の選び方としてよく聞くのは2つです。口コミの星が高い店にする、
        または「いちばん高く買う店」を覚えておく。
        どちらも当サイトの記録で確かめられるので、やってみました。
      </p>

      {/* ---- 1. 評価と価格 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">星の数と、払う金額</h2>
        <p className="mb-4 text-base leading-relaxed">
          評価と{label}の単価を同時に持っている{m.rated.length}社を、評価の高い順に並べます。
          棒は単価で、いちばん安い社といちばん高い社の幅で引いています。
        </p>
        <ul className="mb-4 border-y border-border divide-y divide-border/60">
          {m.rated.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
              <span className="w-14 shrink-0 text-sm tabular-nums">
                ★{r.rating.toFixed(2)}
              </span>
              <Link
                href={`/company/${r.id}`}
                className="w-28 shrink-0 break-keep text-sm underline underline-offset-2 hover:text-accent [overflow-wrap:anywhere]"
              >
                {r.name}
              </Link>
              <span className="flex grow items-center">
                <span
                  className="h-2 rounded-full bg-accent"
                  style={{
                    width: `${Math.max(3, Math.round(((r.price - minPrice) / Math.max(1, maxPrice - minPrice)) * 100))}%`,
                  }}
                />
              </span>
              <span className="w-20 shrink-0 text-right text-sm tabular-nums">{yen(r.price)}円</span>
            </li>
          ))}
        </ul>
        <p className="mb-4 text-base leading-relaxed">
          評価がいちばん高いのは{m.ratingHigh.name}の★{m.ratingHigh.rating}ですが、単価は
          {yen(m.ratingHigh.price)}円です。いちばん高く買う{m.priceHigh.name}({yen(m.priceHigh.price)}円)は
          ★{m.priceHigh.rating}で、{m.ratingHigh.name}より下にいます。
          {m.ratingLow.price > m.ratingHigh.price && (
            <>
              {" "}
              評価がいちばん低い{m.ratingLow.name}(★{m.ratingLow.rating})でさえ、単価は
              {yen(m.ratingLow.price)}円で{m.ratingHigh.name}より高い値です。
            </>
          )}
        </p>
        <div className="mb-4 rounded-xl border border-accent/30 bg-accent-soft/40 p-4">
          <p className="text-sm text-muted">評価と単価の相関係数</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-accent-strong">{m.correlation}</p>
          <p className="mt-1.5 text-sm leading-relaxed">
            {weak
              ? "0に近い値です。星の数から単価は読み取れません。"
              : "ある程度の関係が出ています。ただし社数が少ないので、これだけで決めないでください。"}
          </p>
        </div>
        <p className="text-base leading-relaxed">
          そもそも評価がほとんど差を作っていません。
          {m.rated.length}社のうち{m.ratingLow.name}を除く全社が★{m.clusterLow.toFixed(2)}〜
          {m.clusterHigh.toFixed(2)}に収まっています。
          買取店を探している人が見比べる範囲では、星の数はほぼ横並びです。
        </p>
      </section>

      {/* ---- 2. 1位は続かない ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">「いちばん高い店」は、覚えても続きません</h2>
        <p className="mb-4 text-base leading-relaxed">
          もう一つの選び方も確かめます。{m.days}日ぶんの記録で、{label}の1位が誰だったかを数えました。
          <strong className="mx-1">
            入れ替わったのは{m.changes}回、1位になった社は{m.leaders.length}社
          </strong>
          です。
        </p>
        <ul className="mb-4 flex flex-wrap gap-2">
          {m.leaders.map((l) => (
            <li key={l.id}>
              <Link
                href={`/company/${l.id}`}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-sm hover:border-accent"
              >
                {l.name}
                <span className="ml-1.5 tabular-nums text-muted">{l.days}日</span>
              </Link>
            </li>
          ))}
        </ul>
        <h3 className="mb-2 text-sm font-semibold">直近{m.recent.length}日の1位</h3>
        <ul className="mb-4 border-y border-border divide-y divide-border/60">
          {m.recent.map((d) => (
            <li key={d.date} className="flex items-baseline gap-x-3 py-2 text-sm">
              <span className="w-12 shrink-0 tabular-nums text-muted">{jaDate(d.date)}</span>
              <span className="grow">{d.name}</span>
              <span className="shrink-0 tabular-nums">{yen(d.price)}円</span>
              <span className="w-16 shrink-0 text-right text-xs text-muted">{d.field}社中</span>
            </li>
          ))}
        </ul>
        <p className="text-base leading-relaxed">
          入れ替わるのは、各社が別々の基準で毎日値を付け直しているからです。
          去年いちばん高かった店が今日もいちばんとは限らず、今日いちばんの店が明日もそうとは限りません。
          だから当サイトは「おすすめの店」を置かず、
          <Link href="/compare" className="mx-1 underline underline-offset-2 hover:text-accent">
            その日の順位
          </Link>
          を毎日作り直しています。
        </p>
      </section>

      {/* ---- 3. では何を見るか ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">では、何を見ればいいのか</h2>
        <p className="mb-3 text-base leading-relaxed">
          売る日が決まっているなら、<strong>その日の単価</strong>を見るのがいちばん確実です。
          そのうえで、単価から引かれるものがあるかを確かめてください。
          表示単価の1位と、手元に残る額の1位は入れ替わることがあります。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          <Link href="/simulator" className="underline underline-offset-2 hover:text-accent">
            シミュレーター
          </Link>
          に重さを入れると、各社の差し引きを引いたあとの金額まで出ます。
          引かれ方そのものは
          <Link href="/column/fees" className="mx-1 underline underline-offset-2 hover:text-accent">
            手数料の記事
          </Link>
          にまとめました。
        </p>
        <p className="text-base leading-relaxed">
          星の数が役に立たないという意味ではありません。
          応対や待ち時間のような、価格表に出ないことは口コミにしか出てきません。
          ただ「高く買ってくれるかどうか」は、そこには書かれていないということです。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この数字について</h2>
        <p className="text-xs leading-relaxed text-muted">
          単価は各社が公式サイトで公表している{label}の買取参考価格、評価はGoogleの口コミです。
          口コミは全店舗の集計ではなく、各社の代表的な数店舗を当サイトがサンプリングした参考値で、
          見た店舗数は各社のページに書いています。店舗数が少ない社の評価はぶれやすく、
          {m.ratingLow.name}は{m.ratingLow.reviews.toLocaleString("ja-JP")}件
          ({m.ratingLow.sampleSize}店舗ぶん)しかありません。
          相関係数は{m.rated.length}社という少ない標本で出した値なので、関係が無いことの証明ではなく、
          「この並びからは読み取れない」という意味に留めてください。
          1位の集計は、その日に{m.purity === "k24" ? "K24" : label}の価格を5社以上取れた日だけを数えています。
          どちらもページを作るたびに最新の記録から計算し直しています。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
