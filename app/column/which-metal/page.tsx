import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import { getMeasuredOn } from "@/lib/spread";
import {
  byFewestPublishers,
  byWidestGap,
  feeInGrams,
  measureMetals,
  totalCompanies,
} from "@/lib/metalCoverage";
import { FEE_DEDUCTIONS } from "@/lib/feeDeductions";
import { manekiyaFee, MANEKIYA_FEE } from "@/lib/priceMeaning";
import { PRICE_MAX_AGE_DAYS } from "@/lib/companies";
import { PURITY_LABELS } from "@/lib/types";
import ColumnHero from "@/components/ColumnHero";

const PATH = "/column/which-metal";

/**
 * 数字も、どの金属がどうという順序も、本文に書かない。
 * 社数も価格の開きも毎日動くので、lib/metalCoverage.ts で測った結果から組み立てる。
 * 銀を出す社が増えれば、この記事の結論もそのぶん変わる。
 */

const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");
const pct = (n: number) => `${n.toFixed(1)}%`;
/** 手数料を重さに直した値。金では小数2桁、銀では整数まで動くので桁を変える */
const grams = (g: number) => (g < 1 ? g.toFixed(2) : g < 10 ? g.toFixed(1) : String(Math.round(g)));
/** 2026-10-04 のような記録上の日付を、文章に混ぜられる形にする */
const jpDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : iso;
};

export function generateMetadata(): Metadata {
  return {
    title: "金・プラチナ・銀、どれがいちばん売りにくいのか",
    description:
      "同じ貴金属でも、価格を公表している店の数は金属ごとに違います。" +
      "当サイトが毎日取得している各社の公表価格から、金属ごとの公表社数と、店によって受け取る額がどれだけ変わるかを測りました。" +
      "単価が低い金属ほど、同じ手数料が重くのしかかることも合わせて出しています。",
    alternates: { canonical: PATH },
  };
}

export default function WhichMetalPage() {
  const meta = generateMetadata();
  const metals = measureMetals();
  const measuredOn = getMeasuredOn();
  const total = totalCompanies();

  const fewest = byFewestPublishers(metals)[0];
  const most = byFewestPublishers(metals)[metals.length - 1];
  const widest = byWidestGap(metals)[0];
  const narrowest = byWidestGap(metals).filter((m) => m.trimmedGapPct !== null).at(-1);

  // 手数料の重さは、実際に各社が公表している額から出す。
  // ここに数字を書くと /column/fees や /compare と食い違う。
  const analysisFee = manekiyaFee(MANEKIYA_FEE.tiers[0][0] - 1);
  const shippingFee = FEE_DEDUCTIONS.find((r) => r.companyId === "refasta")?.tiers[0]?.amount ?? null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, meta), columnBreadcrumb(PATH, meta)]} />

      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>

      <h1 className="font-serif-jp mb-3 text-2xl font-semibold leading-snug sm:text-3xl">
        金・プラチナ・銀、どれがいちばん売りにくいのか
      </h1>

      <ColumnHero href="/column/which-metal" />

      <p className="mb-4 text-base leading-relaxed">
        「貴金属買取」と書いてある店でも、全部の金属に値を付けているわけではありません。どの店も自社の価格しか載せないので、「銀を買い取ってくれる店がどれだけあるか」はどこにも書かれていません。当サイトは{total}社の公表価格を毎日取っているので、そこから数えました。
      </p>

      {/* ---- 1. 社数 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">値を出している店の数が、金属で違う</h2>
        <div className="mb-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full table-fixed text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="w-20 px-3 py-2 font-medium">金属</th>
                <th className="px-3 py-2 text-right font-medium">価格を出している社</th>
                <th className="px-3 py-2 text-right font-medium">{total}社のうち</th>
              </tr>
            </thead>
            <tbody>
              {metals.map((m) => (
                <tr key={m.key} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">{m.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.publishing}社</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {pct((m.publishing / total) * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mb-3 text-base leading-relaxed">
          いちばん少ないのは<strong>{fewest.label}</strong>で{fewest.publishing}社、いちばん多い{most.label}の{most.publishing}社と比べると
          {most.publishing - fewest.publishing}社の差があります。持ち込む前に扱っているかを確かめる必要があるのは、{fewest.label}のほうです。
        </p>
        <p className="text-base leading-relaxed">
          ここで数えているのは「公表しているかどうか」です。載せていない店が買い取らないとはかぎらず、店頭で聞けば値を付ける場合もあります。ただ、先に金額を見て選べるかどうかは、持っていく前の判断材料として別のことです。
        </p>
      </section>

      {/* ---- 2. 価格の開き ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">店が少ない金属ほど、金額の幅が広い</h2>
        <p className="mb-3 text-base leading-relaxed">
          同じ日に、同じ純度で、各社がいくら出しているかを並べました。上下1社ずつを外した開きも載せています。極端な1社だけで結論が決まっていないかを見るためです。
        </p>
        <div className="mb-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full table-fixed text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="w-16 px-2 py-2 font-medium">純度</th>
                <th className="px-2 py-2 text-right font-medium">最高</th>
                <th className="px-2 py-2 text-right font-medium">最低</th>
                <th className="px-2 py-2 text-right font-medium">上下を外した開き</th>
              </tr>
            </thead>
            <tbody>
              {metals.map((m) =>
                m.spread && m.trimmedGapPct !== null ? (
                  <tr key={m.key} className="border-b border-border last:border-0">
                    <td className="px-2 py-2">{PURITY_LABELS[m.purity]}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{yen(m.spread.high.price)}円</td>
                    <td className="px-2 py-2 text-right tabular-nums">{yen(m.spread.low.price)}円</td>
                    <td className="px-2 py-2 text-right tabular-nums">{pct(m.trimmedGapPct)}</td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
        {widest.trimmedGapPct !== null && narrowest && narrowest.trimmedGapPct !== null && (
          <p className="mb-3 text-base leading-relaxed">
            上下1社を外しても、開きがいちばん大きいのは<strong>{widest.label}</strong>で
            {pct(widest.trimmedGapPct)}。いちばん小さい{narrowest.label}の
            {pct(narrowest.trimmedGapPct)}と比べると、同じ品を持っていく先を間違えたときの損が違います。
            {widest.spread && (
              <>
                {" "}
                {PURITY_LABELS[widest.purity]}を100g売るとして、
                {yen(widest.spread.high.price)}円の店と{yen(widest.spread.low.price)}円の店では
                {yen((widest.spread.high.price - widest.spread.low.price) * 100)}円の差になります。
              </>
            )}
          </p>
        )}
        <p className="text-base leading-relaxed">
          選べる店が少ないほど、相場から離れた値のままでも成り立ってしまう、という見方ができます。金のように20社近くが毎日値を出していると、そこから大きく外れた店は選ばれません。
        </p>
      </section>

      {/* ---- 3. 手数料 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">単価が低いほど、同じ手数料が重い</h2>
        <p className="mb-3 text-base leading-relaxed">
          手数料は「1点につき何円」のように、品物の種類ではなく金額や件数で決まります。そのため単価の低い金属ほど、同じ額を引かれても割合が大きくなります。実際に各社が公表している額を、グラムに直してみます。
        </p>
        <div className="mb-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full table-fixed text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="w-24 px-2 py-2 font-medium">引かれる額</th>
                {metals.map((m) => (
                  <th key={m.key} className="px-2 py-2 text-right font-medium">
                    {m.label}なら
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "分析料", amount: analysisFee },
                { label: "宅配の負担金", amount: shippingFee },
              ]
                .filter((f): f is { label: string; amount: number } => typeof f.amount === "number")
                .map((f) => (
                  <tr key={f.label} className="border-b border-border last:border-0">
                    <td className="px-2 py-2">
                      {f.label} {yen(f.amount)}円
                    </td>
                    {metals.map((m) => {
                      const g = feeInGrams(f.amount, m);
                      return (
                        <td key={m.key} className="px-2 py-2 text-right tabular-nums">
                          {g === null ? "—" : `${grams(g)}g分`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="mb-2 text-xs leading-relaxed text-muted">
          分析料は、まねきやが公表している階段のいちばん下の額(税込)。宅配の負担金は、リファスタが20万円未満の宅配買取について公表している額です。どちらも当サイトが各社の記載から持っている値で、記事側には書いていません。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          同じ金額でも、金ならごくわずかな重さで済み、銀では何グラム分にもなります。銀のアクセサリーを1点だけ送ると、手数料のほうが高くつくことがあるのはこのためです。
          {" "}
          <Link href="/compare" className="underline underline-offset-2">
            比較ページ
          </Link>
          で重さを入れると、各社の差し引き後にいくら残るかが行ごとに出ます。引かれる額が品物の値段を上回る重さでは、金額ではなくその旨が出るようにしてあります。
        </p>
        <p className="text-base leading-relaxed">
          手数料そのものの中身は
          <Link href="/column/fees" className="underline underline-offset-2">
            金買取の手数料は、どこでいくら引かれるのか
          </Link>
          に、各社の記載をそのまま引いてまとめています。
        </p>
      </section>

      {/* ---- 4. 実務 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">売り先が少ない金属を売るとき</h2>
        <ul className="list-disc space-y-2 rounded-xl border border-border bg-surface p-4 pl-9 text-sm leading-relaxed">
          <li>
            値を公表している店から選ぶ。{fewest.label}は{fewest.publishing}社しかないので、近所の1軒だけで決めると、比べる相手がいないまま終わります。
          </li>
          <li>
            まとめて持ち込む。1点ごとや1回ごとに引かれる手数料は、点数が少ないほど割合が大きくなります。
          </li>
          <li>
            宅配を使うなら、返送料と少額時の負担金を先に読む。単価が低い金属ほど、ここで残りが変わります。
          </li>
          <li>
            純度の刻印を確かめておく。銀は925(スターリングシルバー)が多く、同じ「銀」でも含有率が違います。
          </li>
        </ul>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          数字はすべて、当サイトが各社の公式サイトから毎日取得している公表価格を、ビルドのたびに測り直して出しています。本文に数値を書いていないので、社数や価格が変われば、ここに出る結論も一緒に変わります。
          {measuredOn && <>各社の公表日のうち最も新しいものは{jpDate(measuredOn)}です。</>}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          公表から{PRICE_MAX_AGE_DAYS}日を超えた価格は、同じ日の横並びに使えないものとして比較から外しています。そのため「価格を出している社」は、当サイトが今日の比較に使えている社の数です。各社の公表価格は宝飾品のスクラップを前提とした参考価格で、実際の買取金額は品物の状態や点数で変わります。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
