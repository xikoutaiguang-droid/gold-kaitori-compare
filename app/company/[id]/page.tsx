import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanies, formatFetchedAt } from "@/lib/companies";
import { getCompanyById, getRelatedCompanies, getStandings } from "@/lib/companyPages";
import { getAffiliateLinks } from "@/lib/outboundLink";
import {
  GOLD_PURITIES,
  PLATINUM_PURITIES,
  PURITY_LABELS,
  SILVER_PURITIES,
  type Purity,
} from "@/lib/types";
import { getCampaignsForCompany } from "@/lib/campaigns";
import CampaignNotice from "@/components/CampaignNotice";
import CompanyLogo from "@/components/CompanyLogo";
import ReliabilityBadge from "@/components/ReliabilityBadge";
import PrBadge from "@/components/PrBadge";

export function generateStaticParams() {
  return getCompanies().map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const company = getCompanyById(id);
  if (!company) return {};

  const k24 = company.priceData.prices.k24;
  const standings = getStandings(company, ["k24"]);
  const s = standings[0];

  // 価格を公開していない社のページには価格表が無い。それなのに説明文で
  // 「比較できます」と書くと、検索結果の文言と中身が食い違うので分ける。
  const description = k24
    ? `${company.name}の金・プラチナ買取価格を、掲載中の買取店と横並びで比較できます。` +
      `K24の買取参考価格は1gあたり${k24.toLocaleString("ja-JP")}円${s ? `(掲載${s.total}社中${s.rank}位)` : ""}。` +
      `対応地域・店舗数・Google口コミの評価もまとめています。`
    : `${company.name}は1gあたりの買取価格を公開していないため、当サイトでは価格を掲載していません。` +
      `対応地域・店舗数・Google口コミの評価と、価格を公開している買取店との比較へのご案内をまとめています。`;

  return {
    title: k24
      ? `${company.name}の金・貴金属買取価格と口コミ｜他社との比較`
      : `${company.name}の金・貴金属買取｜対応地域と口コミ`,
    description,
    alternates: { canonical: `/company/${company.id}` },
  };
}

function StandingTable({
  title,
  standings,
}: {
  title: string;
  standings: ReturnType<typeof getStandings>;
}) {
  if (!standings.length) return null;
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="py-2 pr-3 font-medium">純度</th>
              <th className="py-2 pr-3 text-right font-medium">買取参考価格</th>
              <th className="py-2 pr-3 text-right font-medium">掲載社中の順位</th>
              <th className="py-2 text-right font-medium">中央値との差</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => (
              <tr key={s.purity} className="border-b border-border/60">
                <td className="py-2 pr-3">{PURITY_LABELS[s.purity]}</td>
                <td className="py-2 pr-3 text-right tabular-nums">
                  {s.price.toLocaleString("ja-JP")}円/g
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-muted">
                  {s.total}社中 {s.rank}位
                </td>
                <td
                  className={`py-2 text-right tabular-nums ${
                    s.diff > 0 ? "text-emerald-700 dark:text-emerald-400" : s.diff < 0 ? "text-muted" : "text-muted"
                  }`}
                >
                  {s.diff > 0 ? "+" : ""}
                  {s.diff.toLocaleString("ja-JP")}円
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = getCompanyById(id);
  if (!company) notFound();

  const gold = getStandings(company, GOLD_PURITIES);
  const platinum = getStandings(company, PLATINUM_PURITIES);
  const silver = getStandings(company, SILVER_PURITIES);
  const hasPrice = gold.length + platinum.length + silver.length > 0;
  const campaigns = getCampaignsForCompany(company.id);
  const links = getAffiliateLinks(company);
  const related = getRelatedCompanies(company);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <nav className="mb-4 text-xs text-muted">
        <Link href="/compare" className="underline underline-offset-2">
          買取店を比較
        </Link>
        <span className="mx-1">›</span>
        <Link href="/company" className="underline underline-offset-2">
          買取店一覧
        </Link>
        <span className="mx-1">›</span>
        <span>{company.name}</span>
      </nav>

      <div className="mb-3 flex items-center gap-3">
        <CompanyLogo id={company.id} name={company.name} size={44} />
        <h1 className="font-serif-jp text-xl font-semibold sm:text-2xl">
          {company.name}の金・貴金属買取
        </h1>
      </div>
      <p className="mb-6 text-base text-muted">{company.trustNotes}</p>

      {campaigns.length > 0 && (
        <section className="mb-8">
          <CampaignNotice campaigns={campaigns} />
        </section>
      )}

      {/* ---- 価格 ---- */}
      <section className="mb-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">買取参考価格と他社との比較</h2>
        {hasPrice ? (
          <>
            <p className="mb-4 text-sm text-muted">
              {company.name}が公開している1gあたりの買取参考価格を、当サイト掲載社と横並びにしたものです。
              順位はその純度を公開している社の中での順位、差は中央値との差額です。
            </p>
            <StandingTable title="金" standings={gold} />
            <StandingTable title="プラチナ" standings={platinum} />
            <StandingTable title="シルバー" standings={silver} />
            <p className="text-xs text-muted">
              出典:{" "}
              <a
                href={company.priceSourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline underline-offset-2"
              >
                {company.name}の公表価格ページ
              </a>
              {company.priceData.updatedAt ? `（${company.priceData.updatedAt} 時点）` : ""}
              {formatFetchedAt(company.priceData.fetchedAt) && (
                <>
                  {" / "}
                  当サイトの取得: {formatFetchedAt(company.priceData.fetchedAt)}（日本時間）。
                  1日に複数回価格を変える店もあるため、取得後に動いていることがあります。
                </>
              )}
            </p>
          </>
        ) : company.priceData.staleDays !== undefined ? (
          <p className="text-sm text-muted">
            {company.name}の価格は公表されていますが、当サイトが取得できている数値が
            {company.priceData.updatedAt}時点のもので、{company.priceData.staleDays}日が経過しています。
            金相場は日々動くため、今日の価格として他社と並べると{company.name}を実態より高くも低くも
            見せてしまいます。そのため順位を出していません。取得先の見直しができ次第、掲載を再開します。
            最新の価格は
            <a
              href={company.priceSourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mx-1 underline underline-offset-2"
            >
              {company.name}の公式サイト
            </a>
            でご確認ください。
          </p>
        ) : (
          <p className="text-sm text-muted">
            {company.name}は1gあたりの買取価格をウェブ上で数値公開していないため、当サイトでは価格を掲載していません。
            実際の金額は問い合わせや査定で確認してください。存在しない数値を推定して載せることはしていません。
          </p>
        )}
        {company.priceCaveat && (
          // 要点は開かなくても読めるようにし、根拠は畳んでおく。
          // 300字の続き文を価格表の下に置いても読まれないが、根拠を消すと
          // 「当サイトがそう言っている」だけの注意書きになってしまう。
          <div className="mt-3 rounded border border-border bg-accent-soft/40 p-3 text-xs text-muted">
            <p className="font-medium text-foreground/80">{company.priceCaveat}</p>
            {company.priceCaveatDetail && (
              <details className="mt-2">
                <summary className="cursor-pointer underline underline-offset-2">
                  各社の公表文で確認する
                </summary>
                <p className="mt-2 leading-relaxed">{company.priceCaveatDetail}</p>
              </details>
            )}
          </div>
        )}
      </section>

      {/* ---- 基本情報 ---- */}
      <section className="mb-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">対応地域と規模</h2>
        <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
          <dt className="text-muted">対応地域</dt>
          <dd>{company.regions.join("・")}</dd>
          <dt className="text-muted">店舗数</dt>
          <dd>
            {company.storeCount === null
              ? "公表されていません"
              : company.storeCount === 0
                ? "実店舗なし（宅配買取など非対面のみ）"
                : `約${company.storeCount}店舗`}
          </dd>
          <dt className="text-muted">信頼度の目安</dt>
          <dd>
            {company.trustScore} / 5
            <span className="ml-2 text-xs text-muted">
              店舗数・上場や資本提携の有無・運営年数などの公開情報を参考に、当サイトが付けた目安です。
              計算式はなく運営者の判断が入っているため、価格の順位とは性質が異なります。
              安全性を保証するものではありません。
            </span>
          </dd>
        </dl>
      </section>

      {/* ---- 口コミ ---- */}
      {company.googleReview && (
        <section className="mb-8">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">Google口コミ（サンプリング）</h2>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold tabular-nums">
              {company.googleReview.avgRating.toFixed(2)}
            </span>
            <span className="text-sm text-muted">
              {company.googleReview.totalReviewCount.toLocaleString("ja-JP")}件（
              {company.googleReview.sampleSize}店舗ぶん）
            </span>
            <ReliabilityBadge googleReview={company.googleReview} />
          </div>
          <p className="text-xs text-muted">
            全店舗の集計ではなく、代表的な{company.googleReview.sampleSize}店舗を
            {company.googleReview.sampledAt}時点でサンプリングした参考値です。
            対象店舗: {company.googleReview.sampledStores.join("、")}
            {company.googleReview.note ? `／${company.googleReview.note}` : ""}
          </p>
        </section>
      )}

      {/* ---- 申し込み導線 ---- */}
      <section className="mb-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">{company.name}に査定を申し込む</h2>
        {links.length > 0 ? (
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center justify-between gap-2 rounded border border-border px-4 py-3 text-sm hover:border-accent"
                >
                  <span>{l.label}</span>
                  <PrBadge />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <a
            href={company.officialUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-block rounded border border-border px-4 py-3 text-sm hover:border-accent"
          >
            {company.name}の公式サイトで見る
          </a>
        )}
      </section>

      {/* ---- 内部リンク。孤立ページにしないため ---- */}
      <section>
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">同じ地域に対応している買取店</h2>
        <ul className="flex flex-wrap gap-2">
          {related.map((c) => (
            <li key={c.id}>
              <Link
                href={`/company/${c.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:border-accent"
              >
                <CompanyLogo id={c.id} name={c.name} size={20} />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/compare" className="underline underline-offset-2">
            掲載している買取店をまとめて比較する
          </Link>
        </p>
      </section>
    </div>
  );
}
