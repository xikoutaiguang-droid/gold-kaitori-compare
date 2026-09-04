import type { Metadata } from "next";
import Link from "next/link";
import TrustBadges from "@/components/TrustBadges";
import WeightUnitConverter from "@/components/WeightUnitConverter";

export const metadata: Metadata = {
  title: "g・匁・オンス換算ツール｜金・貴金属の重さ単位変換",
  description:
    "グラム(g)・匁(もんめ)・トロイオンス(oz)・キログラムを相互に変換できる無料ツール。金・プラチナ・貴金属の重さを扱うときの単位換算に。",
  alternates: { canonical: "/tools/weight-converter" },
};

const faq = [
  {
    q: "匁(もんめ)とは何ですか？",
    a: "尺貫法の質量単位で、1匁は3.75gです。日本の貴金属店・宝飾業界では今でも重さの単位としてよく使われます。",
  },
  {
    q: "オンス(oz)とは何ですか？",
    a: "金地金の国際取引で使われる「トロイオンス」という単位で、1トロイオンスは31.1034768gです。一般的なオンス(常衡オンス、約28.35g)とは値が異なるのでご注意ください。",
  },
];

export default function WeightConverterPage() {
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
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">g・匁・オンス換算ツール</h1>
      <p className="mb-6 text-base text-muted">
        グラム・匁(もんめ)・トロイオンス・キログラムを相互に変換できます。金やプラチナの重さを、
        買取店の刻印(g表記)や海外の地金相場(oz表記)などと見比べたいときにお使いください。
      </p>
      <TrustBadges
        items={["入力した数値はサーバーに送信されず、この画面内だけで計算されます", "会員登録なしで使えます"]}
      />
      <WeightUnitConverter />

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
