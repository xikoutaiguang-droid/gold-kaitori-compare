import type { Metadata } from "next";
import Link from "next/link";
import {
  MANEKIYA_FEE,
  measureAgainstBenchmark,
  measureFeeImpact,
  measureReviewVsPrice,
} from "@/lib/priceMeaning";
import { getCompanyById } from "@/lib/companyPages";
import { getActiveCampaigns } from "@/lib/campaigns";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";

export function generateMetadata(): Metadata {
  const b = measureAgainstBenchmark("k24");
  const n = b ? `${b.rows.length}社` : "各社";
  return {
    title: `「1gいくら」は店ごとに同じ意味ではない`,
    description:
      `${n}が公表している1gあたりの買取価格を、各社の注意書きまで読んで突き合わせました。` +
      `後から手数料を引く店、価格に精錬費を織り込む店、そもそも別の商品を指した価格を載せている店があり、` +
      `単価を並べるだけでは比べたことになりません。引用はすべて各社の公表ページから、` +
      `順位や比率はその数字をもとに計算しています。`,
    alternates: { canonical: "/column/what-a-gram-means" },
  };
}

const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");

function jaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : iso;
}

/** 各社の公表文の引用。転記なので、どこの何をいつ写したかを必ず添える */
const QUOTES = {
  komehyo: {
    company: "コメ兵",
    url: "https://komehyo.jp/kaitori/gold/souba/",
    read: "2026-09-22",
    basis: "上記は、田中貴金属工業株式会社の公表価格等を基準に当社が算出した1gあたりの参考価格（税込）です。",
    fee: "買取に手数料は掛かりますか？ 店頭買取、宅配買取共に手数料は一切かかりません。",
  },
  otakaraya: {
    company: "おたからや",
    url: "https://www.otakaraya.jp/gold/souba/",
    read: "2026-09-22",
    scope:
      "24金（K24）の掲載価格は、ホールマーク（造幣局刻印）付きのメダルや小判など、特定の製品を基準とした参考買取価格です。アクセサリーや金工芸品など、その他の24金製品（スクラップ品）につきましては査定額が異なる場合がございます。",
    refining: "買取価格は、精錬・加工に要する費用等を差し引いた金額となります。",
  },
  manekiya: {
    company: "まねきや",
    url: "https://manekiya.com/rate",
    read: "2026-09-22",
    deduct: "下記金額が差し引かれます　手数料　今だけ無料　分析料　店頭でお問い合わせください",
    perItem: "分析料は商品1点ごとにかかります。",
  },
  goldmrs: {
    company: "ゴールドミセス",
    url: "https://goldmrs.jp/",
    read: "2026-09-21",
    ingot: 23720,
    k24: 22959,
  },
} as const;

function Quote({ children, source }: { children: React.ReactNode; source: string }) {
  return (
    <figure className="my-4 border-l-2 border-accent/50 pl-4">
      <blockquote className="text-sm leading-relaxed text-foreground/80">{children}</blockquote>
      <figcaption className="mt-1 text-xs text-muted">{source}</figcaption>
    </figure>
  );
}

export default function WhatAGramMeansPage() {
  const bench = measureAgainstBenchmark("k24");
  const feeImpact = measureFeeImpact("manekiya", "k18", [2, 5, 10]);
  const review = measureReviewVsPrice("k24");
  const campaigns = getActiveCampaigns();
  const manekiya = getCompanyById("manekiya");
  const k18 = manekiya?.priceData.prices.k18;

  if (!bench) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-muted">
          基準となる価格データが揃っていないため、この記事の内容を一時的に出していません。
        </p>
      </div>
    );
  }

  const shown = feeImpact.filter((f) => f.effectiveRank !== null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd("/column/what-a-gram-means", generateMetadata()), columnBreadcrumb("/column/what-a-gram-means", generateMetadata())]} />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        「1gいくら」は、店ごとに同じ意味ではない
      </h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        金の買取店はどこも「K24 1gあたり○○円」という数字を出しています。同じ形をしているので、
        高い順に並べれば比べたことになりそうに見えます。当サイトも、まさにそれをやっています。
        ところが各社の注意書きまで読むと、同じ「1gいくら」が指しているものが揃っていませんでした。
        以下で引用しているのは各社が自社サイトに書いていることで、順位・比率・相関は
        そこから当サイトが計算したものです。口コミの評価だけは各社の公表資料ではなく、
        当サイトがGoogleマップから集めた数字です。
      </p>

      {/* 1. 天井 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          まず、上限は{bench.rows.length}社に共通している
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          田中貴金属工業が毎日公表している店頭買取価格は、国内の貴金属取引の事実上の基準です。
          {jaDate(bench.referenceDate)}時点でK24が1gあたり{yen(bench.reference)}円。
          当サイトが価格を追っている{bench.rows.length}社をこれと並べると、
          <span className="font-semibold">{bench.aboveReference}社</span>
          がこれを上回りました。中央値は建値の{bench.medianRatio.toFixed(1)}%です。
        </p>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          これは推測ではありません。基準にしていることを、店のほうが書いています。
        </p>
        <Quote source={`${QUOTES.komehyo.company}「金・プラチナ買取相場」より（${jaDate(QUOTES.komehyo.read)}閲覧）`}>
          {QUOTES.komehyo.basis}
        </Quote>
        <div className="my-4 overflow-x-auto">
          <table className="w-full min-w-[380px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-2 pr-3 font-medium">順位</th>
                <th className="py-2 pr-3 font-medium">買取店</th>
                <th className="py-2 pr-3 text-right font-medium">K24</th>
                <th className="py-2 text-right font-medium">建値比</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border bg-accent-soft/30">
                <td className="py-2 pr-3 text-xs text-muted">基準</td>
                <td className="py-2 pr-3 font-medium">田中貴金属</td>
                <td className="py-2 pr-3 text-right tabular-nums">{yen(bench.reference)}円</td>
                <td className="py-2 text-right tabular-nums text-muted">100.0%</td>
              </tr>
              {bench.rows.map((r, i) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-muted tabular-nums">{i + 1}</td>
                  <td className="py-2 pr-3">
                    <Link href={`/company/${r.id}`} className="underline underline-offset-2">
                      {r.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums">{yen(r.price)}円</td>
                  <td className="py-2 text-right tabular-nums text-muted">{r.ratio.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          田中貴金属の価格は{" "}
          <a href={bench.referenceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
            同社の公表ページ
          </a>
          （{jaDate(bench.referenceDate)}時点）より。なお同社の建値は地金の買取基準値で、
          各社が買うのは宝飾品のスクラップが中心です。前提が違うので、この比率には
          「店の取り分」と「地金とスクラップの差」の両方が混ざっています。
        </p>
      </section>

      {/* 2. 形で違う */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">同じ純度でも、形が違えば値段が違う</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          {QUOTES.goldmrs.company}の価格表は、純度100%の金を形ごとに分けて出しています。
          {jaDate(QUOTES.goldmrs.read)}時点で、インゴットが1gあたり{yen(QUOTES.goldmrs.ingot)}円、
          K24が{yen(QUOTES.goldmrs.k24)}円。
          <span className="font-semibold">同じ純度で{yen(QUOTES.goldmrs.ingot - QUOTES.goldmrs.k24)}円の差</span>
          です。中身の金は同じでも、溶かす手間がかかるぶんだけ引かれます。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          つまり「K24の相場」を調べて地金の数字を見ていると、実際に指輪を持ち込んだときの金額とは
          ずれます。当サイトが各社から取っているのは宝飾品側の単価ですが、この区別は
          比較表の見出しには出てきません。
        </p>
      </section>

      {/* 3. 何を指した価格か */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">そもそも、別の商品を指した価格のことがある</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          {QUOTES.otakaraya.company}は、掲載しているK24の価格について次のように書いています。
        </p>
        <Quote source={`${QUOTES.otakaraya.company}「金の買取相場」より（${jaDate(QUOTES.otakaraya.read)}閲覧）`}>
          {QUOTES.otakaraya.scope}
        </Quote>
        <p className="text-sm leading-relaxed text-foreground/80">
          掲載されているのは、造幣局の刻印が入ったメダルや小判を基準にした金額です。
          指輪やネックレスを持ち込んだ場合、この数字がそのまま適用されるとは限らないと、
          同社自身が断っています。それでも比較表では、他社がスクラップ向けに出している単価と
          同じ列に並びます。当サイトの会社ページには、この注意書きを載せるようにしました。
        </p>
      </section>

      {/* 4. 引くか、織り込むか */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">表示額から引く店と、あらかじめ織り込む店</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          ここがいちばん金額に効きます。{QUOTES.manekiya.company}の価格ページには、
          シミュレーターの結果のすぐ下にこう書かれています。
        </p>
        <Quote source={`${QUOTES.manekiya.company}「本日の貴金属相場」より（${jaDate(QUOTES.manekiya.read)}閲覧）`}>
          {QUOTES.manekiya.deduct}
        </Quote>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          分析料の金額は同じページに表で出ており、{QUOTES.manekiya.perItem.replace(/。$/, "")}と明記されています。
          買取金額20万円以上は「お問い合わせください」とあり、公表されていません。
        </p>

        {k18 && shown.length > 0 && (
          <>
            <p className="mb-3 text-sm leading-relaxed text-foreground/80">
              同社のK18は1gあたり{yen(k18)}円で、当サイトの{shown[0].total}社中
              {shown[0].displayRank}位です。この単価のまま、K18の品物を1点だけ売った場合を計算します。
            </p>
            <div className="mb-3 overflow-x-auto">
              <table className="w-full min-w-[440px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="py-2 pr-3 font-medium">重さ</th>
                    <th className="py-2 pr-3 text-right font-medium">単価どおりなら</th>
                    <th className="py-2 pr-3 text-right font-medium">分析料</th>
                    <th className="py-2 pr-3 text-right font-medium">実質単価</th>
                    <th className="py-2 text-right font-medium">順位相当</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((f) => (
                    <tr key={f.grams} className="border-b border-border/60">
                      <td className="py-2 pr-3">{f.grams}g</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{yen(f.gross)}円</td>
                      <td className="py-2 pr-3 text-right tabular-nums">−{yen(f.fee!)}円</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{yen(f.effective!)}円/g</td>
                      <td className="py-2 text-right font-semibold tabular-nums">{f.effectiveRank}位</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mb-4 text-xs text-muted">
              分析料は公表されている税抜額に消費税を加えた金額。{jaDate(MANEKIYA_FEE.transcribedAt)}時点で{" "}
              <a href={MANEKIYA_FEE.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
                同社の公表表
              </a>
              から転記しています。順位は当サイト掲載社のK18単価との比較です。
            </p>
            <p className="mb-4 text-sm leading-relaxed text-foreground/80">
              表示単価では{shown[0].displayRank}位の店が、指輪1本を売るだけなら
              <span className="font-semibold">{shown.find((f) => f.grams === 5)?.effectiveRank ?? shown[0].effectiveRank}位相当</span>
              になります。まとめて売れば1点あたりの負担は薄まりますが、
              分析料は1点ごとなので、小さなものを何点も持ち込むと逆に効いてきます。
            </p>
          </>
        )}

        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          一方で、後から引かない店もあります。費用を取らないのではなく、
          最初から単価に入れてしまう方式です。
        </p>
        <Quote source={`${QUOTES.otakaraya.company}「金の買取相場」より（${jaDate(QUOTES.otakaraya.read)}閲覧）`}>
          {QUOTES.otakaraya.refining}
        </Quote>
        <Quote source={`${QUOTES.komehyo.company}「金・プラチナ買取相場」より（${jaDate(QUOTES.komehyo.read)}閲覧）`}>
          {QUOTES.komehyo.fee}
        </Quote>
        <p className="text-sm leading-relaxed text-foreground/80">
          高く見える単価から後で引かれるのと、引かれる前提で少し低い単価が出ているのとでは、
          並べて比べたときの意味が変わります。表示単価だけを見て順位を付けると、
          前者が有利に、後者が不利に出ます。
        </p>
      </section>

      {/* 5. 口コミ */}
      {review && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">口コミは、この判断の代わりにならない</h2>
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">
            価格の前提が揃っていないなら、評判のいい店を選べばいいのでは、と考えたくなります。
            当サイトは{review.count}社についてGoogleの評価を集めているので、
            評価と買取価格に関係があるかを計算しました。相関係数は
            <span className="font-semibold">{review.correlation.toFixed(3)}</span>
            。ほとんど関係がありません。
          </p>
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">
            理由のひとつは、評価がほとんどばらけないことです。
            {review.count}社の評価は{review.ratingRange[0].toFixed(2)}〜{review.ratingRange[1].toFixed(2)}の幅がありますが、
            そのうち{review.clustered.count}社は{review.clustered.low.toFixed(2)}〜{review.clustered.high.toFixed(2)}の
            わずか{(review.clustered.high - review.clustered.low).toFixed(2)}ポイントの間に固まっています。
            差が付かないものを基準にしても、店は選べません。
          </p>
          {review.counterExample && (
            <p className="text-sm leading-relaxed text-foreground/80">
              極端な例として、評価がいちばん低い{review.counterExample.name}（
              {review.counterExample.rating.toFixed(2)}）は、K24の買取価格では
              <span className="font-semibold">{review.counterExample.priceRank}位</span>
              です。評価の低い順に切り捨てていくと、最初に落ちます。
            </p>
          )}
        </section>
      )}

      {/* 6. 限界 */}
      <section className="mb-10 rounded-2xl border border-border bg-surface-2/60 p-4 sm:p-5">
        <h2 className="font-serif-jp mb-3 text-base font-semibold">当サイトが追えていないこと</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-foreground/80">
          <li>
            <span className="font-semibold">増額キャンペーンは、確認できたものだけを載せています。</span>
            買取金額を数十%上乗せする期間限定の企画があり、その規模はここで扱った数%の差を
            簡単に上回ります。価格と違って自動取得ができないため、各社のページを見て
            転記しており、載っていない＝実施していない、ではありません。
            {campaigns.length > 0
              ? `${new Date().toLocaleDateString("ja-JP")}時点で${campaigns.length}社の実施を確認しており、該当する会社のページに条件を載せています。`
              : "現時点で確認できているものはありません。"}
            実際に売る前に、各社の告知を必ずご確認ください。
          </li>
          <li>
            フランチャイズが中心の会社では、掲載の参考相場と実際の店舗の金額が異なることがあります。
            該当する会社の個別ページには、その旨を記載しています。
          </li>
          <li>
            ここで比べているのはノーブランドの貴金属です。ブランドのジュエリーや時計は、
            金としての重さではなく品物として値が付くため、1gあたりの単価では比較できません。
          </li>
        </ul>
      </section>

      {/* 7. 結論 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">では何を見ればいいか</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          単価を比べること自体は有効です。全社が同じ建値を上限にしている以上、
          そこからどれだけ引くかが店の取り分であり、それは実際に手取りを左右します。
          ただし単価だけで決めると、ここまでに挙げた差を見落とします。
        </p>
        <ul className="mb-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-foreground/80">
          <li>その単価が、自分の持っているもの（指輪か、地金か、刻印入りのメダルか）に対する金額か</li>
          <li>表示額から後で引かれるものがあるか、それとも織り込み済みか</li>
          <li>1点あたりで費用がかかる場合、自分は何点持ち込むのか</li>
          <li>その時期にキャンペーンが出ていないか(当サイトで確認できたものは会社ページに記載しています)</li>
        </ul>
        <p className="text-sm leading-relaxed text-foreground/80">
          どれも各社が自社サイトに書いていることで、探せば読めます。ただ、
          書いてある場所が価格表の下の小さな注意書きなので、まず読まれません。
          当サイトでは、会社ごとのページにこうした注意書きを転記して、
          単価の隣に置くようにしています。
        </p>
      </section>

      <div className="flex flex-col gap-2 text-sm">
        <Link href="/compare" className="underline underline-offset-2">
          今日の{bench.rows.length}社の価格を横並びで見る
        </Link>
        <Link href="/company" className="underline underline-offset-2">
          買取店ごとのページで、注意書きと順位を確かめる
        </Link>
        <Link href="/column/price-gap" className="underline underline-offset-2">
          店ごとの差が実際いくらになるかを測った記事
        </Link>
      </div>
    </div>
  );
}
