import type { Metadata } from "next";
import Link from "next/link";
import { getCompanies } from "@/lib/companies";
import CompanyTable from "@/components/CompanyTable";
import { REGION_PAGES } from "@/lib/regionPages";

export const metadata: Metadata = {
  title: "金・貴金属買取相場比較｜純度・地域別に主要買取店の価格を一覧比較",
  description:
    "おたからや・買取大吉・ジュエルカフェなど主要な金・貴金属買取店の1gあたり買取参考価格を、純度(K24〜K9)と対応地域で絞り込んで比較できます。毎日更新の相場一覧です。",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  const companies = getCompanies();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">買取相場比較</h1>
      <p className="mb-6 text-base text-muted">
        各社が公式サイトで公表している1gあたりの買取参考価格を、純度・対応地域で絞り込んで比較できます。
      </p>
      <CompanyTable companies={companies} />

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">地域から探す</h2>
        <div className="flex flex-wrap gap-2">
          {REGION_PAGES.map((r) => (
            <Link
              key={r.slug}
              href={`/compare/${r.slug}`}
              className="rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground/80 transition hover:border-accent/40 hover:bg-accent-soft"
            >
              {r.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
