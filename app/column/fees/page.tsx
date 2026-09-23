import type { Metadata } from "next";
import Link from "next/link";
import { measureFeeLandscape, franchiseCompanies, FEE_MODEL_LABEL } from "@/lib/fees";
import { measureFeeImpact, MANEKIYA_FEE } from "@/lib/priceMeaning";
import { PURITY_LABELS } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";

export function generateMetadata(): Metadata {
  const f = measureFeeLandscape();
  return {
    title: "金買取の手数料は、どこでいくら引かれるのか",
    description:
      `「手数料無料」と書いてあっても、受け取る金額が表示単価どおりとは限りません。` +
      `1gあたりの価格を公表している${f.priced}社の価格ページを読み、手数料の扱いが` +
      `${f.disclosed}社で${f.distinctModels}通りに分かれていることと、あとから引かれる場合に` +
      `実質単価が何円下がるかを計算しました。`,
    alternates: { canonical: "/column/fees" },
  };
}

const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");

function jaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
}

/** 分析料が公表されている範囲に収まる重さを選ぶ */
const K24_WEIGHTS = [1, 2, 5];
const K18_WEIGHTS = [2, 5, 10];

export default function FeesPage() {
  const f = measureFeeLandscape();
  const k24 = measureFeeImpact("manekiya", "k24", K24_WEIGHTS).filter((r) => r.fee !== null);
  const k18 = measureFeeImpact("manekiya", "k18", K18_WEIGHTS).filter((r) => r.fee !== null);
  const franchises = franchiseCompanies();
  const deducted = f.rows.find((r) => r.model === "deducted");
  const shown = k18.length ? k18 : k24;
  const worst = shown.length
    ? shown.reduce((a, b) => ((b.effectiveRank ?? 0) > (a.effectiveRank ?? 0) ? b : a))
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd
        data={[
          articleJsonLd("/column/fees", generateMetadata()),
          columnBreadcrumb("/column/fees", generateMetadata()),
        ]}
      />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        金買取の手数料は、どこでいくら引かれるのか
      </h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        「手数料無料」と書いてある店でも、受け取る金額が表示単価どおりとは限りません。
        当サイトが価格を追っている{f.priced}社の価格ページを読んだところ、
        手数料の扱いは{f.disclosed}社で{f.distinctModels}通りに分かれていました。
        同じ「無料」の2文字が、別のことを指しています。
      </p>

      {/* ---- 3つの形 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">引かれ方は3通りある</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          各社が価格ページに書いている文言をそのまま引きます。要約ではありません。
        </p>
        <div className="flex flex-col gap-4">
          {f.rows.map((r) => (
            <div key={r.companyId} className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                <Link
                  href={`/company/${r.companyId}`}
                  className="font-medium underline underline-offset-2 hover:text-accent"
                >
                  {r.name}
                </Link>
                {r.k24 !== null && (
                  <span className="text-xs text-muted">K24 {yen(r.k24)}円/g</span>
                )}
              </div>
              <p className="mb-2 text-sm font-medium text-accent-strong">{FEE_MODEL_LABEL[r.model]}</p>
              <blockquote className="border-l-2 border-accent/50 pl-3 text-sm leading-relaxed text-foreground/80">
                {r.quote}
              </blockquote>
              <p className="mt-1.5 text-xs text-muted">
                <a
                  href={r.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="underline underline-offset-2"
                >
                  {r.name}の価格ページ
                </a>
                より（{jaDate(r.checkedAt)}閲覧）
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">
          真ん中の形がいちばん分かりにくいところです。費用を取らないのではなく、
          費用を引いたあとの金額を最初から単価として出している、という意味になります。
          後から引かれないのは確かですが、その分だけ表示単価は低く出ます。
        </p>
      </section>

      {/* ---- いくら変わるか ---- */}
      {deducted && shown.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">
            あとで引かれる場合、実質いくらになるか
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-foreground/80">
            {deducted.name}は分析料の金額を表で公表しています。買取金額に応じて
            {MANEKIYA_FEE.tiers[0][1].toLocaleString("ja-JP")}〜
            {MANEKIYA_FEE.tiers[MANEKIYA_FEE.tiers.length - 1][1].toLocaleString("ja-JP")}円（税抜）で、
            商品1点ごとにかかります。この単価のまま品物を1点だけ売った場合を計算しました。
          </p>

          {k18.length > 0 && (
            <>
              <h3 className="mb-2 text-sm font-semibold">{PURITY_LABELS.k18}を1点だけ売る場合</h3>
              <div className="mb-4 overflow-x-auto">
                <table className="w-full min-w-[26rem] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 font-medium">重さ</th>
                      <th className="py-2 text-right font-medium">単価どおりなら</th>
                      <th className="py-2 text-right font-medium">分析料</th>
                      <th className="py-2 text-right font-medium">実質単価</th>
                      <th className="py-2 text-right font-medium">順位相当</th>
                    </tr>
                  </thead>
                  <tbody>
                    {k18.map((r) => (
                      <tr key={r.grams} className="border-b border-border">
                        <td className="py-2 tabular-nums">{r.grams}g</td>
                        <td className="py-2 text-right tabular-nums">{yen(r.gross)}円</td>
                        <td className="py-2 text-right tabular-nums">−{yen(r.fee!)}円</td>
                        <td className="py-2 text-right tabular-nums">{yen(r.effective!)}円/g</td>
                        <td className="py-2 text-right tabular-nums">{r.effectiveRank}位</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {k24.length > 0 && (
            <>
              <h3 className="mb-2 text-sm font-semibold">{PURITY_LABELS.k24}を1点だけ売る場合</h3>
              <div className="mb-4 overflow-x-auto">
                <table className="w-full min-w-[26rem] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 font-medium">重さ</th>
                      <th className="py-2 text-right font-medium">単価どおりなら</th>
                      <th className="py-2 text-right font-medium">分析料</th>
                      <th className="py-2 text-right font-medium">実質単価</th>
                      <th className="py-2 text-right font-medium">順位相当</th>
                    </tr>
                  </thead>
                  <tbody>
                    {k24.map((r) => (
                      <tr key={r.grams} className="border-b border-border">
                        <td className="py-2 tabular-nums">{r.grams}g</td>
                        <td className="py-2 text-right tabular-nums">{yen(r.gross)}円</td>
                        <td className="py-2 text-right tabular-nums">−{yen(r.fee!)}円</td>
                        <td className="py-2 text-right tabular-nums">{yen(r.effective!)}円/g</td>
                        <td className="py-2 text-right tabular-nums">{r.effectiveRank}位</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <p className="mb-3 text-xs leading-relaxed text-muted">
            分析料は公表されている税抜額に消費税を加えた金額です。
            {jaDate(MANEKIYA_FEE.transcribedAt)}時点で
            <a
              href={MANEKIYA_FEE.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mx-1 underline underline-offset-2"
            >
              同社の公表表
            </a>
            から転記しています。買取金額20万円以上は「お問い合わせください」とあり公表されていないため、
            その範囲に入る重さは表から外しました。順位は当サイト掲載社の同じ純度の単価との比較です。
          </p>
          {worst && worst.effectiveRank !== null && (
            <p className="text-sm leading-relaxed text-foreground/80">
              {PURITY_LABELS[worst.purity]}の表示単価では{worst.displayRank}位の店が、
              {worst.grams}gを1点で売るだけなら{worst.effectiveRank}位相当になります。
              分析料は1点ごとにかかるので、まとめて売れば1点あたりの負担は薄まりますが、
              小さなものを何点も持ち込むと逆に効いてきます。
            </p>
          )}
        </section>
      )}

      {/* ---- 「無料」が意味しないこと ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">「手数料無料」は、高く買う意味ではない</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          費用を単価に織り込んでいる店は、手数料を取りません。取る必要がないからです。
          一方、後から引く店は、引く前の金額を単価として出せます。比較表に並べたとき、
          後者のほうが高く見えます。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          つまり「手数料無料」は、支払われる金額が多いことを意味しません。
          比べるべきなのは単価でも手数料の有無でもなく、
          <strong className="font-semibold">最後に受け取る金額</strong>です。
          当サイトの
          <Link href="/simulator" className="mx-1 underline underline-offset-2 hover:text-accent">
            シミュレーター
          </Link>
          も各社の公表単価で計算しているため、後から引かれる分は入っていません。
        </p>
      </section>

      {/* ---- 言葉 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">分析料・査定料・鑑定料という言葉</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          これらの言葉は店によって使い分けが違い、業界で統一された定義があるかどうかを
          当サイトは確認できていません。ある店が「分析料」と呼ぶものを、別の店は
          「手数料」に含めているかもしれませんし、そもそも取らないかもしれません。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          名前を覚えるより、聞き方を決めておくほうが確実です。
          「この単価で計算した金額から、引かれるものはありますか」と一度聞けば、
          呼び名が何であっても答えは同じ形で返ってきます。
        </p>
      </section>

      {/* ---- どれだけ公表されているか ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">価格ページを見て分かる社は多くない</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          1gあたりの価格を公表している{f.priced}社のうち、手数料の扱いまで価格ページに
          書かれていることを当サイトが確認できたのは{f.disclosed}社です。
          残りが取っているという意味ではありません。別のページに書かれているかもしれませんし、
          当サイトが見つけられていないだけかもしれません。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          ただ、価格を見に来た人がその場で気づけるかという点では、{f.disclosed}社以外は
          分からないままになります。単価だけを見て比べると、この部分が抜け落ちます。
        </p>
      </section>

      {/* ---- フランチャイズ ---- */}
      {franchises.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">同じ看板でも、店舗によって変わる場合</h2>
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">
            フランチャイズ加盟店が中心のチェーンでは、掲載されている相場と実際の提示額が
            店舗ごとに異なることがあります。当サイトが把握している範囲では
            {franchises.map((c) => c.name).join("・")}がこれにあたります。
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            公式サイトの数字は全店共通の参考値として見て、条件はその店舗に確認するのが確実です。
          </p>
        </section>
      )}

      {/* ---- 何を聞くか ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">店頭で確認すること</h2>
        <ul className="flex flex-col gap-2 text-sm leading-relaxed text-foreground/80">
          <li className="rounded-lg border border-border bg-surface p-3">
            この単価で計算した金額から、引かれるものはありますか
          </li>
          <li className="rounded-lg border border-border bg-surface p-3">
            （引かれる場合）それは1点ごとですか、まとめて1回ですか
          </li>
          <li className="rounded-lg border border-border bg-surface p-3">
            最終的に受け取る金額はいくらになりますか
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          3つめだけでも足ります。金額で答えてもらえば、名前も計算方法も気にしなくて済みます。
        </p>
      </section>

      {/* ---- 出典 ---- */}
      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事の数字について</h2>
        <p className="text-xs leading-relaxed text-muted">
          引用は各社の価格ページから転記したもので、閲覧日を併記しています。
          記載は予告なく変わるため、実際に売る前にはご自身でも確認してください。
          単価と順位は当サイトが毎日取得している各社の公表価格から、ページを作るたびに
          計算し直しています。分析料の金額は
          {jaDate(MANEKIYA_FEE.transcribedAt)}時点の公表表からの転記です。
          当サイトは買取店ではなく、査定や契約には関与していません。
        </p>
      </section>

      <OtherColumns current="/column/fees" />
    </div>
  );
}
