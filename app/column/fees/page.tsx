import type { Metadata } from "next";
import Link from "next/link";
import { measureFeeLandscape, franchiseCompanies, hiddenInTerms, FEE_MODEL_LABEL } from "@/lib/fees";
import { measureFeeImpact, MANEKIYA_FEE } from "@/lib/priceMeaning";
import { PURITY_LABELS } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";

export function generateMetadata(): Metadata {
  const f = measureFeeLandscape();
  const hidden = hiddenInTerms().length;
  return {
    title: "金買取の手数料は、どこでいくら引かれるのか",
    description:
      `「手数料無料」と書いてあっても、受け取る金額が表示単価どおりとは限りません。` +
      `${f.priced}社について価格ページだけでなく利用規約や宅配買取の案内まで読んだところ、` +
      `${hidden}社は価格ページに手数料はかからないと書きながら、規約では金額を決めて差し引いていました。` +
      `手数料の扱いが${f.disclosed}社で${f.distinctModels}通りに分かれていることと、` +
      `あとから引かれる場合に実質単価が何円下がるかを計算しています。`,
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
  const hidden = hiddenInTerms();
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
        「手数料無料」と書いてある店でも、受け取る金額が表示単価どおりとは限りません。当サイトが価格を追っている{f.priced}社について、価格ページに加えて利用規約や宅配買取の案内まで読んだところ、手数料の扱いは{f.disclosed}社で
        {f.distinctModels}通りに分かれていました。同じ「無料」の2文字が、別のことを指しています。
        {hidden.length > 0 && (
          <>
            そのうち{hidden.length}社は、価格ページに「手数料は一切かかりません」と書きながら、規約のほうで金額を決めて差し引いていました。
          </>
        )}
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
          真ん中の形がいちばん分かりにくいところです。費用を取らないのではなく、費用を引いたあとの金額を最初から単価として出している、という意味になります。後から引かれないのは確かですが、その分だけ表示単価は低く出ます。
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
            {MANEKIYA_FEE.tiers[MANEKIYA_FEE.tiers.length - 1][1].toLocaleString("ja-JP")}円（税抜）で、商品1点ごとにかかります。この単価のまま品物を1点だけ売った場合を計算しました。
          </p>

          {k18.length > 0 && (
            <>
              <h3 className="mb-2 text-sm font-semibold">{PURITY_LABELS.k18}を1点だけ売る場合</h3>
              {/* min-w-[26rem] を入れていたので、375pxの端末では416pxの表が343pxの枠に
                  入らず、右端の「順位相当」が常に画面の外にあった。この表で言いたいのは
                  まさにその列なので、幅を強制せず収める。 */}
              <div className="mb-4">
                <table className="w-full table-fixed text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="w-12 py-2 font-medium">重さ</th>
                      <th className="py-2 text-right font-medium">単価どおり</th>
                      <th className="py-2 text-right font-medium">分析料</th>
                      <th className="py-2 text-right font-medium">実質単価</th>
                      <th className="w-14 py-2 text-right font-medium">順位</th>
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
              {/* min-w-[26rem] を入れていたので、375pxの端末では416pxの表が343pxの枠に
                  入らず、右端の「順位相当」が常に画面の外にあった。この表で言いたいのは
                  まさにその列なので、幅を強制せず収める。 */}
              <div className="mb-4">
                <table className="w-full table-fixed text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="w-12 py-2 font-medium">重さ</th>
                      <th className="py-2 text-right font-medium">単価どおり</th>
                      <th className="py-2 text-right font-medium">分析料</th>
                      <th className="py-2 text-right font-medium">実質単価</th>
                      <th className="w-14 py-2 text-right font-medium">順位</th>
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

          {/* この表は固定の重さ3つぶんしか出せない。自分の品物で確かめたい人のために、
              同じ計算をするシミュレーターへ送る。向こうは差し引きのある社を全部見て、
              単価の1位と手取りの1位が入れ替わるときだけ上に注意を出す。 */}
          <p className="mb-4 rounded-xl border border-accent/30 bg-accent-soft/40 p-4 text-sm leading-relaxed">
            自分の品物の重さで確かめるなら
            <Link
              href="/simulator"
              className="mx-1 font-medium text-accent-strong underline underline-offset-2 hover:no-underline"
            >
              シミュレーター
            </Link>
            を使ってください。ここと同じ計算を、差し引きを公表している社すべてに対して行い、引いたあとに残る金額まで出します。表示単価の1位と手取りの1位が入れ替わる場合は、その旨も出ます。店頭と宅配で引かれるものが違う社があるので、切り替えて比べられます。
          </p>
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
            から転記しています。買取金額20万円以上は「お問い合わせください」とあり公表されていないため、その範囲に入る重さは表から外しました。順位は当サイト掲載社の同じ純度の単価との比較です。
          </p>
          {worst && worst.effectiveRank !== null && (
            <p className="text-sm leading-relaxed text-foreground/80">
              {PURITY_LABELS[worst.purity]}の表示単価では{worst.displayRank}位の店が、
              {worst.grams}gを1点で売るだけなら{worst.effectiveRank}位相当になります。分析料は1点ごとにかかるので、まとめて売れば1点あたりの負担は薄まりますが、小さなものを何点も持ち込むと逆に効いてきます。
            </p>
          )}
        </section>
      )}

      {/* ---- 「無料」が意味しないこと ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">「手数料無料」は、高く買う意味ではない</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          費用を単価に織り込んでいる店は、手数料を取りません。取る必要がないからです。一方、後から引く店は、引く前の金額を単価として出せます。比較表に並べたとき、後者のほうが高く見えます。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          つまり「手数料無料」は、支払われる金額が多いことを意味しません。比べるべきなのは単価でも手数料の有無でもなく、
          <strong className="font-semibold">最後に受け取る金額</strong>です。当サイトの
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
          これらの言葉は店によって使い分けが違い、業界で統一された定義があるかどうかを当サイトは確認できていません。ある店が「分析料」と呼ぶものを、別の店は「手数料」に含めているかもしれませんし、そもそも取らないかもしれません。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          名前を覚えるより、聞き方を決めておくほうが確実です。「この単価で計算した金額から、引かれるものはありますか」と一度聞けば、呼び名が何であっても答えは同じ形で返ってきます。
        </p>
      </section>

      {/* ---- 規約に書いてある場合 ---- */}
      {hidden.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">
            価格ページの「無料」と、規約に書いてある金額が違う社がある
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-foreground/80">
            当サイトは最初、各社の価格ページだけを読んでいました。それだと見落とすものがあります。下の{hidden.length}社は、価格ページには手数料がかからないと書いてあるのに、利用規約や宅配買取の案内のほうに、いくら引くかが決められていました。どちらもその会社自身の記載です。
          </p>
          <div className="flex flex-col gap-4">
            {hidden.map((r) => (
              <div key={r.companyId} className="rounded-xl border border-amber-500/40 bg-amber-50/60 p-4 dark:bg-amber-950/20">
                <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                  <Link href={`/company/${r.companyId}`} className="font-semibold hover:underline">
                    {r.name}
                  </Link>
                  {r.k24 !== null && (
                    <span className="text-sm text-muted">
                      {PURITY_LABELS.k24} {yen(r.k24)}円/g
                    </span>
                  )}
                </div>
                <dl className="flex flex-col gap-2 text-sm leading-relaxed">
                  <div>
                    <dt className="text-xs font-medium text-muted">価格ページでの説明</dt>
                    <dd className="text-foreground/80">「{r.contrast!.quote}」</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted">規約・宅配買取の案内での説明</dt>
                    <dd className="text-foreground/80">「{r.quote}」</dd>
                    <dd className="mt-1 text-foreground/80">{r.condition}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  <a href={r.contrast!.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                    価格ページ
                  </a>
                  ／
                  <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                    規約のページ
                  </a>
                  （どちらも{jaDate(r.checkedAt)}閲覧）
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/80">
            どちらの条件も、少額で、ブランド品ではない貴金属を、宅配で送る場合に当たります。金のネックレスを1本売るような、このサイトを見ている人にいちばん多いであろう売り方です。店頭に持ち込む場合や、金額が大きい場合は対象外と書かれています。
          </p>
        </section>
      )}

      {/* ---- どれだけ公表されているか ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">どこまで読めば分かるのか</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          1gあたりの価格を公表している{f.priced}社のうち、手数料の扱いを確認できたのは{f.disclosed}社です。残りが取っているという意味ではありません。どこにも書かれていないのか、当サイトが見つけられていないだけなのかは区別できません。
        </p>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          確認できた社については、各社ページに「価格ページのみ確認」か「利用規約・よくある質問・宅配買取の案内まで確認」かを書いています。上の{hidden.length}社の例のとおり、どこまで読んだかで答えが変わるためです。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          価格を見に来た人がその場で気づけるか、という点で言えば、規約まで開く人はほとんどいないはずです。単価だけを見て比べると、この部分が抜け落ちます。
        </p>
      </section>

      {/* ---- フランチャイズ ---- */}
      {franchises.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">同じ看板でも、店舗によって変わる場合</h2>
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">
            フランチャイズ加盟店が中心のチェーンでは、掲載されている相場と実際の提示額が店舗ごとに異なることがあります。当サイトが把握している範囲では
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
          引用は各社の価格ページ・利用規約・よくある質問・宅配買取の案内から転記したもので、閲覧日を併記しています。転記にあたっては、取得したHTMLに同じ文字列があることを1件ずつ確認しています。記載は予告なく変わるため、実際に売る前にはご自身でも確認してください。単価と順位は当サイトが毎日取得している各社の公表価格から、ページを作るたびに計算し直しています。分析料の金額は
          {jaDate(MANEKIYA_FEE.transcribedAt)}時点の公表表からの転記です。当サイトは買取店ではなく、査定や契約には関与していません。
        </p>
      </section>

      <OtherColumns current="/column/fees" />
    </div>
  );
}
