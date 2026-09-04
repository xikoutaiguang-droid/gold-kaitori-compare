import type { Metadata } from "next";
import { getPriceHistory } from "@/lib/priceHistory";
import { getFuturesOutlook, getLatestOutlookEntry, resolveOutlookHistory } from "@/lib/futuresOutlook";
import PersonalTrend from "@/components/PersonalTrend";
import FuturesOutlook from "@/components/FuturesOutlook";

export const metadata: Metadata = {
  title: "金は今が売り時？買取相場の推移で確認する",
  description:
    "金・貴金属の買取相場は日々変動します。このサイトを見始めてからの価格推移をグラフで確認しながら、売るタイミングを考えるための材料を提供します。投資助言ではありません。",
  alternates: { canonical: "/trend" },
};

const factors = [
  {
    title: "国際的な金価格(ドル建て)の動き",
    body: "金は世界共通のドル建て価格(トロイオンス単位)で取引されており、これが国内の買取価格の土台になります。",
  },
  {
    title: "為替レート(円安・円高)",
    body: "国際価格が同じでも、円安が進むと円換算の国内価格は上がりやすく、円高になると下がりやすい傾向があります。",
  },
  {
    title: "買取店ごとの手数料・マージン差",
    body: "同じ相場でも各社の買取価格には差があります。売るタイミングだけでなく、どの店に売るかも金額に影響します。",
  },
];

const faq = [
  {
    q: "グラフの価格はどこの会社の値段ですか？",
    a: "特定1社の価格ではなく、当サイトが把握している複数社の公表買取価格(K24/K18/Pt850/シルバー)を単純平均した、市場全体の目安です。",
  },
  {
    q: "「売り時」を教えてくれますか？",
    a: "いいえ。当サイトは投資助言を行うものではなく、将来の価格を予測するものでもありません。あくまで過去の推移を確認する材料として提供しています。売却の判断はご自身の状況(急ぎで現金化したいか、長期保有できるか等)に基づいて行ってください。",
  },
  {
    q: "グラフの期間が短いのはなぜですか？",
    a: `当サイトでの日次記録は${getPriceHistory().recordingStartedAt}に開始したばかりのため、データが蓄積されるにはしばらく時間がかかります。継続してアクセスいただくことで、ご自身が見始めた日からの推移が確認できるようになります。`,
  },
  {
    q: "「予想」はどうやって出しているのですか？",
    a: "当サイト独自の予想は行っていません。大阪取引所が公表している金先物(取引所で日々売買されている将来受渡の契約価格)の清算値段をそのまま引用しています。多くの市場参加者の売買によって決まる価格のため、一つの目安として参考になりますが、その通りになることを保証するものではありません。",
  },
];

export default function TrendPage() {
  const history = getPriceHistory();
  const outlook = getFuturesOutlook();
  const latestOutlook = getLatestOutlookEntry(outlook);
  const resolvedOutlook = resolveOutlookHistory(outlook);

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
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">金は今が売り時？</h1>
      <p className="mb-6 text-base text-muted">
        買取相場は日々変動します。まずはこのサイトを見始めてからの価格推移を確認してみましょう。
        ※投資助言ではありません。将来の価格を保証・予測するものではない点にご注意ください。
      </p>

      <PersonalTrend history={history} />

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-4 text-lg font-semibold">市場の先行き予想と、実際の答え合わせ</h2>
        <p className="mb-4 text-sm leading-relaxed text-muted">
          金の先物市場(大阪取引所)には、将来のある時点で受け渡す価格があらかじめ取引されています。
          この価格は市場参加者が織り込んでいる「予想」の目安になります。当サイトはその予想と、
          実際にその日が来たときの価格を記録し、答え合わせできるようにしています。
        </p>
        <FuturesOutlook latest={latestOutlook} resolved={resolvedOutlook} />
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-4 text-lg font-semibold">価格に影響する主な要因</h2>
        <div className="flex flex-col gap-5">
          {factors.map((f) => (
            <div key={f.title}>
              <p className="font-medium">{f.title}</p>
              <p className="mt-1 text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

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
    </div>
  );
}
