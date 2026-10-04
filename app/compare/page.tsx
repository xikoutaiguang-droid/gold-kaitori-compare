import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCompanies } from "@/lib/companies";
import CompanyTable from "@/components/CompanyTable";
import MarketClosedNotice from "@/components/MarketClosedNotice";
import RegionLinks from "@/components/RegionLinks";
import CompanyLinks from "@/components/CompanyLinks";
import { getCompaniesForIndex } from "@/lib/companyPages";
import JsonLd from "@/components/JsonLd";
import RelatedColumns from "@/components/RelatedColumns";

export const metadata: Metadata = {
  title: "金・貴金属買取相場比較｜純度・地域別に主要買取店の価格を一覧比較",
  description:
    "おたからや・買取大吉・ジュエルカフェなど主要な金・貴金属買取店の1gあたり買取参考価格を、純度(K24〜K9)と対応地域で絞り込んで比較できます。毎日更新の相場一覧です。",
  alternates: { canonical: "/compare" },
};

// 画面に出ているFAQセクションと同じ内容にする(JsonLdだけ別の文言にしない)
const faq = [
  {
    q: "K24とK18では、買取価格はどのくらい違いますか？",
    a: "K24(純金)が最も高く、K18はその純度分(約75%)だけ単価が下がります。ただし単純な掛け算にはならない店もあるため、正確には当ページの表で純度ごとの実際の価格を確認してください。",
  },
  {
    q: "なぜ店によって買取価格が違うのですか？",
    a: "国際価格や為替という共通の土台は同じでも、各社の手数料や運営コストの違いが上乗せ・差し引きされるためです。詳しくは「金相場はなぜ変動するのか」のコラムでも解説しています。",
  },
  {
    q: "価格はどのくらいの頻度で更新されますか？",
    a: "当サイトは各社の公式サイトが公表している価格を毎日自動で取得し、このページに反映しています。価格を公表していない店や、取得が一時的に止まっている店は、その旨を明記したうえで掲載しています。",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function ComparePage() {
  const companies = getCompanies();
  const byCompany = getCompaniesForIndex();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <JsonLd data={faqJsonLd} />
      <div className="mb-4 flex justify-center">
        <Image
          src="/compare-illustration.jpg"
          alt="虫眼鏡で貴金属の値上がりを見比べる様子のイラスト"
          width={220}
          height={220}
          className="h-auto w-40 sm:w-52"
          priority
        />
      </div>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">買取相場比較</h1>
      <p className="mb-6 text-base text-muted">
        各社が公式サイトで公表している1gあたりの買取参考価格を、純度・対応地域で絞り込んで比較できます。
      </p>
      <MarketClosedNotice />
      <CompanyTable companies={companies} />

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">買取店ごとに見る</h2>
        <p className="mb-3 text-sm text-muted">
          1社ずつのページでは、その社の価格が掲載社の中で何番目か、対応地域、口コミの評価をまとめています。
        </p>
        <div className="flex flex-wrap gap-2">
          {byCompany.map((c) => (
            <Link
              key={c.id}
              href={`/company/${c.id}`}
              className="rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground/80 transition hover:border-accent/40 hover:bg-accent-soft"
            >
              {c.name}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-sm">
          <Link href="/company" className="underline underline-offset-2">
            買取店の一覧を見る
          </Link>
        </p>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">地域から探す</h2>
        <RegionLinks />
      </section>

      {/* 上の比較表は店名を押すと各社の公式サイトへ出ていく(rel="nofollow sponsored")ので、
          当サイトの各社ページへはここから行けるようにする。 */}
      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">買取店から探す</h2>
        <CompanyLinks />
      </section>

      <RelatedColumns context="compare" />

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
