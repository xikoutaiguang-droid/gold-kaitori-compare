import type { Metadata } from "next";
import Link from "next/link";
import { getCompanies } from "@/lib/companies";
import SimulatorTabs from "@/components/SimulatorTabs";
import TrustBadges from "@/components/TrustBadges";

export const metadata: Metadata = {
  title: "金・貴金属買取シミュレーター｜重さを入力するだけで買取額を計算",
  description:
    "金・プラチナの重さ(g)と純度を入力するだけで、主要買取店ごとの概算買取額を自動計算。K24・K18など純度別の買取相場をもとに、金を売る前に相場感をつかめます。",
  alternates: { canonical: "/simulator" },
};

const faq = [
  {
    q: "計算結果はそのまま買取額になりますか？",
    a: "いいえ、あくまで概算です。実際の買取額は品物の状態・傷・純度の実測値・当日の相場変動などにより変わります。目安としてご利用ください。",
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
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">金・貴金属買取シミュレーター</h1>
      <p className="mb-6 text-base text-muted">
        重さと純度を入力すると、各社の公表価格をもとにした概算買取額(価格×重さ)を高い順に一覧表示します。
        複数の品物をまとめて計算したい場合は「複数点まとめて計算」をお使いください。
        あくまで目安であり、実際の査定額は品物の状態などにより変動します。
      </p>
      <TrustBadges
        items={[
          "入力した重さ等はサーバーに送信されず、計算はこの画面内だけで行われます",
          "会員登録・電話番号の入力なしで計算できます",
        ]}
      />
      <SimulatorTabs companies={companies} />

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
    </div>
  );
}
