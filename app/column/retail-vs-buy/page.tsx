import type { Metadata } from "next";
import Link from "next/link";
import { measureRetailVsBuy, type MetalSpread } from "@/lib/retailVsBuy";
import { getCompanies } from "@/lib/companies";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";
import ColumnHero from "@/components/ColumnHero";

const PATH = "/column/retail-vs-buy";

// 見出しの数字も測った結果から作る。相場が動けば差額も割合も変わるので、
// 「550円」「2倍」のような数字を文章に埋め込まない。
export function generateMetadata(): Metadata {
  const m = measureRetailVsBuy();
  if (!m) {
    return {
      title: "「金は23,584円」なのに、売ると23,034円なのはなぜか",
      description: "買うときの値段と売るときの値段の差を、同じ日の公表値から読み解きます。",
      alternates: { canonical: PATH },
    };
  }
  const gold = m.metals.find((x) => x.key === "gold");
  const ratio = Math.round((m.widest.gapPct / m.narrowest.gapPct) * 10) / 10;
  return {
    title: gold
      ? `金は${yen(gold.retail)}円なのに、売ると${yen(gold.purchase)}円なのはなぜか`
      : "買う値段と売る値段は、なぜ違うのか",
    description:
      `${m.source}が同じ日に公表している店頭小売価格と店頭買取価格の差を、金・プラチナ・銀で比べました。` +
      `差額は1gあたりほぼ同じでも、割合は${m.narrowest.label}の${m.narrowest.gapPct}%に対して` +
      `${m.widest.label}は${m.widest.gapPct}%と${ratio}倍あります。` +
      `売るときに受け取れる額が相場より低くなる理由をまとめています。`,
    alternates: { canonical: PATH },
  };
}

function yen(n: number): string {
  return n.toLocaleString("ja-JP", { maximumFractionDigits: 2 });
}

function jaDate(iso: string): string {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return d ? `${Number(d[2])}月${Number(d[3])}日` : iso;
}

export default function RetailVsBuyPage() {
  const m = measureRetailVsBuy();

  if (!m) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-muted">
          小売価格と買取価格の記録がまだ取れていないため、この記事を一時的に出していません。
        </p>
      </div>
    );
  }

  const meta = generateMetadata();
  const gold = m.metals.find((x) => x.key === "gold");
  const ratio = Math.round((m.widest.gapPct / m.narrowest.gapPct) * 10) / 10;
  const maxPct = Math.max(...m.metals.map((x) => x.gapPct));

  // 差額がほぼ同じなのに割合が違う組を探す。相場が動けば成り立たなくなるので、
  // 実際に近い値のときだけ本文に出す(差が5%以内、かつ割合は1.5倍以上ちがう)。
  const nearlyEqualPair = ((): [MetalSpread, MetalSpread] | null => {
    for (let i = 0; i < m.metals.length; i++) {
      for (let j = i + 1; j < m.metals.length; j++) {
        const a = m.metals[i];
        const b = m.metals[j];
        const gapClose = Math.abs(a.gap - b.gap) / Math.max(a.gap, b.gap) <= 0.05;
        const pctFar = Math.max(a.gapPct, b.gapPct) / Math.min(a.gapPct, b.gapPct) >= 1.5;
        if (gapClose && pctFar) return a.gapPct < b.gapPct ? [a, b] : [b, a];
      }
    }
    return null;
  })();

  // 各社の買取価格が、地金の買取基準からどれだけ下にあるか。
  // 宝飾品のスクラップは地金そのものではないので、ここでも一段下がる。
  const companies = getCompanies();
  const k24 = companies
    .map((c) => c.priceData.prices.k24)
    .filter((v): v is number => typeof v === "number" && v > 0)
    .sort((a, b) => b - a);
  const topShop = k24[0];
  const refBuy = gold?.purchase;

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

      <ColumnHero href="/column/retail-vs-buy" />

      <p className="mb-8 text-base leading-relaxed">
        ニュースで「金が最高値」と言うとき、出てくるのは<strong>買うときの値段</strong>です。売るときに受け取れるのは、同じ日でもそれより低い額になります。
        {m.source}が同じ表に両方を載せているので、そのまま読んでみます。
      </p>

      {/* ---- 1. 同じ日の2つの数字 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">同じ日に、2つの値段が出ています</h2>
        <ul className="mb-3 border-y border-border divide-y divide-border/60">
          {m.metals.map((x) => (
            <li key={x.key} className="py-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="w-16 shrink-0 font-semibold">{x.label}</span>
                <span className="grow text-sm text-muted">
                  買うとき <span className="tabular-nums text-foreground">{yen(x.retail)}円</span>
                  <span className="mx-1.5">／</span>
                  売るとき <span className="tabular-nums text-foreground">{yen(x.purchase)}円</span>
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-2 grow rounded-full bg-border">
                  <span
                    className="block h-2 rounded-full bg-accent"
                    style={{ width: `${Math.round((x.gapPct / maxPct) * 100)}%` }}
                  />
                </span>
                <span className="w-32 shrink-0 text-right text-sm tabular-nums">
                  差 {yen(x.gap)}円
                  <span className="ml-1 font-semibold text-accent-strong">({x.gapPct}%)</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">
          出典:{" "}
          <a
            href={m.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline underline-offset-2"
          >
            {m.source}「貴金属価格情報」
          </a>
          （{jaDate(m.updatedAt)}公表の店頭小売価格・店頭買取価格、いずれも税込1gあたり）
        </p>
      </section>

      {/* ---- 2. 芯 ---- */}
      {/* 見出しに「円ではほぼ同じ」と書いていたが、銀の差額だけ桁がひとつ小さいので
          3金属を並べた時点で成り立たない文だった。割合の話だけを見出しにする。
          「差額は同じなのに割合が違う」は金とプラチナに限った話なので、
          実際に近い値のときだけ本文で言う。 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          同じ「差」でも、{m.narrowest.label}と{m.widest.label}では{ratio}倍ちがいます
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          差額そのものは、{m.metals.map((x) => `${x.label}が${yen(x.gap)}円`).join("、")}です。ところが、もとの値段に対する割合でみると
          <strong className="mx-1">
            {m.narrowest.label}の{m.narrowest.gapPct}%に対して{m.widest.label}は{m.widest.gapPct}%
          </strong>
          で、{ratio}倍の開きがあります。
        </p>
        {nearlyEqualPair && (
          <p className="mb-3 text-base leading-relaxed">
            分かりやすいのは{nearlyEqualPair[0].label}と{nearlyEqualPair[1].label}です。差額は{yen(nearlyEqualPair[0].gap)}円と{yen(nearlyEqualPair[1].gap)}円でほとんど変わらないのに、割合は{nearlyEqualPair[0].gapPct}%と{nearlyEqualPair[1].gapPct}%になります。同じ金額を引かれても、もとの単価が低いほうが重く効く、ということです。
          </p>
        )}
        <p className="mb-3 text-base leading-relaxed">
          1gあたりの単価が低い金属ほど、この開きは手取りに効きます。
          {m.widest.label}を売るときは、{m.narrowest.label}と同じ感覚でいると受け取る額が思ったより少なく感じられます。
        </p>
        <p className="text-base leading-relaxed">
          この差は手数料ではありません。買う人に売る値段と、売る人から買う値段を別々に決めている、というだけのことです。だから「手数料無料」の店であっても、相場の数字がそのまま受け取れるわけではありません。手数料は、さらにこの先の話になります。
        </p>
      </section>

      {/* ---- 3. 買取店はさらにもう一段下 ---- */}
      {typeof topShop === "number" && typeof refBuy === "number" && topShop < refBuy && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">買取店の価格は、ここからさらに下がります</h2>
          <p className="mb-3 text-base leading-relaxed">
            上の{yen(refBuy)}円は、地金(インゴットなど)を買い取るときの基準です。指輪やネックレスはそのままでは地金にならず、溶かして精錬する必要があるので、買取店が出す1gあたりの単価はここからもう一段下がります。
          </p>
          <div className="mb-3 rounded-xl border border-border bg-surface p-4">
            <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-sm">
              <dt className="text-muted">{m.source}が買う値段（地金基準）</dt>
              <dd className="text-right tabular-nums">{yen(refBuy)}円/g</dd>
              <dt className="text-muted">当サイト掲載社でいちばん高い値</dt>
              <dd className="text-right tabular-nums font-semibold">{yen(topShop)}円/g</dd>
              <dt className="text-muted">差</dt>
              <dd className="text-right tabular-nums">
                {yen(refBuy - topShop)}円/g
                <span className="ml-1 text-xs text-muted">
                  ({Math.round(((refBuy - topShop) / refBuy) * 1000) / 10}%)
                </span>
              </dd>
            </dl>
          </div>
          <p className="text-base leading-relaxed">
            つまり売る側から見ると、報じられる相場の数字から<strong>二段下がった額</strong>が手元に来ます。どの店がその二段目を浅く済ませているかは日によって入れ替わるので、
            <Link href="/compare" className="mx-1 underline underline-offset-2 hover:text-accent">
              相場比較
            </Link>
            に毎日の順位を出しています。
          </p>
        </section>
      )}

      {/* ---- 4. 読む人がすること ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">見るべきなのは「買取」と書かれた数字です</h2>
        <p className="mb-3 text-base leading-relaxed">
          相場表には小売と買取が並んでいることが多く、大きく出ているのは小売のほうです。売るつもりで見るときは「買取」「お売りになる場合」と書かれた側を見てください。当サイトが各社から集めているのも、すべて買取側の数字です。
        </p>
        <p className="text-base leading-relaxed">
          そのうえで、同じ「買取価格」でも店によって指しているものが違います。メダル・小判が基準で指輪は別、と書いている社もあります。
          <Link href="/column/what-a-gram-means" className="mx-1 underline underline-offset-2 hover:text-accent">
            「1gいくら」は、店ごとに同じ意味ではない
          </Link>
          と、単価から引かれるものをまとめた
          <Link href="/column/fees" className="mx-1 underline underline-offset-2 hover:text-accent">
            手数料の記事
          </Link>
          も合わせて見てください。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この数字について</h2>
        <p className="text-xs leading-relaxed text-muted">
          {m.source}が公表している店頭小売価格・店頭買取価格(いずれも税込)を、当サイトが毎日取得して記録したものです。表示しているのは{jaDate(m.updatedAt)}公表ぶんで、ページを作るたびに最新の記録から計算し直しています。同社の価格は地金(インゴット等)の売買基準であり、各社の宝飾品スクラップ買取価格とは前提が異なります。土日・祝日は更新されません(
          <Link href="/column/weekend" className="underline underline-offset-2 hover:text-accent">
            土日に金を売ると損をするのか
          </Link>
          )。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
