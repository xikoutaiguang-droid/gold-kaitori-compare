import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";

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
      <p className="mb-8 text-base leading-relaxed text-muted">
        亡くなった家族の指輪やネックレス、あるいは自分自身の生前整理で出てきたアクセサリー。
        「売ってもいいのだろうか」と迷う方は少なくありません。実務的な注意点とあわせて、
        少しでも気持ちが楽になればと思いまとめました。
      </p>

      <div className="flex flex-col gap-8 text-base leading-relaxed">
        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">手放すことは、悪いことではありません</h2>
          <p>
            思い出の品を売ることに、うしろめたさを感じる方もいらっしゃいます。ただ、引き出しの奥で
            眠らせたままにしておくより、必要としている誰かの手に渡ったり、次の暮らしに役立てたりする
            ことも、故人や自分自身への一つの向き合い方だと思います。すべてを手放す必要はなく、
            気持ちの整理がついたものから、少しずつで構いません。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">相続財産の場合は、相続人全員の合意を</h2>
          <p>
            故人の遺品を売却する場合、その品物は原則として相続財産にあたります。遺産分割協議が
            終わっていない段階で、相続人の一人が独断で売却してしまうと、後から他の相続人との
            トラブルにつながることがあります。売却前に、他の相続人にも一声かけておくと安心です。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">刻印を確認しておく</h2>
          <p>
            「K18」「Pt900」などの刻印があれば、査定の際の目安になります。刻印が見当たらない場合の
            簡易チェックについては、
            <Link href="/column/plating-check" className="mx-1 font-semibold text-accent-strong hover:underline">
              メッキと金の簡単な見分け方
            </Link>
            もあわせてご覧ください。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">まとめて査定に出す</h2>
          <p>
            遺品整理・生前整理では、指輪やネックレスが何点もまとまって出てくることがよくあります。
            1点ずつ別の店に持ち込むより、まとめて査定に出した方が手間も少なく、店によっては
            まとめて査定することで評価してもらえる場合もあります。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">税金については、事前に確認を</h2>
          <p>
            貴金属を売却して利益が出た場合の税金の考え方(譲渡所得)については、
            <Link href="/guide/tax" className="mx-1 font-semibold text-accent-strong hover:underline">
              買取と税金のガイド
            </Link>
            でまとめています。なお、相続そのものにかかる相続税は、売却時の譲渡所得税とは別の制度です。
            相続税の申告が必要かどうかなど、相続に関する税務のご判断は、税理士や国税庁への確認を
            おすすめします。
          </p>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/60 p-4 text-sm leading-relaxed text-foreground/80 sm:p-5">
        急いで決める必要はありません。まずは
        <Link href="/compare" className="mx-1 font-semibold text-accent-strong hover:underline">
          買取相場比較
        </Link>
        で、今の相場感だけでも確認してみてください。
      </div>

      <p className="mt-8 text-sm">
        <Link href="/column" className="text-accent-strong hover:underline">
          ← コラム一覧に戻る
        </Link>
      </p>
    </div>
  );
}
