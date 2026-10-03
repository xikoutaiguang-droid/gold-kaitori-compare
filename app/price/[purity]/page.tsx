import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CompanyTable from "@/components/CompanyTable";
import JsonLd from "@/components/JsonLd";
import PriceFreshness from "@/components/PriceFreshness";
import PurityLinks from "@/components/PurityLinks";
import { getCompanies, formatPriceDay } from "@/lib/companies";
import { breadcrumbJsonLd } from "@/lib/structuredData";
import { PURITY_PAGES, getPurityPageBySlug, measurePurity } from "@/lib/purityPages";

export function generateStaticParams() {
  return PURITY_PAGES.map((p) => ({ purity: p.slug }));
}

const yen = (n: number) => n.toLocaleString("ja-JP");

/** 概算を出す重さ。品物として現実的な範囲にとどめる */
const WEIGHTS = [1, 5, 10, 30];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ purity: string }>;
}): Promise<Metadata> {
  const { purity: slug } = await params;
  const config = getPurityPageBySlug(slug);
  if (!config) return {};

  const m = measurePurity(config.purity);
  const head = m
    ? `${formatPriceDay(m.dates[0]?.date)}時点の最高値は1gあたり${yen(m.high)}円(${m.highName})、` +
      `掲載${m.count}社の中央値は${yen(m.median)}円です。`
    : "";

  return {
    title: `${config.label}の買取価格は今日いくら？ 掲載社の1gあたり比較`,
    description:
      `${config.label}(${config.marks})の買取価格を、各社が公表している1gあたりの金額で比較します。${head}` +
      `重さを入れた概算と、どの店が何番目かまで分かります。`,
    alternates: { canonical: `/price/${config.slug}` },
  };
}

export default async function PurityPricePage({
  params,
}: {
  params: Promise<{ purity: string }>;
}) {
  const { purity: slug } = await params;
  const config = getPurityPageBySlug(slug);
  if (!config) notFound();

  const m = measurePurity(config.purity);
  const companies = getCompanies();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "買取店を比較", path: "/compare" },
          { name: `${config.label}の買取価格`, path: `/price/${slug}` },
        ])}
      />
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        {config.label}の買取価格は今日いくら？
      </h1>
      <p className="mb-6 text-base leading-relaxed text-muted">{config.intro}</p>

      {/* ---- 今日の数字 ---- */}
      {m ? (
        <section className="mb-8">
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="mb-3 text-sm text-muted">
              {config.label}の価格を公表している{m.count}社を、当サイトが集めた今日の値で並べたものです。
            </p>
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div>
                <dt className="text-xs text-muted">いちばん高い</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums text-accent-strong sm:text-xl">
                  {yen(m.high)}
                  <span className="ml-0.5 text-xs font-normal">円/g</span>
                </dd>
                <dd className="mt-0.5 break-keep text-xs text-muted [overflow-wrap:anywhere]">{m.highName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">中央値</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums sm:text-xl">
                  {yen(m.median)}
                  <span className="ml-0.5 text-xs font-normal">円/g</span>
                </dd>
                <dd className="mt-0.5 text-xs text-muted">{m.count}社の真ん中</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">いちばん安い</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums sm:text-xl">
                  {yen(m.low)}
                  <span className="ml-0.5 text-xs font-normal">円/g</span>
                </dd>
                <dd className="mt-0.5 break-keep text-xs text-muted [overflow-wrap:anywhere]">{m.lowName}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              高い店と安い店の差は1gあたり{yen(m.spread)}円です。
              {m.spread > 0 && <>10gなら{yen(m.spread * 10)}円、100gなら{yen(m.spread * 100)}円の違いになります。</>}
            </p>
          </div>
          <PriceFreshness className="mt-3" />
        </section>
      ) : (
        <p className="mb-8 text-sm text-muted">
          現在、{config.label}の価格を公表している掲載社がありません。
        </p>
      )}

      {/* ---- 重さ別の概算 ---- */}
      {m && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">重さ別のおおよその金額</h2>
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">
            いちばん高い店と中央値で計算した概算です。石やパーツが付いている品物は、その分を除いた地金の重さで計算されます。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="py-2 font-medium">重さ</th>
                  <th className="py-2 text-right font-medium">最高値で</th>
                  <th className="py-2 text-right font-medium">中央値で</th>
                  <th className="py-2 text-right font-medium">差</th>
                </tr>
              </thead>
              <tbody>
                {WEIGHTS.map((w) => (
                  <tr key={w} className="border-b border-border/60">
                    <td className="py-2">{w}g</td>
                    <td className="py-2 text-right tabular-nums font-semibold text-accent-strong">
                      {yen(m.high * w)}円
                    </td>
                    <td className="py-2 text-right tabular-nums">{yen(m.median * w)}円</td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {yen((m.high - m.median) * w)}円
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm">
            <Link href="/simulator" className="font-medium text-accent-strong hover:underline">
              手元の重さで計算する →
            </Link>
          </p>
        </section>
      )}

      {/* ---- 刻印と品物 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">{config.label}の刻印と、よくある品物</h2>
        <dl className="grid grid-cols-[6rem_1fr] gap-y-2 text-sm leading-relaxed">
          <dt className="text-muted">刻印の表記</dt>
          <dd>{config.marks}</dd>
          <dt className="text-muted">よくある品物</dt>
          <dd>{config.typical}</dd>
        </dl>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          刻印が見つからない、またはメッキ(GP)や金張り(GF)と見分けがつかない場合は、
          <Link href="/column/hallmark" className="underline underline-offset-2 hover:text-accent">
            刻印の見分け方
          </Link>
          と
          <Link href="/column/plating-check" className="underline underline-offset-2 hover:text-accent">
            メッキの簡易チェック
          </Link>
          を先にご覧ください。
        </p>
      </section>

      {/* ---- 各社の価格 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">各社の{config.label}買取価格</h2>
        <CompanyTable companies={companies} initialPurity={config.purity} />
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">他の純度の価格を見る</h2>
        <PurityLinks exclude={slug} />
      </section>
    </div>
  );
}
