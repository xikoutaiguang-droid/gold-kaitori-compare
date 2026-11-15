import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CompanyTable from "@/components/CompanyTable";
import JsonLd from "@/components/JsonLd";
import PriceFreshness from "@/components/PriceFreshness";
import PurityLinks from "@/components/PurityLinks";
import RelatedColumns from "@/components/RelatedColumns";
import { contextForPurity } from "@/lib/relatedColumns";
import { getCompanies, formatPriceDay } from "@/lib/companies";
import { breadcrumbJsonLd } from "@/lib/structuredData";
import { PURITY_PAGES, getPurityPageBySlug, measurePurity } from "@/lib/purityPages";
import { measureCompanyKarat } from "@/lib/karat";
import { PURITY_FINENESS } from "@/lib/units";
import { GOLD_PURITIES } from "@/lib/types";

export function generateStaticParams() {
  return PURITY_PAGES.map((p) => ({ purity: p.slug }));
}

const yen = (n: number) => n.toLocaleString("ja-JP");
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

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

  // K24以外の金だけ。K24そのものと比べても意味がなく、プラチナと銀は基準が別
  const karatRows =
    config.purity !== "k24" && GOLD_PURITIES.includes(config.purity) ? measureCompanyKarat(config.purity) : [];
  const showKarat = karatRows.length >= 3;
  const fineness = PURITY_FINENESS[config.purity];
  const k24Top = companies
    .filter((c) => c.priceData.prices.k24 !== undefined)
    .sort((a, b) => (b.priceData.prices.k24 ?? 0) - (a.priceData.prices.k24 ?? 0))[0];
  const k24TopRow = k24Top ? karatRows.find((r) => r.id === k24Top.id) : undefined;
  const purityTop = [...karatRows].sort((a, b) => a.rank - b.rank)[0];
  const ratioHigh = karatRows[0];
  const ratioLow = karatRows[karatRows.length - 1];

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
                    <td className="whitespace-nowrap py-2 text-right tabular-nums text-muted">
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

      {/* ---- K24に対する掛け率 ---- */}
      {showKarat && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">
            {config.label}は、K24の何%で買われているか
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">
            刻印どおりなら、{config.label}に入っている金はK24の{pct(fineness)}です。各社が公表している{config.label}の価格を、同じ社が同じ日に出しているK24の価格で割ると、
            {karatRows.length}社で{pct(ratioLow.ratio)}({ratioLow.name})から{pct(ratioHigh.ratio)}({ratioHigh.name})まで開きがあります。
          </p>
          {k24Top && purityTop && (
            <p className="mb-3 text-sm leading-relaxed text-foreground/80">
              {k24TopRow ? (
                k24TopRow.rank === 1 ? (
                  <>K24でいちばん高い{k24Top.name}は、{config.label}でも1位です。</>
                ) : (
                  <>
                    K24でいちばん高い{k24Top.name}は、{config.label}では{k24TopRow.rank}位です。
                  </>
                )
              ) : (
                <>K24でいちばん高い{k24Top.name}は、{config.label}の価格を公表していません。</>
              )}
              {purityTop.k24Rank !== 1 && (
                <>
                  {config.label}でいちばん高い{purityTop.name}は、K24では{purityTop.k24Rank}位です。
                </>
              )}
              {(!k24TopRow || k24TopRow.rank !== 1 || purityTop.k24Rank !== 1) && (
                <>
                  広告や見出しによく出るK24の価格で店を選ぶと、{config.label}では順番が入れ替わることがあります。手元の品物の刻印の価格で比べてください。
                </>
              )}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="py-2 pr-2 font-medium">社名</th>
                  <th className="py-2 pr-2 text-right font-medium">{config.label}</th>
                  <th className="py-2 pr-2 text-right font-medium">K24比</th>
                  <th className="py-2 text-right font-medium">順位(K24→{config.label})</th>
                </tr>
              </thead>
              <tbody>
                {karatRows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2 pr-2">
                      <Link href={`/company/${r.id}`} className="hover:text-accent hover:underline">
                        {r.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap py-2 pr-2 text-right tabular-nums">{yen(r.value)}円</td>
                    <td className="py-2 pr-2 text-right tabular-nums font-semibold">{pct(r.ratio)}</td>
                    <td className="whitespace-nowrap py-2 text-right tabular-nums text-muted">
                      {r.k24Rank}位→{r.rank}位
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            K24比の高い順。比は各社の1gあたりの公表価格どうしの割り算で、当サイトが日次で集めている値から毎回計算しています。順位はK24・{config.label}それぞれ、価格を公表している掲載社の中での順番です(同じ金額は同じ順位)。純度ごとの全体の傾向は
            <Link href="/column/karat-and-price" className="underline underline-offset-2 hover:text-accent">
              K18は「金75%」。では値段も75%になるのか
            </Link>
            にまとめています。
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

      <RelatedColumns context={contextForPurity(config.purity)} />

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">他の純度の価格を見る</h2>
        <PurityLinks exclude={slug} />
      </section>
    </div>
  );
}
