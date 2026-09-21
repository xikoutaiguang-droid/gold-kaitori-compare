import type { Metadata } from "next";
import Link from "next/link";
import { getCompaniesForIndex } from "@/lib/companyPages";
import { hasAffiliateLink } from "@/lib/outboundLink";
import CompanyLogo from "@/components/CompanyLogo";

export const metadata: Metadata = {
  title: "掲載している金・貴金属買取店の一覧",
  description:
    "当サイトが日次で価格を追っている金・貴金属買取店の一覧です。各社の買取参考価格・対応地域・店舗数・Google口コミを、会社ごとのページでまとめています。",
  alternates: { canonical: "/company" },
};

export default function CompanyIndexPage() {
  const companies = getCompaniesForIndex();
  const priced = companies.filter((c) => Object.keys(c.priceData.prices).length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        掲載している金・貴金属買取店
      </h1>
      <p className="mb-6 text-base text-muted">
        当サイトが価格を追っている{companies.length}社です。うち{priced.length}社は1gあたりの買取価格を
        公開しているため、日次で取得して比較しています。会社名を押すと、その社の価格が他社の中で
        何番目か、対応地域、口コミの評価をまとめたページに移ります。
      </p>

      <ul className="divide-y divide-border border-y border-border">
        {companies.map((c) => {
          const k24 = c.priceData.prices.k24;
          return (
            <li key={c.id}>
              <Link
                href={`/company/${c.id}`}
                className="flex items-center gap-3 py-3 hover:bg-accent-soft/30"
              >
                <CompanyLogo id={c.id} name={c.name} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{c.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {c.regions.join("・")}
                    {c.storeCount === null
                      ? ""
                      : c.storeCount === 0
                        ? "／実店舗なし"
                        : `／約${c.storeCount}店舗`}
                    {c.googleReview ? `／口コミ ${c.googleReview.avgRating.toFixed(2)}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-right text-sm tabular-nums">
                  {k24 !== undefined ? (
                    <>
                      {k24.toLocaleString("ja-JP")}
                      <span className="text-xs text-muted">円/g</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted">価格非公開</span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-xs text-muted">
        価格は各社が公表している数値をそのまま掲載しています。公表していない社は「価格非公開」と表示し、
        推定値を作ることはしていません。
        {companies.filter(hasAffiliateLink).length}社については、申し込み導線にアフィリエイトリンクを
        使用しています（該当箇所にPRと表示）。
      </p>

      <p className="mt-4 text-sm">
        <Link href="/compare" className="underline underline-offset-2">
          価格を横並びで比較する
        </Link>
      </p>
    </div>
  );
}
