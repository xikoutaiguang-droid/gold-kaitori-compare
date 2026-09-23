import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanies } from "@/lib/companies";
import { REGION_PAGES, getRegionPageBySlug } from "@/lib/regionPages";
import CompanyTable from "@/components/CompanyTable";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/structuredData";
import RegionLinks from "@/components/RegionLinks";
import Link from "next/link";
import { getCompaniesForIndex } from "@/lib/companyPages";

export function generateStaticParams() {
  return REGION_PAGES.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region: slug } = await params;
  const config = getRegionPageBySlug(slug);
  if (!config) return {};

  return {
    title: `${config.label}の金・貴金属買取相場比較｜対応買取店一覧`,
    description: `${config.label}エリアに対応する金・貴金属買取店の1gあたり買取参考価格を比較できます。${config.intro}`,
    alternates: { canonical: `/compare/${config.slug}` },
  };
}

export default async function RegionComparePage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region: slug } = await params;
  const config = getRegionPageBySlug(slug);
  if (!config) notFound();

  const companies = getCompanies();
  const inRegion = getCompaniesForIndex().filter(
    (c) => c.regions.includes(config.region) || c.regions.includes("全国"),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "買取店を比較", path: "/compare" },
          { name: `${config.label}の買取相場`, path: `/compare/${slug}` },
        ])}
      />
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        {config.label}の金・貴金属買取相場比較
      </h1>
      <p className="mb-6 text-base text-muted">{config.intro}</p>
      <CompanyTable companies={companies} initialRegion={config.region} />

      {/* この地域に対応している社の個別ページへ。地域ページから会社ページへの
          リンクが無く、会社ページ側も /compare と /company からの2本しか
          受けていなかった。読む人にとっても、地域で絞ったあとに見たいのは
          その店の中身である。 */}
      {inRegion.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">
            {config.label}に対応する買取店を1社ずつ見る
          </h2>
          <p className="mb-3 text-sm text-muted">
            その社の価格が掲載社の中で何番目か、対応地域、口コミの評価をまとめています。
          </p>
          <div className="flex flex-wrap gap-2">
            {inRegion.map((c) => (
              <Link
                key={c.id}
                href={`/company/${c.id}`}
                className="rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground/80 transition hover:border-accent/40 hover:bg-accent-soft"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">他の地域から探す</h2>
        <RegionLinks exclude={slug} />
      </section>
    </div>
  );
}
