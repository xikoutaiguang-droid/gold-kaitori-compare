import type { Metadata } from "next";
import Link from "next/link";
import { measureNationwide } from "@/lib/nationwide";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import MethodTabs from "@/components/MethodTabs";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";

const PATH = "/column/nationwide";

// 見出しの数字も測った結果から作る。店舗数は各社の公表値で増減するので、
// 「2店舗」「1,980店舗」のような数字を文章に埋め込まない。
export function generateMetadata(): Metadata {
  const m = measureNationwide();
  if (!m) {
    return {
      title: "「全国対応」は、近くに店があるという意味ではない",
      description: "買取店が名乗る対応地域と、実際の店舗数を並べて確かめます。",
      alternates: { canonical: PATH },
    };
  }
  return {
    title: `「全国対応」の${m.shops.length}社を調べたら、店舗数は${fmt(m.most?.storeCount)}から${fmt(m.fewest?.storeCount)}まで開いていた`,
    description:
      `当サイトが掲載している${m.total}社のうち${m.shops.length}社が対応地域に「全国」と書いています。` +
      `ところが公表されている店舗数は${m.most?.name}の${fmt(m.most?.storeCount)}から、${m.fewest?.name}の${fmt(m.fewest?.storeCount)}まで開きがあり、` +
      `${m.undisclosed}社は店舗数そのものを公表していません。` +
      `「全国対応」が何を指しているのかを、店舗数と買取方法を並べて確かめます。`,
    alternates: { canonical: PATH },
  };
}

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "未公表";
  if (n === 0) return "0店舗";
  return `${n.toLocaleString("ja-JP")}店舗`;
}

export default function NationwidePage() {
  const m = measureNationwide();

  if (!m) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-muted">
          比べられるだけの社数がまだ揃っていないため、この記事を一時的に出していません。
        </p>
      </div>
    );
  }

  const meta = generateMetadata();
  const maxStores = Math.max(...m.shops.map((s) => s.storeCount ?? 0), 1);

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
        買取店のサイトにはたいてい「全国対応」と書いてあります。近くに店があるのだろうと読めますが、同じ言葉を使っている社の店舗数を並べると、ずいぶん違うものが同じ4文字になっていました。
      </p>

      {/* ---- 1. 幅 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">同じ「全国」で、店舗数がこれだけ違います</h2>
        <ul className="mb-3 border-y border-border divide-y divide-border/60">
          {m.shops.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
              <Link
                href={`/company/${s.id}`}
                className="w-32 shrink-0 break-keep text-sm underline underline-offset-2 hover:text-accent [overflow-wrap:anywhere]"
              >
                {s.name}
              </Link>
              <span className="flex grow items-center">
                <span
                  className={`h-2 rounded-full ${s.storeCount ? "bg-accent" : "bg-border"}`}
                  style={{ width: `${Math.max(2, Math.round(((s.storeCount ?? 0) / maxStores) * 100))}%` }}
                />
              </span>
              <span className="w-20 shrink-0 text-right text-sm tabular-nums">
                {s.storeCount === null ? <span className="text-muted">未公表</span> : fmt(s.storeCount)}
              </span>
              <span className="w-full text-right text-xs text-muted sm:w-28">
                {[s.storefront && "店頭", s.visit && "出張", s.shipping && "宅配"].filter(Boolean).join("・") ||
                  "確認できず"}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-muted">
          対応地域と店舗数は各社が公表しているものです。買取方法は、各社の公式サイトで記載を確認できたものだけを付けています。ここに無い方法は当サイトで確認できなかっただけで、対応していないという意味ではありません。
        </p>
      </section>

      {/* ---- 2. 何を指しているのか ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">「全国」は、買い取る範囲の話です</h2>
        <p className="mb-3 text-base leading-relaxed">
          {m.most && m.fewest && (
            <>
              いちばん多い{m.most.name}が{fmt(m.most.storeCount)}、いちばん少ない{m.fewest.name}が
              {fmt(m.fewest.storeCount)}です。
            </>
          )}
          さらに{m.undisclosed}社は店舗数そのものを公表していません。それでも全社が同じ「全国」を名乗れるのは、この言葉が
          <strong className="mx-1">どこに住んでいる人からでも買い取る</strong>
          という意味だからです。店がある範囲ではありません。
        </p>
        {m.noStore.length > 0 && (
          <p className="mb-3 text-base leading-relaxed">
            実際、{m.noStore.map((s) => s.name).join("・")}は実店舗を持たず、送って売る方法だけで全国を対象にしています。持ち込める場所は無いけれど、どこからでも売れる。これも「全国対応」です。
          </p>
        )}
        {m.small.length > 0 && (
          <p className="text-base leading-relaxed">
            紛らわしいのは、店はあるけれど数が少ない社です。
            {m.small.map((s) => `${s.name}(${fmt(s.storeCount)})`).join("、")}
            は店頭買取もしていますが、その店が自分の生活圏にある可能性は高くありません。「全国対応」と「店頭買取あり」が両方書いてあっても、近所で売れるかどうかは別に確かめる必要があります。
          </p>
        )}
      </section>

      {/* ---- 3. 読む人がすること ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">確かめ方は、売り方を先に決めることです</h2>
        <p className="mb-4 text-base leading-relaxed">
          店舗数を見比べるより、どう売るかを先に決めるほうが早く済みます。売り方ごとに対応している社は違い、引かれるものも変わります。
        </p>
        <MethodTabs current={PATH} />
        <p className="mb-3 text-base leading-relaxed">
          持ち込みたいなら、自分の地域に店がある社だけを見れば足ります。当サイトは各社の対応地域で絞り込めるようにしてあるので、
          <Link href="/nearby" className="mx-1 underline underline-offset-2 hover:text-accent">
            近くの買取店
          </Link>
          から見てください。地域ごとの一覧は
          <Link href="/compare" className="mx-1 underline underline-offset-2 hover:text-accent">
            相場比較
          </Link>
          でも切り替えられます。
        </p>
        <p className="text-base leading-relaxed">
          送って売るつもりなら、店舗数は関係がなくなります。そのかわり、返送料や少額のときに引かれるものが社ごとに違うので、そちらを見てください。宅配で引かれるものは
          <Link href="/column/mail-in-purchase" className="mx-1 underline underline-offset-2 hover:text-accent">
            宅配買取の記事
          </Link>
          に、自分の品物でいくら残るかは
          <Link href="/simulator" className="mx-1 underline underline-offset-2 hover:text-accent">
            シミュレーター
          </Link>
          にまとめています。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この数字について</h2>
        <p className="text-xs leading-relaxed text-muted">
          対応地域と店舗数は、各社が公式サイトで公表しているものを当サイトが転記したものです。店舗数は増減するため、ページを作るたびに最新の記録から数え直しています。「未公表」は、当サイトが各社のサイトで店舗数の記載を見つけられなかったという意味で、店が無いという意味ではありません。買取方法は各社の記載を確認できたものだけを付けており、確認できなかった方法は空欄にしています。どの社がどう書いているかは、各社のページから原文を確かめられます。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
