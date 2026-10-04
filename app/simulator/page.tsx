import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCompanies } from "@/lib/companies";
import SimulatorTabs from "@/components/SimulatorTabs";
import { getPriceHistory } from "@/lib/priceHistory";
import TrustBadges from "@/components/TrustBadges";
import PriceFreshness from "@/components/PriceFreshness";
import RelatedColumns from "@/components/RelatedColumns";

export const metadata: Metadata = {
  title: "金・貴金属買取シミュレーター｜重さを入力するだけで買取額を計算",
  description:
    "金・プラチナの重さ(g)と純度を入力するだけで、主要買取店ごとの概算買取額を自動計算。K24・K18など純度別の買取相場をもとに、金を売る前に相場感をつかめます。",
  alternates: { canonical: "/simulator" },
};

const faq = [
  {
    q: "計算結果はそのまま買取額になりますか？",
    a: "いいえ、あくまで概算です。実際の買取額は品物の状態・傷・純度の実測値・当日の相場変動などにより変わります。また、表示単価から分析料や送料を差し引くと公表している社があり、その場合は引いたあとの金額も一覧に出しています。金額を公表していない社は、推測せず「公表されていません」と表示しています。",
    link: { href: "/column/fees", label: "手数料の引かれ方を各社で比べる →" },
  },
  {
    // /tools/weight-converter は /tools からの1本しか入口が無かった。
    // 匁は宝飾の店先で今も使われる単位なので、重さを入れるこのページから繋ぐ。
    q: "重さが「匁(もんめ)」や「オンス」で書かれている場合は？",
    a: "このシミュレーターはグラム(g)で計算します。1匁は3.75g、金地金の国際取引で使われるトロイオンスは31.1034768gです。古い鑑定書や店頭で匁を使われた場合は、換算してから入力してください。",
    link: { href: "/tools/weight-converter", label: "g・匁・オンスを換算する →" },
  },
  {
    q: "純度(K24・K18など)がわからない場合は？",
    a: "アクセサリーの刻印(K18やPt900など)を確認するのが一番確実です。刻印が見当たらない場合は、店舗の無料査定で確認してもらうことをおすすめします。",
  },
  {
    q: "インゴットと宝飾品で買取額は変わりますか？",
    a: "同じ純度でも、インゴット(地金)は加工賃がかからない分、宝飾品より高値になることが多いです。このシミュレーターは各社が公表する1gあたりのスクラップ(宝飾品)買取価格を基準にしています。",
  },
  {
    q: "大きいインゴットを売るときの注意点はありますか？",
    a: "インゴットを個人が小さく分割することは基本的にできず、無理に加工すると刻印や鑑定書番号が失われて査定が下がる場合があります。分割せずそのまま持ち込むのが基本です。また、200万円を超える高額な取引は本人確認や税務署への書類提出が必要になるなど、税金に関わるルールもあります。",
    link: { href: "/guide/tax", label: "税金について詳しく見る →" },
  },
];

export default function SimulatorPage() {
  const companies = getCompanies();

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-4 flex justify-center">
        <Image
          src="/tools-illustration.jpg"
          alt="指輪や金の延べ棒をはかりで計量する様子のイラスト"
          width={220}
          height={220}
          className="h-auto w-40 sm:w-52"
          priority
        />
      </div>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">金・貴金属買取シミュレーター</h1>
      <p className="mb-6 text-base text-muted">
        重さと純度を入力すると、各社の公表価格をもとにした概算買取額(価格×重さ)を高い順に一覧表示します。
        単価から差し引かれるものを公表している社については、その額と、引いたあとに残る金額も出します。
        引かれる額は持ち込み方(店頭・宅配)で変わるため、切り替えて比べられます。
        複数の品物をまとめて計算したい場合は「複数点まとめて計算」をお使いください。
        あくまで目安であり、実際の査定額は品物の状態などにより変動します。
      </p>
      <TrustBadges
        items={[
          "入力した重さ等はサーバーに送信されず、計算はこの画面内だけで行われます",
          "会員登録・電話番号の入力なしで計算できます",
        ]}
      />
      <SimulatorTabs companies={companies} history={getPriceHistory()} />
      <PriceFreshness className="mt-4" />

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-4 text-lg font-semibold">よくある質問</h2>
        <dl className="flex flex-col gap-5">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-sm text-muted">
                {f.a}
                {f.link && (
                  <Link href={f.link.href} className="ml-1 font-medium text-accent-strong hover:underline">
                    {f.link.label}
                  </Link>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedColumns context="simulator" />
    </div>
  );
}
