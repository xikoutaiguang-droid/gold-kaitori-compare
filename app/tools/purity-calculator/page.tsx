import type { Metadata } from "next";
import Link from "next/link";
import TrustBadges from "@/components/TrustBadges";
import PurityCalculator from "@/components/PurityCalculator";

export const metadata: Metadata = {
  title: "K18・Pt900など純度別 純金属含有量計算ツール",
  description:
    "K24・K18・K10などの金の純度や、Pt1000・Pt900などプラチナの純度から、実際に含まれる純金属の重さを計算する無料ツール。買取価格とは無関係の、物理的な含有量の目安です。",
  alternates: { canonical: "/tools/purity-calculator" },
};

const faq = [
  {
    q: "この計算結果は買取価格の目安になりますか？",
    a: "いいえ、これは純金属としての含有量(g)を計算するだけのツールで、価格は計算していません。買取価格の概算は買取額シミュレーターをご利用ください。",
  },
  {
    q: "K18やPt900の「品位」とは何ですか？",
    a: "合金全体のうち、純粋な金・プラチナが占める割合です。たとえばK18(18金)は75%が純金、残り25%は強度を出すための他の金属です。",
  },
];

export default function PurityCalculatorPage() {
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
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">純度別 純金属含有量計算ツール</h1>
      <p className="mb-6 text-base text-muted">
        重さと純度(K18・Pt900など)を入力すると、実際に含まれている純金属の重さを計算します。
        価格ではなく、物理的な含有量そのものを知りたいときにお使いください。
      </p>
      <TrustBadges
        items={["入力した数値はサーバーに送信されず、この画面内だけで計算されます", "会員登録なしで使えます"]}
      />
      <PurityCalculator />

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
        <Link href="/simulator" className="text-accent-strong hover:underline">
          買取額シミュレーターで概算額を計算する →
        </Link>
      </p>
    </div>
  );
}
