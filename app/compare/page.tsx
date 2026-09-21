import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCompanies } from "@/lib/companies";
import CompanyTable from "@/components/CompanyTable";
import { REGION_PAGES } from "@/lib/regionPages";
import { getCompaniesForIndex } from "@/lib/companyPages";

export const metadata: Metadata = {
  title: "金・貴金属買取相場比較｜純度・地域別に主要買取店の価格を一覧比較",
  description:
    "おたからや・買取大吉・ジュエルカフェなど主要な金・貴金属買取店の1gあたり買取参考価格を、純度(K24〜K9)と対応地域で絞り込んで比較できます。毎日更新の相場一覧です。",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  const companies = getCompanies();
  const byCompany = getCompaniesForIndex();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
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
