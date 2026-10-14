import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";
import ColumnHero from "@/components/ColumnHero";
import { INHERITANCE_CHECKED_AT, INHERITANCE_QUOTES } from "@/lib/inheritanceLaw";
import type { LawQuote } from "@/lib/taxLaw";

/**
 * 条文は lib/inheritanceLaw.ts に置いてある。
 * 以前この節は出典を持っていなかった。相続は読む人がいちばん不安な部分なので、
 * 当サイトの他の法律記事と同じく、原文を引いて日次で照合する。
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
        （e-Gov法令検索、{INHERITANCE_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

export const metadata: Metadata = {
  title: "遺品整理・生前整理で貴金属を手放すときの心構え｜査定に出す前に知っておきたいこと",
  description:
    "遺品整理や生前整理で出てきた指輪やネックレスをどうするか迷ったときに。気持ちの整理から、相続の注意点、査定に出す前の実務的なポイントまでやさしくまとめました。",
  alternates: { canonical: "/column/estate-cleanup" },
};

export default function EstateCleanupColumnPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd("/column/estate-cleanup", metadata), columnBreadcrumb("/column/estate-cleanup", metadata)]} />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        遺品整理・生前整理で貴金属を手放すときの心構え
      </h1>

      <ColumnHero href="/column/estate-cleanup" />
      <p className="mb-8 text-base leading-relaxed text-muted">
        亡くなった家族の指輪やネックレス、あるいは自分自身の生前整理で出てきたアクセサリー。「売ってもいいのだろうか」と迷う方は少なくありません。実務的な注意点とあわせて、少しでも気持ちが楽になればと思いまとめました。
      </p>

      <div className="flex flex-col gap-8 text-base leading-relaxed">
        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">手放すことは、悪いことではありません</h2>
          <p>
            思い出の品を売ることに、うしろめたさを感じる方もいらっしゃいます。ただ、引き出しの奥で眠らせたままにしておくより、必要としている誰かの手に渡ったり、次の暮らしに役立てたりすることも、故人や自分自身への一つの向き合い方だと思います。すべてを手放す必要はなく、気持ちの整理がついたものから、少しずつで構いません。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">
            相続人が複数いるなら、一人では決められません
          </h2>
          <p className="mb-3">
            気持ちの話とは別に、ここだけは条文を確かめておいたほうがいい部分です。故人の持ち物は、亡くなった時点で相続人のものになります。
          </p>
          <Quote entry={INHERITANCE_QUOTES.succession} />
          <p className="mb-3">そして、相続人が複数いる場合の持ち方はこうなっています。</p>
          <Quote entry={INHERITANCE_QUOTES.coOwned} highlight />
          <p className="mb-3">
            <strong>共有</strong>
            なので、指輪1つであっても一人の持ち物ではありません。遺産分割が済む前に誰かが売ってしまった場合の扱いも、条文に書かれています。
          </p>
          <Quote entry={INHERITANCE_QUOTES.disposedBefore} />
          <Quote entry={INHERITANCE_QUOTES.disposerExcluded} />
          <p>
            読み合わせると、<strong>売ってしまった本人の同意は要らない</strong>
            、という形になっています。つまり他の相続人だけで「売られた品物は、まだ遺産にあるものとして分ける」と決められます。売った人が受け取った代金はその人の取り分から差し引かれる、という向きに働くということです。あとから揉めない順番は、分割の話を先に済ませることです。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">刻印を確認しておく</h2>
          <p>
            「K18」「Pt900」などの刻印があれば、査定の際の目安になります。刻印が見当たらない場合の簡易チェックについては、
            <Link href="/column/plating-check" className="font-semibold text-accent-strong hover:underline">
              メッキと金の見分け方
            </Link>
            もあわせてご覧ください。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">まとめて査定に出す</h2>
          <p>
            遺品整理・生前整理では、指輪やネックレスが何点もまとまって出てくることがよくあります。1回にまとめたほうがいいのは、手間の問題だけではありません。引かれる額が品物ごと・1回ごとに決まっている社があり、何回かに分けるとその回数だけ引かれるためです。社ごとの条件と、相見積もりの取り方は{" "}
            <Link
              href="/column/multiple-quotes"
              className="font-semibold text-accent-strong hover:underline"
            >
              金買取の相見積もり
            </Link>
            にまとめています。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">税金については、事前に確認を</h2>
          <p>
            貴金属を売却して利益が出た場合の税金の考え方(譲渡所得)については、
            <Link href="/guide/tax" className="font-semibold text-accent-strong hover:underline">
              買取と税金のガイド
            </Link>
            でまとめています。なお、相続そのものにかかる相続税は、売却時の譲渡所得税とは別の制度です。相続税の申告が必要かどうかなど、相続に関する税務のご判断は、税理士や国税庁への確認をおすすめします。
          </p>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/60 p-4 text-sm leading-relaxed text-foreground/80 sm:p-5">
        急いで決める必要はありません。まずは
        <Link href="/compare" className="font-semibold text-accent-strong hover:underline">
          買取相場比較
        </Link>
        で、今の相場感だけでも確認してみてください。
      </div>

      <p className="mt-8 text-sm">
        <Link href="/column" className="text-accent-strong hover:underline">
          ← コラム一覧に戻る
        </Link>
      </p>
      <OtherColumns current="/column/estate-cleanup" />
    </div>
  );
}
