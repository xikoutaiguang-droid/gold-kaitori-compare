import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanies, formatFetchedAt, formatPriceDay } from "@/lib/companies";
import { serviceRecord, SERVICE_LABEL, type ServiceId } from "@/lib/services";
import { getCompanyById, getRelatedCompanies, getStandings, getMarketToday } from "@/lib/companyPages";
import { companyPriceChange } from "@/lib/companyHistory";
import { getAffiliateLinks } from "@/lib/outboundLink";
import {
  GOLD_PURITIES,
  PLATINUM_PURITIES,
  PURITY_LABELS,
  SILVER_PURITIES,
} from "@/lib/types";
import { getCampaignsForCompany } from "@/lib/campaigns";
import CampaignNotice from "@/components/CampaignNotice";
import CompanyLogo from "@/components/CompanyLogo";
import ReliabilityBadge from "@/components/ReliabilityBadge";
import PrBadge from "@/components/PrBadge";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/structuredData";
import { getRegionPageByRegion } from "@/lib/regionPages";
import MarketChange from "@/components/MarketChange";
import { getPriceHistory } from "@/lib/priceHistory";
import { feeDisclosureFor, FEE_MODEL_LABEL } from "@/lib/fees";
import RelatedColumns from "@/components/RelatedColumns";
import CompanyCta from "@/components/CompanyCta";

/** 本文に混ぜる日付。ISO表記のままだと文章の中で浮く */
function jaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[2])}月${Number(m[3])}日` : iso;
}

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
  const day = company.priceData.updatedAt ? jaDate(company.priceData.updatedAt) : null;
  const description = k24
    ? `${company.name}の金・プラチナ買取価格を、掲載中の買取店と横並びで比較できます。` +
      `${day ? `${day}時点の` : ""}K24の買取参考価格は1gあたり${k24.toLocaleString("ja-JP")}円` +
      `${s ? `(掲載${s.total}社中${s.rank}位)` : ""}。` +
      `対応地域・店舗数・買取方法・Google口コミの評価もまとめています。`
    : `${company.name}は1gあたりの買取価格を公開していないため、当サイトでは価格を掲載していません。` +
      `対応地域・店舗数・買取方法・Google口コミの評価と、価格を公開している買取店との比較へのご案内をまとめています。`;

  // 検索されている言い方に合わせる。Search Console で各社ページに付いている
  // クエリは「ネクサス 金相場」「おたからや 金相場」「コメ兵 金買取価格 今日」の形が
  // 大半で、「金相場」と「今日」が繰り返し出てくる。これまでの表題は
  // 「金・貴金属買取価格と口コミ」で、どちらの語も入っていなかった。
  // 日付・金額・順位は表題に入れない。検索結果の表題はキャッシュされるので、
  // 古い数字が検索結果に残るほうが、入れない害より大きい。数字は説明文のほうに置く
  // (説明文はページの中身から作り直されることがあり、表題より入れ替わりが早い)。
  return {
    title: {
      absolute: k24
        ? `${company.name}の金相場・買取価格は今日いくら？他社と比較`
        : `${company.name}の金買取｜対応地域・店舗数・口コミ`,
    },
    description,
    alternates: { canonical: `/company/${company.id}` },
  };
}

/**
 * 順位の印。1〜3位だけ色を付ける。
 *
 * 文字の大きさも色も全部同じだと、13行の表はただの数字の壁になる。
 * このサイトを見に来る理由は「で、この店は高いのか」なので、
 * そこだけ目に入るようにする。
 */
function RankMark({ rank, total }: { rank: number; total: number }) {
  const top = rank <= 3;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded px-1.5 py-0.5 tabular-nums sm:w-[5.5rem] ${
        top ? "bg-accent-soft font-semibold text-accent-strong" : "text-muted"
      }`}
    >
      {total}社中{rank}位
    </span>
  );
}

/**
 * 純度ごとの価格・順位・中央値との差。
 *
 * もとは4列の <table> に min-w-[420px] を付けていた。375pxの端末では
 * 入れ物が343pxしかないため、4列目の「中央値との差」が常に画面の外にあり、
 * 横スクロールしないと読めなかった。比較サイトで一番見せたい列がそれでは
 * 意味がないので、表をやめて1件ずつの行にしてある。
 *
 * 狭いときは2行(純度+価格 / 順位+差)、sm以上では1行に並ぶ。
 * 見出し行が無くても読めるよう、セルの中に「19社中3位」「中央値+418円」と
 * 単位ごと書いている。
 */
function StandingRows({
  title,
  standings,
}: {
  title: string;
  standings: ReturnType<typeof getStandings>;
}) {
  if (!standings.length) return null;
  return (
    <div className="mb-6">
      <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
      <ul className="border-y border-border divide-y divide-border/60">
        {standings.map((s) => (
          <li
            key={s.purity}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5"
          >
            <span className="w-20 shrink-0 text-sm">{PURITY_LABELS[s.purity]}</span>
            <span className="grow text-right text-base font-semibold tabular-nums">
              {s.price.toLocaleString("ja-JP")}
              <span className="ml-0.5 text-xs font-normal text-muted">円/g</span>
            </span>
            <span className="flex w-full items-center justify-end gap-2 text-xs sm:w-52 sm:shrink-0">
              <RankMark rank={s.rank} total={s.total} />
              <span
                className={`tabular-nums sm:w-28 sm:text-right ${
                  s.diff > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-muted"
                }`}
              >
                {s.diff === 0
                  ? "中央値と同じ"
                  : `中央値${s.diff > 0 ? "+" : ""}${s.diff.toLocaleString("ja-JP")}円`}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 長い注記を畳む。
 *
 * 消すのではなく畳むだけ。HTMLには残るので検索にも載るし、読みたい人は開ける。
 * 根拠を消すと「当サイトがそう言っている」だけの注意書きになってしまうが、
 * 画面では4行の灰色の文が数字より目立っていた。表に出すのは要点だけにする。
 */
function FinePrint({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details className="mt-1.5 text-xs text-muted">
      <summary className="cursor-pointer underline underline-offset-2 hover:text-accent">
        {summary}
      </summary>
      <div className="mt-1.5 leading-relaxed">{children}</div>
    </details>
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
  // ファーストビューに出す2つ。検索されているのはこの2つの純度が中心で、
  // 全部並べると「結局いくらか」が読み取りにくくなる。
  const headline = [...gold, ...platinum].filter((s) => s.purity === "k24" || s.purity === "k18");
  // 銀座屋のようにK24しか公表していない社では、下の節に出せる純度が
  // ファーストビューと同じ1件しかない。それでも「すべての純度を見る」と誘うと、
  // 降りた先に同じ行が1本あるだけになる。見るものが増えるときだけ誘う。
  const hasMoreThanHeadline = gold.length + platinum.length + silver.length > headline.length;
  const campaigns = getCampaignsForCompany(company.id);
  // この店自身の価格が1週間でどう動いたか。各社の公式サイトは今日の値しか
  // 載せないので、ある店の推移を出せるのは日次で記録しているこちら側だけ。
  const weekChange = companyPriceChange(company.id, "k24", 7);
  const links = getAffiliateLinks(company);
  const related = getRelatedCompanies(company);
  // 価格を公表していない社のページでだけ使う
  const marketToday = hasPrice ? null : getMarketToday("k24");

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      {/* 検索結果でURLの代わりに階層を出す。下のパンくずと同じ並びにすること */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "買取店を比較", path: "/compare" },
          { name: "買取店一覧", path: "/company" },
          { name: company.name, path: `/company/${company.id}` },
        ])}
      />
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
      {/* ---- 今日の価格(ファーストビュー) ---- */}
      {/* このページに来る人の検索語は「ネクサス 金相場」「コメ兵 金買取価格 今日」で、
          知りたいのは数字ひとつ。これまでは店の規模の説明が先に来ていて、
          価格は見出しと説明文のあとだった。順番を入れ替える。 */}
      {headline.length > 0 && (
        <section className="mb-5 rounded-2xl border border-accent/30 bg-accent-soft/40 p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-sm font-semibold">今日の買取価格</h2>
            {company.priceData.updatedAt && (
              <span className="text-xs text-muted">{jaDate(company.priceData.updatedAt)}時点</span>
            )}
          </div>
          <dl className="flex flex-col gap-3">
            {headline.map((s) => (
              <div key={s.purity} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <dt className="w-20 shrink-0 text-sm text-muted">{PURITY_LABELS[s.purity]}</dt>
                <dd className="text-2xl font-bold tabular-nums leading-none text-accent-strong">
                  {s.price.toLocaleString("ja-JP")}
                  <span className="ml-1 text-sm font-normal text-foreground/70">円/g</span>
                </dd>
                <dd className="text-xs text-muted">
                  掲載{s.total}社中{s.rank}位 ・{" "}
                  {s.diff === 0
                    ? "中央値と同じ"
                    : `中央値より${s.diff > 0 ? "+" : ""}${s.diff.toLocaleString("ja-JP")}円`}
                </dd>
              </div>
            ))}
          </dl>
          {hasMoreThanHeadline && (
            <p className="mt-3 text-sm">
              <a href="#prices" className="font-medium text-accent-strong hover:underline">
                すべての純度と他社との比較を見る ↓
              </a>
            </p>
          )}
        </section>
      )}

      {/* 価格のすぐ下。公式への出口はこれまでページの下だけにあった */}
      <CompanyCta company={company} source="company_top" />

      <p className="mb-6 text-base leading-relaxed">{company.trustNotes}</p>

      {campaigns.length > 0 && (
        <section className="mb-8">
          <CampaignNotice campaigns={campaigns} compact />
        </section>
      )}

      {/* ---- 価格 ---- */}
      <section id="prices" className="mb-8 scroll-mt-4">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">買取参考価格と他社との比較</h2>
        {hasPrice ? (
          <>
            <p className="mb-4 text-sm text-foreground/80">
              {company.name}が公開している1gあたりの価格を、当サイト掲載社と並べたものです。
              <span className="text-muted">
                {" "}
                順位はその純度を公開している社の中での順位、差は中央値との差額です。
              </span>
            </p>
            <StandingRows title="金" standings={gold} />
            <StandingRows title="プラチナ" standings={platinum} />
            <StandingRows title="シルバー" standings={silver} />
            {weekChange && (
              <p className="mb-3 text-sm leading-relaxed text-foreground/80">
                {/* 記録が飛ぶ日があるので「1週間前」と決め打ちにしない。
                    実際に何日前と比べたかを書く。 */}
                {company.name}のK24は、
                {weekChange.daysCompared === 7 ? "1週間前" : `${weekChange.daysCompared}日前`}（
                {jaDate(weekChange.since)}）の
                {weekChange.past.toLocaleString("ja-JP")}円/gから{" "}
                <span
                  className={`font-semibold tabular-nums ${
                    weekChange.diff > 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-foreground/80"
                  }`}
                >
                  {weekChange.diff > 0 ? "+" : ""}
                  {weekChange.diff.toLocaleString("ja-JP")}円/g
                </span>{" "}
                動きました。相場そのものの動きと、この社の値付けの両方が含まれます。
              </p>
            )}
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
              {company.priceData.updatedAt
                ? `（${jaDate(company.priceData.updatedAt)}時点）`
                : ""}
              {formatFetchedAt(company.priceData.fetchedAt) && (
                <>
                  {" / "}
                  取得 {formatFetchedAt(company.priceData.fetchedAt)}
                </>
              )}
            </p>
            <FinePrint summary="この価格はいつのものか">
              1日に複数回価格を変える店もあるため、当サイトが取得したあとに動いていることがあります。申し込む前に、上の公表価格ページで最新の金額をご確認ください。
            </FinePrint>
          </>
        ) : company.priceData.staleDays !== undefined ? (
          <p className="text-sm text-muted">
            {company.name}の価格は公表されていますが、当サイトが取得できている数値が
            {company.priceData.updatedAt}時点のもので、{company.priceData.staleDays}日が経過しています。金相場は日々動くため、今日の価格として他社と並べると{company.name}を実態より高くも低くも見せてしまいます。そのため順位を出していません。取得先の見直しができ次第、掲載を再開します。最新の価格は
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
          <>
            <p className="mb-4 text-sm text-muted">
              {company.name}は1gあたりの買取価格をウェブ上で数値公開していないため、当サイトでは価格を掲載していません。実際の金額は問い合わせや査定で確認してください。存在しない数値を推定して載せることはしていません。
            </p>
            {/* 価格が無いページを「分かりません」で終わらせない。問い合わせる前に
                今日の水準を知っておけるほうが、読む人にとって意味がある。
                この社の価格ではないことは、見出しと注記で明示する。 */}
            {marketToday && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <h3 className="mb-2 text-sm font-semibold">
                  参考: 価格を公表している{marketToday.count}社の今日の水準
                </h3>
                <dl className="grid grid-cols-[6rem_1fr] gap-y-1.5 text-sm">
                  <dt className="text-muted">いちばん高い</dt>
                  <dd className="tabular-nums">
                    {marketToday.high.toLocaleString("ja-JP")}円/g
                    <span className="ml-1 text-xs text-muted">({marketToday.highName})</span>
                  </dd>
                  <dt className="text-muted">まん中</dt>
                  <dd className="tabular-nums">{marketToday.median.toLocaleString("ja-JP")}円/g</dd>
                  <dt className="text-muted">いちばん安い</dt>
                  <dd className="tabular-nums">{marketToday.low.toLocaleString("ja-JP")}円/g</dd>
                </dl>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {PURITY_LABELS.k24}の公表買取価格です。{company.name}の価格ではありません。問い合わせる前にこの幅を知っておくと、提示された金額がどのあたりに位置するかを自分で判断できます。
                  <Link href="/compare" className="ml-1 underline underline-offset-2 hover:text-accent">
                    {marketToday.count}社の一覧を見る
                  </Link>
                </p>
              </div>
            )}
          </>
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
          {/* 地域名はその地域の一覧ページへの入口にする。この店を見ている人は
              「同じ地域の他の店」を見たいことが多く、地域ページ側も
              /compare からの1本しかリンクが無かった。 */}
          <dd className="flex flex-wrap gap-x-1 gap-y-1">
            {company.regions.map((r, i) => {
              const page = getRegionPageByRegion(r);
              return (
                <span key={r} className="inline-flex items-center">
                  {i > 0 && <span className="mr-1 text-muted">・</span>}
                  {page ? (
                    <Link
                      href={`/compare/${page.slug}`}
                      className="underline underline-offset-2 hover:text-accent"
                    >
                      {r}
                    </Link>
                  ) : (
                    <Link href="/compare" className="underline underline-offset-2 hover:text-accent">
                      {r}
                    </Link>
                  )}
                </span>
              );
            })}
          </dd>
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
            <span className="font-semibold tabular-nums">{company.trustScore} / 5</span>
            <FinePrint summary="この数字の付け方">
              店舗数・上場や資本提携の有無・運営年数などの公開情報を参考に、当サイトが付けた目安です。計算式はなく運営者の判断が入っているため、価格の順位とは性質が異なります。安全性を保証するものではありません。
            </FinePrint>
          </dd>
        </dl>
      </section>

      {/* 2回目以降に来た人に「前回見た日から相場がどう動いたか」を出す。
          この社の価格の話ではないので、文言は「掲載社の平均」としている。 */}
      {hasPrice && <MarketChange history={getPriceHistory()} />}

      {/* ---- 手数料 ---- */}
      {/* 「1gいくら」を見た人が最後に受け取る額は、ここで変わる。
          当サイトが順位を付けているのは各社が公表している単価で、
          そこから引かれるものがあると書いている社が実際にある。 */}
      {(() => {
        const fee = feeDisclosureFor(company.id);
        if (!fee) return null;
        return (
          <section className="mb-8">
            <h2 className="font-serif-jp mb-3 text-lg font-semibold">手数料の扱い</h2>
            <div
              className={`rounded-xl border p-4 ${
                fee.model === "deducted"
                  ? "border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20"
                  : "border-border bg-surface"
              }`}
            >
              <p className="text-sm font-semibold">{FEE_MODEL_LABEL[fee.model]}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">「{fee.quote}」</p>
              {fee.condition && (
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">{fee.condition}</p>
              )}
              {fee.contrast && (
                <p className="mt-2 rounded-lg border border-border bg-surface-2/60 p-2.5 text-xs leading-relaxed text-muted">
                  いっぽう同社の
                  <a
                    href={fee.contrast.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    価格ページ
                  </a>
                  には「{fee.contrast.quote}」とあります。どちらも同社の記載です。当サイトはどちらが正しいかを判断できないので、両方そのまま載せています。申し込む前に、ご自身の品物と金額で当てはまるかを確認してください。
                </p>
              )}
              <p className="mt-2 text-xs text-muted">
                {jaDate(fee.checkedAt)}に
                <a
                  href={fee.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  同社のページ
                </a>
                で確認した記載です。
              </p>
              {/* 読んだのは公表ページであって、実際の取引ではない。
                  リファスタとネクサスのように、ページによって書き方が違う社が実際にある。 */}
              <FinePrint summary="どこまで確認したか">
                {fee.checkedScope === "terms"
                  ? "価格ページに加えて、利用規約・よくある質問・宅配買取の案内まで読んでいます。"
                  : "価格ページのみ確認しています。"}
                当サイトの順位は各社が公表している単価で付けており、そこから引かれるものは含めていません。読んでいるのは各社が公表しているページで、実際の取引を確かめたものではありません。品物の種類・金額・買取方法によって別の費用がかかる場合があり、記載が後から変わることもあります。申し込む前に、ご自身の品物と金額で当てはまるかを必ずご確認ください。
              </FinePrint>
            </div>
            <p className="mt-2 text-sm">
              <Link href="/column/fees" className="font-medium text-accent-strong hover:underline">
                手数料の引かれ方を各社で比べる →
              </Link>
            </p>
          </section>
        );
      })()}

      {/* ---- 買取方法 ---- */}
      {/* 店名で検索して来る人がまず知りたいのは「家まで来るのか、送れるのか」。
          各社の公式サイトを読んで確認できたものだけを出す。
          確認できなかった方法は欄を作らない(非対応とは書かない)。 */}
      {(() => {
        const svc = serviceRecord(company.id);
        if (!svc) return null;
        const methods = (["storefront", "visit", "shipping"] as ServiceId[]).filter((m) => svc[m]);
        if (!methods.length) return null;
        return (
          <section className="mb-8">
            <h2 className="font-serif-jp mb-3 text-lg font-semibold">買取方法</h2>
            <ul className="flex flex-col gap-3">
              {methods.map((m) => {
                const ev = svc[m];
                const area = m === "visit" ? svc.visit?.area : undefined;
                return (
                  <li key={m} className="rounded-xl border border-border bg-surface p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-border px-2 py-0.5 text-sm font-medium">
                        {SERVICE_LABEL[m]}買取
                      </span>
                      {area && <span className="text-xs text-muted">対応エリア: {area}</span>}
                    </div>
                    {ev?.quote && (
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">「{ev.quote}」</p>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-muted">
              引用は
              <a
                href={svc.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                同社の公式サイト
              </a>
              の記載（{formatPriceDay(svc.checkedAt)}に確認）。
            </p>
            <FinePrint summary="ここに無い方法について">
              ここに無い方法は当サイトで確認できなかっただけで、対応していないという意味ではありません。出張の対応エリアは、公式に全国と書かれている場合のみ記載しています。
            </FinePrint>
          </section>
        );
      })()}

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
            {jaDate(company.googleReview.sampledAt)}時点でサンプリングした参考値です。
          </p>
          <FinePrint summary="対象にした店舗">
            {company.googleReview.sampledStores.join("、")}
            {company.googleReview.note ? `／${company.googleReview.note}` : ""}
          </FinePrint>
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

      <RelatedColumns context="company" />
    </div>
  );
}
