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
import RemoteBuyers from "@/components/RemoteBuyers";
import { remoteBuyers } from "@/lib/services";
import { PURITY_LABELS } from "@/lib/types";
import type { Purity } from "@/lib/types";
import { measureSpread, getMeasuredOn } from "@/lib/spread";
import { measureShopChoice } from "@/lib/shopChoice";

// 「金 買取 比較」で来た人に、表を眺める前に「比べると何円変わるのか」を先に渡す。
// 数字は本文に書かず、毎ビルド今日の公表値から測る(lib/spread.ts と同じ方針)。
const SPREAD_PURITIES: Purity[] = ["k24", "k18", "pt900"];
/** 換算に使う重さ。指輪・ネックレス1点くらいの目安 */
const EXAMPLE_GRAMS = 10;

function yen(n: number): string {
  return n.toLocaleString("ja-JP");
}

function jaDate(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${m}月${d}日`;
}

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
    a: k18Answer(),
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

function k18Answer(): string {
  const k24 = measureSpread("k24");
  const k18 = measureSpread("k18");
  const base =
    "K24(純金)が最も高く、K18は金の含有量(75%)に近い割合まで単価が下がります。ただし掛け率は店によって違い、K24で高い店がK18でも高いとは限りません。";
  if (!k24 || !k18) return base + "正確には当ページの表で純度ごとの実際の価格を確認してください。";
  const pct = Math.round((k18.median / k24.median) * 1000) / 10;
  return `${base}今日の各社の中央値では、K24が1gあたり${yen(k24.median)}円、K18が${yen(k18.median)}円で、K18はK24の${pct}%でした(当サイトが毎日記録している公表価格から計算)。`;
}

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

      <SpreadSummary />

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

      {/* 表の下。表の中には挟まない(順位の間に広告が入ると、何の一覧なのかが濁る)。 */}
      <RemoteBuyers
        options={remoteBuyers("k24")}
        purityLabel={PURITY_LABELS.k24}
        source="compare"
        heading="店舗へ行かずに売れる店"
        lead={
          <>
            上の表は単価の比較です。こちらは出張・宅配に対応していると公式サイトで確認できた社を、別の枠として並べています。
          </>
        }
      />

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

/**
 * 表の下に置く「比べると、いくら違うのか」。
 * 表は社ごとの値の一覧で、差の大きさは読む人が自分で引き算しないと分からない。
 */
function SpreadSummary() {
  const spreads = SPREAD_PURITIES.map((p) => measureSpread(p)).filter(
    (s): s is NonNullable<typeof s> => s !== null,
  );
  if (spreads.length === 0) return null;
  const measuredOn = getMeasuredOn();
  const k18 = spreads.find((s) => s.purity === "k18");
  const leaders = measureShopChoice("k24");

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="font-serif-jp mb-3 text-lg font-semibold">比べると、いくら違うのか</h2>
      <p className="mb-4 text-sm leading-relaxed text-foreground/80">
        上の表の{measuredOn ? `${jaDate(measuredOn)}までに各社が公表した` : "各社が公表している"}
        1gあたりの価格を、純度ごとに最高・まん中(中央値)・最安で並べました。
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="py-2 pr-2 font-medium">純度</th>
              <th className="py-2 pr-2 text-right font-medium">最高</th>
              <th className="py-2 pr-2 text-right font-medium">中央値</th>
              <th className="py-2 pr-2 text-right font-medium">最安</th>
              <th className="py-2 text-right font-medium">社数</th>
            </tr>
          </thead>
          <tbody>
            {spreads.map((s) => (
              <tr key={s.purity} className="border-b border-border/60">
                <td className="py-2 pr-2">{PURITY_LABELS[s.purity]}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{yen(s.high.price)}円</td>
                <td className="py-2 pr-2 text-right tabular-nums">{yen(s.median)}円</td>
                <td className="py-2 pr-2 text-right tabular-nums">{yen(s.low.price)}円</td>
                <td className="py-2 text-right tabular-nums">{s.count}社</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {k18 && (
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">
          たとえばK18の品が{EXAMPLE_GRAMS}gなら、中央値の店と最高値の店で約{yen(k18.upside * EXAMPLE_GRAMS)}円の差になります。最高と最安の両端の1社ずつを外しても、1gあたり{yen(k18.trimmedRange)}円、{EXAMPLE_GRAMS}gで約
          {yen(k18.trimmedRange * EXAMPLE_GRAMS)}円の開きがありました(公表されている参考価格どうしの差です。実際の査定額は品物の状態や手数料で変わります)。
        </p>
      )}
      {leaders && (
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          いちばん高い店も決まっていません。K24で1位を数えられた{leaders.days}日のうち、1位は{leaders.changes}回入れ替わり、
          {leaders.leaders.length}社が1位になりました。「前に高かった店」を覚えておくより、売る日に比べ直すほうが確かです。
        </p>
      )}
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/column/multiple-quotes" className="text-accent-strong hover:underline">
          何社に見積もりを取ればいいか →
        </Link>
        <Link href="/column/how-to-choose" className="text-accent-strong hover:underline">
          1位の入れ替わりと口コミの関係 →
        </Link>
      </p>
    </section>
  );
}
