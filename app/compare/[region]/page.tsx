import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanies } from "@/lib/companies";
import { REGION_PAGES, getRegionPageBySlug } from "@/lib/regionPages";
import CompanyTable from "@/components/CompanyTable";

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        {config.label}の金・貴金属買取相場比較
      </h1>
      <p className="mb-6 text-base text-muted">{config.intro}</p>
      <CompanyTable companies={companies} initialRegion={config.region} />
    </div>
  );
}
