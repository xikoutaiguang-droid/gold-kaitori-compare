import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import ColumnHero from "@/components/ColumnHero";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import {
  ACCEPTED_QUOTES,
  BROKEN_CHECKED_AT,
  PREMIUM_QUOTES,
  REASON_QUOTES,
  SAME_PRICE_QUOTES,
  countQuotedShops,
  measureShopGap,
  type BrokenQuote,
} from "@/lib/brokenItems";
import { PURITY_LABELS } from "@/lib/types";

const PATH = "/column/broken-jewelry";

/**
 * 引用は lib/brokenItems.ts に置いてある。本文に文字列で書くと書き換えに気づけないので、
 * あちらに集めて scripts/verify-quotes.mjs に毎日照合させる。
 *
 * 「店の違いでいくら変わるか」は毎日の価格から計算する。ここに数字を書くと、
 * 相場が動いた日から嘘になる。社数も配列の長さから出す(引用を増やしたら勝手に合う)。
 */

/** 計算の例に使う重さ。この数字自体に根拠はなく、桁を見せるためだけのもの */
const EXAMPLE_GRAMS = 5;

function Quote({ entry, highlight }: { entry: BrokenQuote; highlight?: boolean }) {
  return (
    <blockquote
      className={`mb-3 rounded-xl border p-4 text-sm leading-relaxed ${
        highlight ? "border-accent/30 bg-accent-soft/40" : "border-border bg-surface"
      }`}
    >
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
        （{BROKEN_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "壊れていても、金の単価は下がりません",
    description:
      "切れたチェーン、片方だけのピアス、石が取れた指輪。形で買取価格は下がらないと" +
      "各社が自分で書いています。その原文と、代わりに額が動く3つのところ" +
      "(店の違い・上乗せの有無・引かれるもの)を、毎日の価格から計算して並べました。",
    alternates: { canonical: PATH },
  };
}

const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");

export default function BrokenJewelryPage() {
  const meta = generateMetadata();
  const k18 = measureShopGap("k18");
  const k24 = measureShopGap("k24");
  const shops = countQuotedShops();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, meta), columnBreadcrumb(PATH, meta)]} />

      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>

      <h1 className="font-serif-jp mb-3 text-2xl font-semibold leading-snug sm:text-3xl">
        壊れていても、金の単価は下がりません
      </h1>

      <ColumnHero href={PATH} />

      <p className="mb-4 text-base leading-relaxed">
        途中で切れたチェーン、片方だけになったピアス、石が外れた指輪。引き出しに入れたまま何年も経っている、という類のものです。直してから売るべきか、そのまま持っていっていいのか。
      </p>
      <p className="mb-8 text-base leading-relaxed">
        <strong>地金として売るぶんには、形は金額に関係しません</strong>
        。これは当サイトの推測ではなく、各社が自分の公式サイトに書いていることです。
        {BROKEN_CHECKED_AT}に掲載25社のページを読んで、{shops}
        社の記載を引きました。そのうえで、では何で額が変わるのかを後半に書きます。
      </p>

      {/* ---- 1. 下がらないと書いている社 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          「同じ金額」とまで書いている店がある
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          「壊れていても買い取ります」はよく見ますが、それは受け付けるという話で、いくらになるかには触れていません。価格まで書いている社が{SAME_PRICE_QUOTES.length}
          社ありました。
        </p>
        {SAME_PRICE_QUOTES.map((q) => (
          <Quote key={q.sourceId} entry={q} highlight />
        ))}
        <p className="text-base leading-relaxed">
          片方は「壊れていないものと同じ金額」、もう片方は「形状によって買取価格が下がることもございません」。どちらも、形が値段に効かないと言い切っています。
        </p>
      </section>

      {/* ---- 2. 理由 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">なぜ形が関係ないのか</h2>
        <p className="mb-3 text-base leading-relaxed">
          理由まで書いている社もあります。買った金は、そのまま売り直すものではないからです。
        </p>
        {REASON_QUOTES.map((q) => (
          <Quote key={q.sourceId} entry={q} />
        ))}
        <p className="text-base leading-relaxed">
          溶かして材料に戻すのであれば、ネックレスの形をしているかどうかは関係がありません。見るのは
          <strong>重さと純度</strong>
          だけになります。この2つで決まるという前提は、当サイトが各社の単価を1gあたりで並べていることの根拠でもあります。
        </p>
      </section>

      {/* ---- 3. どの状態まで ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">どの状態まで受け付けると書いているか</h2>
        <p className="mb-3 text-base leading-relaxed">
          具体的にどんな状態を挙げているかは、社ごとに違います。自分の手元のものが当てはまるかを見てください。
        </p>
        {ACCEPTED_QUOTES.map((q) => (
          <Quote key={q.sourceId} entry={q} />
        ))}
        <p className="text-base leading-relaxed">
          ここに出てこない店が断るという意味ではありません。当サイトが読んだのは各社の価格表のページと公式トップで、別のページに書いてある可能性は残ります。
        </p>
      </section>

      {/* ---- 4. 額が動くところ ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          壊れているかどうかより、大きく効くこと
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          形で下がらないのなら、額は何で変わるのか。3つあります。
        </p>

        <h3 className="mb-2 mt-6 font-semibold">1. どの店に持っていくか</h3>
        {k18 ? (
          <>
            <p className="mb-3 text-base leading-relaxed">
              同じ日に、同じ{PURITY_LABELS.k18}で、掲載{k18.shops}
              社の単価を並べると、いちばん高い店が1gあたり{yen(k18.high)}円、いちばん安い店が
              {yen(k18.low)}円です。
              <strong>1gで{yen(k18.gap)}円の差</strong>があります。
              {EXAMPLE_GRAMS}gなら{yen(k18.gapAt5g)}円です。
            </p>
            {k24 && (
              <p className="mb-3 text-base leading-relaxed">
                {PURITY_LABELS.k24}でも同じで、掲載{k24.shops}社で1gあたり{yen(k24.gap)}
                円開いています。壊れているかどうかは単価を1円も動かしませんが、どの店に持っていくかはこれだけ動かします。迷う順番としては、こちらが先です。
              </p>
            )}
            <p className="mb-3 text-base leading-relaxed">
              その日の各社の単価は{" "}
              <Link href="/compare" className="underline underline-offset-2">
                買取価格の比較
              </Link>
              に並べています。
            </p>
          </>
        ) : (
          <p className="mb-3 text-base leading-relaxed">
            いまは各社の単価が揃っていないため、差の計算を表示していません。
          </p>
        )}

        <h3 className="mb-2 mt-6 font-semibold">2. 上乗せがあるかどうか</h3>
        <p className="mb-3 text-base leading-relaxed">
          ここが混ざりやすいところです。「壊れていても下がらない」と「壊れていないと上がる」は、両立します。下がるのではなく、
          <strong>上がる余地がなくなる</strong>のです。これも各社が書いています。
        </p>
        {PREMIUM_QUOTES.map((q) => (
          <Quote key={q.sourceId} entry={q} />
        ))}
        <p className="mb-3 text-base leading-relaxed">
          地金の値段に加えて、製品として売れるものには上乗せが付き、石には別に値が付く、という書き方です。壊れていれば前者は期待できませんが、石は外れていても別に見てもらえる場合があります。石が取れてどこかに行ってしまったのなら、その分が無いというだけです。
        </p>

        <h3 className="mb-2 mt-6 font-semibold">3. 重さの数え方と、引かれるもの</h3>
        <p className="text-base leading-relaxed">
          石や金属以外の部品が付いたままのとき、その重さをどう扱うかは店ごとに違います。各社の記載は{" "}
          <Link href="/column/what-a-gram-means" className="underline underline-offset-2">
            「1gいくら」は、店ごとに同じ意味ではない
          </Link>
          に集めています。単価から引かれるものがある社もあるので、そちらは{" "}
          <Link href="/column/fees" className="underline underline-offset-2">
            金買取の手数料は、どこでいくら引かれるのか
          </Link>
          を見てください。少量のときほど、引かれる額の影響が大きくなります。
        </p>
      </section>

      {/* ---- 5. 直してから売るか ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">直してから売ったほうがいいのか</h2>
        <p className="mb-3 text-base leading-relaxed">
          地金として手放すつもりなら、直す意味はありません。単価は形で変わらないと各社が書いているので、修理代はそのまま減るだけになります。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          一方、ブランドのジュエリーなど「製品として売れる」見込みがあるものは、上の2番目の上乗せが付く可能性があります。この場合だけ、直す価値が出ることがあります。ただし
          <strong>上乗せが修理代を超えるかどうかは、やってみるまで分かりません</strong>
          。当サイトには修理代の相場のデータがないので、ここで金額は書けません。先に査定だけ受けて、そのうえで修理の見積りと比べるのが確実です。
        </p>
        <p className="text-base leading-relaxed">
          査定だけで断れるかは、売り方によって決まりが違います。家に来てもらう場合と送る場合の取り消しについては{" "}
          <Link href="/column/visit-purchase" className="underline underline-offset-2">
            出張買取の8日間 — 取り消せる場合と、取り消せない場合
          </Link>
          にまとめています。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          各社の記載は{BROKEN_CHECKED_AT}
          に公式サイトから引きました。掲載25社の価格表のページと公式トップを機械的に読み、「壊れ」「変形」「歪」「切れ」「片方」「欠け」を含む文を拾ったうえで、金・プラチナの買取についてはっきり書いてある文だけを載せています。要約ではなく原文のままです。引用した文が出典から消えていないかは、当サイトの日次の点検で毎日取り直して照合しています。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          単価の差は毎日取得している各社の公表値から、このページを作るたびに計算しています。
          {EXAMPLE_GRAMS}
          gという重さは、差の桁を見せるために置いた例で、それ以上の意味はありません。実際の査定は店の基準によります。各社の案内は書き換えられることがあるので、最後は持ち込む先に直接お確かめください。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
