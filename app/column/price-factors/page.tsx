import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "金相場はなぜ変動するのか｜国際価格・為替との関係をやさしく解説",
  description:
    "金の買取価格は日々変動します。その仕組みを、国際価格・為替レート・世界情勢との関係からやさしく解説します。投資助言ではなく、価格の見方を知るための解説です。",
  alternates: { canonical: "/column/price-factors" },
};

export default function PriceFactorsColumnPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">金相場はなぜ変動するのか</h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        「昨日と今日で買取価格が違う」ということは珍しくありません。なぜ金の価格が毎日動くのか、
        仕組みをやさしく説明します。
      </p>

      <div className="flex flex-col gap-8 text-base leading-relaxed">
        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">まず国際価格(ドル建て)が土台になる</h2>
          <p>
            金は世界共通の商品として、ドル建て・トロイオンス(約31.1g)単位で国際的に取引されています。
            この国際価格が、日本国内の買取価格を決める一番の土台になります。国際価格が上がれば、
            国内の買取価格も上がりやすくなります。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">為替レート(円安・円高)の影響</h2>
          <p>
            国際価格はドル建てなので、それを円に換算する際に為替レートが関わってきます。国際価格が
            同じでも、円安が進むと円換算での国内価格は上がりやすく、逆に円高が進むと下がりやすい
            傾向があります。ニュースで「円安」「円高」という言葉を目にしたら、金の価格にも影響しうる
            出来事だと考えてよいでしょう。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">世界情勢とも関係がある</h2>
          <p>
            金は「安全資産」と呼ばれることがあります。株式市場が不安定になったり、世界情勢に不透明感が
            強まったりすると、比較的安定した資産として金が買われやすくなり、価格が上がる傾向があります。
            反対に、世界経済が安定していると、金より値動きの大きい資産にお金が向かいやすく、金の価格は
            落ち着く傾向があります。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">最後に、買取店ごとのマージン差</h2>
          <p>
            ここまでの国際価格・為替は、どの買取店にも共通する土台です。そのうえで、各社は手数料や
            運営コストなどを踏まえて、独自の買取価格を提示しています。同じ日でも会社によって
            買取価格に差が出るのは、このマージンの違いによるものです。
          </p>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/60 p-4 text-sm leading-relaxed text-foreground/80 sm:p-5">
        当サイトは投資助言を行うものではなく、将来の価格を予測するものでもありません。過去の推移を
        確認したい場合は
        <Link href="/trend" className="mx-1 font-semibold text-accent-strong hover:underline">
          今が売り時？
        </Link>
        のページで、このサイトを見始めてからの価格推移を確認できます。
      </div>

      <p className="mt-8 text-sm">
        <Link href="/column" className="text-accent-strong hover:underline">
          ← コラム一覧に戻る
        </Link>
      </p>
    </div>
  );
}
