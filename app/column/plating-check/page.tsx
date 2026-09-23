import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "メッキと金の簡単な見分け方｜磁石でできる自宅チェック",
  description:
    "引き出しの中のアクセサリーが金かメッキか分からないとき、自宅で磁石を使ってできる簡易チェック方法と、その限界(ホワイトゴールドの例外など)をやさしく解説します。",
  alternates: { canonical: "/column/plating-check" },
};

const faq = [
  {
    q: "特別な磁石が必要ですか？",
    a: "いいえ、冷蔵庫に貼るような一般的な磁石で十分です。100円ショップのものでも構いません。",
  },
  {
    q: "磁石にくっつかなければ、必ず金だと考えていいですか？",
    a: "いいえ。磁石に反応しない金属はほかにもあるため、「くっつかない=金」とは限りません。あくまで「くっついたらメッキの可能性が高い」という一方向の目安です。",
  },
  {
    q: "ホワイトゴールドはどう考えればいいですか？",
    a: "ホワイトゴールドはイエローゴールドを白く見せるためにパラジウムやニッケルなどを混ぜて作られることがあり、配合によってはわずかに磁石へ反応する場合があります。磁石チェックだけで「メッキだ」と決めつけないようにしてください。",
  },
];

export default function PlatingCheckColumnPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd("/column/plating-check", metadata), columnBreadcrumb("/column/plating-check", metadata), jsonLd]} />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">メッキと金の簡単な見分け方</h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        引き出しの奥から出てきたアクセサリー、刻印も見当たらず「金なのかメッキなのか分からない」ということはよくあります。
        買取に出す前に、自宅で手軽にできる簡易チェックの方法と、その限界をお伝えします。
      </p>

      <div className="flex flex-col gap-8 text-base leading-relaxed">
        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">磁石を近づけてみる</h2>
          <p>
            一番手軽な方法は、磁石をそっと近づけてみることです。金・プラチナ・純銀そのものは磁石にくっつかない性質を
            持っています。そのため、<strong>磁石にはっきりとくっつくものは、鉄やニッケルなどの土台に金メッキを
            施した製品である可能性が高い</strong>と考えられます。
          </p>
          <p className="mt-2">
            特別な道具は不要で、冷蔵庫に貼るような一般的な磁石があれば十分です。品物を傷つけないよう、そっと近づける
            程度で確認してください。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">ホワイトゴールドは例外に注意</h2>
          <p>
            ここで一つ気をつけたいのが<strong>ホワイトゴールド</strong>です。ホワイトゴールドは、もともと黄色い
            イエローゴールドを白く見せるために、パラジウムやニッケルなどの金属を混ぜて作られることがあります。
            配合の割合によっては、この過程で混ざった金属のせいで、本物のホワイトゴールドでもごくわずかに磁石へ
            反応することがあります。
          </p>
          <p className="mt-2">「磁石にくっついたから、これはメッキだ」とすぐに判断せず、あくまで目安の一つとして考えてください。</p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">逆のケースにも注意</h2>
          <p>
            反対に、「磁石にくっつかなかったから、これは間違いなく金だ」とも言い切れません。ステンレスなど、
            磁石に反応しない金属で作られたイミテーション・メッキ製品も存在するためです。磁石チェックは
            あくまで「くっついたら怪しい」という一方向の簡易テストであり、金であることを証明するものではありません。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">確実に知りたいときは</h2>
          <p>
            一番確実なのは、品物に刻印がないか確認することです。「K18」「750」「Pt900」のような刻印があれば、
            純度の目安になります。刻印が見当たらない、または擦れて読めない場合は、無理に自分で判断しようとせず、
            買取店の無料査定を利用するのが確実です。多くの買取店では、査定してもらうだけであれば料金はかかりません。
          </p>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/60 p-4 text-sm leading-relaxed text-foreground/80 sm:p-5">
        純度(刻印)が分かっている場合は、
        <Link href="/tools/purity-calculator" className="mx-1 font-semibold text-accent-strong hover:underline">
          純度別 純金属含有量計算ツール
        </Link>
        で、実際にどれくらいの純金属が含まれているかを計算できます。
      </div>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-4 text-lg font-semibold">よくある質問</h2>
        <dl className="flex flex-col gap-5">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-sm text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-8 text-sm">
        <Link href="/column" className="text-accent-strong hover:underline">
          ← コラム一覧に戻る
        </Link>
      </p>
    </div>
  );
}
