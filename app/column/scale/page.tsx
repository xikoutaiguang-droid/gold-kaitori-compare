import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import ColumnHero from "@/components/ColumnHero";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import { SCALE_CHECKED_AT, SCALE_QUOTES } from "@/lib/scaleLaw";
import type { LawQuote } from "@/lib/taxLaw";
import { measureSpread } from "@/lib/spread";
import { PURITY_LABELS } from "@/lib/types";

const PATH = "/column/scale";

/**
 * 条文は lib/scaleLaw.ts に置いてある。本文に文字列で書くと改正に気づけないので、
 * 引用はあちらに集めて scripts/verify-quotes.mjs に毎日照合させる。
 *
 * 「0.1gで何円か」は当日の価格から計算する。ここに数字を書くと、相場が動いた日から嘘になる。
 */

function Quote({ entry, highlight }: { entry: LawQuote; highlight?: boolean }) {
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
        （e-Gov法令検索、{SCALE_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "買取店のはかりは、信用してよいのか",
    description:
      "金は重さで金額が決まります。店のはかりが正しいかどうかは法律が決めていて、" +
      "取引に使うはかりは検定に合格したものに限られ、2年に1回の定期検査もあります。" +
      "計量法と施行令の条文で確かめ、売る人が自分の目で確かめられることもまとめました。",
    alternates: { canonical: PATH },
  };
}

const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");

export default function ScalePage() {
  const meta = generateMetadata();
  // 0.1gの差がいくらになるか。いちばん高い値ではなく、掲載社の中央値で出す
  const k24 = measureSpread("k24");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, meta), columnBreadcrumb(PATH, meta)]} />

      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>

      <h1 className="font-serif-jp mb-3 text-2xl font-semibold leading-snug sm:text-3xl">
        買取店のはかりは、信用してよいのか
      </h1>

      <ColumnHero href={PATH} />

      <p className="mb-4 text-base leading-relaxed">
        金は重さで金額が決まります。目の前のはかりが少しずれていたら、そのぶん受け取る額が変わります。
        {k24 && (
          <>
            {PURITY_LABELS.k24}の掲載{k24.count}社の中央値は1gあたり{yen(k24.median)}円なので、
            <strong>0.1gの違いで{yen(k24.median / 10)}円</strong>、1gなら{yen(k24.median)}円です。
          </>
        )}
        見ているだけでは正しいかどうか分かりません。そこは法律が決めています。
      </p>
      <p className="mb-8 text-base leading-relaxed">
        結論から書くと、<strong>買取に使うはかりは、検定に合格したものでなければなりません</strong>。さらに、使い始めたあとも定期的に検査を受けます。条文で確かめました。
      </p>

      {/* ---- 1. 検定 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          取引に使うはかりは、検定に合格したものに限られる
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          計量法は、売買のような「取引」で使う計量器を特別扱いしています。条文は長いので2つに分けて引きます。まず、どの場面の話かという部分です。
        </p>
        <Quote entry={SCALE_QUOTES.mustBeVerifiedWhat} />
        <p className="mb-3 text-base leading-relaxed">
          買取は売買なので、ここでいう取引にあたります。そして、検定に合格していないものは、
        </p>
        <Quote entry={SCALE_QUOTES.mustBeVerifiedRule} highlight />
        <p className="text-base leading-relaxed">
          使うことはもちろん、<strong>使うために持っていることも禁じられています</strong>。「お店にあるけれど量るのには使っていません」は通りません。
        </p>
      </section>

      {/* ---- 2. 証印 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">合格したはかりには、印が付いている</h2>
        <Quote entry={SCALE_QUOTES.verifiedMark} />
        <p className="text-base leading-relaxed">
          検定に通ると、はかりそのものに<strong>検定証印</strong>が付きます。つまり、合格しているかどうかは書類を見せてもらわなくても、はかりを見れば分かるということです。
        </p>
      </section>

      {/* ---- 3. 定期検査 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">買ったときに合格して終わり、ではない</h2>
        <p className="mb-3 text-base leading-relaxed">
          はかりは使っているうちに狂います。そのため、使う側に定期検査を受ける義務が課されています。
        </p>
        <Quote entry={SCALE_QUOTES.periodicCheck} />
        <p className="mb-3 text-base leading-relaxed">
          検査をするのは都道府県知事、または特定市町村の長です。店が自分で「大丈夫です」と言う形ではありません。間隔は法律が枠を決め、具体的な年数は政令に置かれています。
        </p>
        <Quote entry={SCALE_QUOTES.periodicInterval} />
        <p className="mb-3 text-base leading-relaxed">対象と年数は、このとおりです。</p>
        <Quote entry={SCALE_QUOTES.targetScales} />
        <Quote entry={SCALE_QUOTES.everyTwoYears} highlight />
        <p className="mb-3 text-base leading-relaxed">
          買取店が使うのは、台に載せて目盛りや数字を読む「非自動はかり」です。<strong>2年に1回</strong>、検査を受けることになります。
        </p>
        <Quote entry={SCALE_QUOTES.periodicMark} />
        <Quote entry={SCALE_QUOTES.periodicMarkDate} />
        <p className="text-base leading-relaxed">
          合格すると<strong>定期検査済証印</strong>が付き、そこには<strong>検査を受けた年月が表示されます</strong>。前回いつ検査を受けたかが、はかりの上に書いてあるということです。
        </p>
      </section>

      {/* ---- 4. 自分で確かめる ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">売る側が、その場で確かめられること</h2>
        <ul className="mb-3 list-disc space-y-2 rounded-xl border border-border bg-surface p-4 pl-9 text-sm leading-relaxed">
          <li>
            <strong>はかりに印が付いているか。</strong>
            検定証印と定期検査済証印は、はかりの本体に付きます。定期検査済証印には年月が入っているので、いつの検査かも読めます。
          </li>
          <li>
            <strong>量るところを見せてもらう。</strong>
            奥に持っていかれると、何をどう量ったのかが分かりません。目の前で載せてもらえるかは、店に聞いて構いません。
          </li>
          <li>
            <strong>載せる前に0になっているか。</strong>
            皿の上に何か残っていたり、0でない状態から始めたりしていないかを見ます。
          </li>
          <li>
            <strong>複数の品をまとめて載せていないか。</strong>
            純度の違うものを一緒に量ると、本来より安いほうの単価で計算されることがあります。K18とK24は分けて量ってもらいます。
          </li>
        </ul>
        <p className="text-base leading-relaxed">
          不安を煽るつもりはありません。検定も定期検査も法律の義務で、受けていない計量器を取引に使えば違法です。ここに挙げたのは、気になったときに自分で見られる、というだけのことです。
        </p>
      </section>

      {/* ---- 5. 重さ以外 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">金額が変わるのは、重さだけではありません</h2>
        <p className="mb-3 text-base leading-relaxed">
          はかりが正しくても、受け取る額は店で変わります。1gあたりの単価が社ごとに違い、そこから差し引かれるものがある社もあるためです。重さの正確さより、こちらのほうが金額への影響は大きくなります。
        </p>
        <p className="text-base leading-relaxed">
          同じ日の各社の単価は{" "}
          <Link href="/compare" className="underline underline-offset-2">
            買取価格の比較
          </Link>
          で、単価から引かれるものは{" "}
          <Link href="/column/fees" className="underline underline-offset-2">
            金買取の手数料は、どこでいくら引かれるのか
          </Link>
          にまとめています。石が付いた品物の重さの扱いは{" "}
          <Link href="/column/what-a-gram-means" className="underline underline-offset-2">
            「1gいくら」は、店ごとに同じ意味ではない
          </Link>
          で各社の記載を引いています。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          条文は e-Gov 法令検索の原文から、{SCALE_CHECKED_AT}に読んで転記しました。要約ではなく、書かれている文をそのまま引いています。引用した文が出典から消えていないかは、当サイトの日次の点検で毎日取り直して照合しています。0.1gあたりの金額は、当日の掲載社の中央値から計算して表示しています。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          当サイトは法律の専門家ではありません。ここに書いたのは「条文に何と書いてあるか」であって、特定の店の計量が適法かどうかの判断ではありません。計量器の種類によって扱いは異なり、法令は改正されることがあります。実際に疑いがある場合は、都道府県の計量検定所にご相談ください。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
