import type { Metadata } from "next";
import Link from "next/link";
import { getMeasuredOn, measureSpread } from "@/lib/spread";
import { PURITY_LABELS } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";

// 社数は本文と同じく実データから取る。ここだけ固定値にすると、
// 掲載社が増減したときにタイトルだけが嘘になる。
export function generateMetadata(): Metadata {
  const k24 = measureSpread("k24");
  const n = k24 ? `${k24.count}社` : "各社";
  return {
    title: `同じ日に、同じ金を、${n}はいくらで買うのか`,
    description:
      `当サイトが日次で集めている${n}の公表買取価格から、同じ日・同じ純度で各社の値がどれだけ違うかを実際に測りました。` +
      `平均的な店を基準にすると、上振れより下振れのほうが大きいことが分かります。`,
    alternates: { canonical: "/column/price-gap" },
  };
}

/** 記事中で使う現実的な重さ。指輪1本から地金1本まで幅を持たせる */
const WEIGHTS = [
  { label: "K18の指輪 1本", grams: 5, purity: "k18" as const },
  { label: "K18のネックレス 1本", grams: 20, purity: "k18" as const },
  { label: "K18をまとめて", grams: 50, purity: "k18" as const },
  { label: "K24の地金 1本", grams: 100, purity: "k24" as const },
];

const yen = (n: number) => n.toLocaleString("ja-JP");

/** 本文に混ぜる日付。ISO表記のままだと文章の中で浮く */
function jaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
}

export default function PriceGapColumnPage() {
  const k24 = measureSpread("k24");
  const k18 = measureSpread("k18");
  const k14 = measureSpread("k14");
  const pt900 = measureSpread("pt900");
  const measuredOn = getMeasuredOn();

  const spreads = [k24, k18, k14, pt900].filter((s): s is NonNullable<typeof s> => s !== null);
  if (!k24 || !k18) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-muted">
          価格を公開している社が少なく、この記事の比較が成り立たないため、一時的に内容を出していません。
        </p>
      </div>
    );
  }

  // 「損のほうが大きい」は測った結果で決まる。勝手に決めつけず、毎回計算する
  const ratio = k24.upside > 0 ? k24.downside / k24.upside : 0;
  const downsideIsBigger = k24.downside > k24.upside;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd("/column/price-gap", generateMetadata()), columnBreadcrumb("/column/price-gap", generateMetadata())]} />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        同じ日に、同じ金を、{k24.count}社はいくらで買うのか
      </h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        「買取店によって金額が違う」とはよく言われますが、実際どれくらい違うのかを数字で見た人は
        多くありません。当サイトは{k24.count}社の公表買取価格を毎日集めているので、
        同じ日・同じ純度で並べて測ってみました。
        {measuredOn ? `以下は${jaDate(measuredOn)}時点の公表値です。` : ""}
      </p>

      {/* ---- 1. まず差そのもの ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">1gあたりの差</h2>
        <div className="mb-4 overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-2 pr-3 font-medium">純度</th>
                <th className="py-2 pr-3 text-right font-medium">公開社数</th>
                <th className="py-2 pr-3 text-right font-medium">最高</th>
                <th className="py-2 pr-3 text-right font-medium">最低</th>
                <th className="py-2 text-right font-medium">差</th>
              </tr>
            </thead>
            <tbody>
              {spreads.map((s) => (
                <tr key={s.purity} className="border-b border-border/60">
                  <td className="py-2 pr-3">{PURITY_LABELS[s.purity]}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-muted">{s.count}社</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{yen(s.high.price)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{yen(s.low.price)}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{yen(s.range)}円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-foreground/80">
          {PURITY_LABELS[k24.purity]}で{yen(k24.range)}円、{PURITY_LABELS[k18.purity]}で
          {yen(k18.range)}円の開きがあります。ただしこの数字をそのまま受け取るのは正確ではありません。
          最高値と最低値という両端だけを見た数字だからです。
        </p>
      </section>

      {/* ---- 2. 端を外す ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">両端の1社を外すと、差は縮む</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          上下1社ずつを外して測り直すと、{PURITY_LABELS[k24.purity]}の差は{yen(k24.range)}円から
          <span className="font-semibold">{yen(k24.trimmedRange)}円</span>
          に縮みます（{k24.trimmedLow.name}〜{k24.trimmedHigh.name}）。
          {PURITY_LABELS[k18.purity]}も{yen(k18.range)}円から{yen(k18.trimmedRange)}円になります。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          つまり「{yen(k24.range)}円も違う」という見出しは、極端な1社が作っています。
          大半の店は、そこまで離れていません。ここを曖昧にしたまま
          「店によって何万円も変わる」とだけ言うのは、正確ではないと考えています。
        </p>
      </section>

      {/* ---- 3. 本題 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          {downsideIsBigger ? "それでも、得より損のほうが大きい" : "上振れと下振れの大きさ"}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          ここからが、この数字を並べて初めて見えたことです。
          ちょうど真ん中の店（中央値）を基準にすると、上と下は同じ幅ではありません。
          {PURITY_LABELS[k24.purity]}の場合、いちばん高い店を選んでも中央値より
          <span className="font-semibold">+{yen(k24.upside)}円</span>しか増えませんが、
          いちばん安い店に当たると中央値より
          <span className="font-semibold">−{yen(k24.downside)}円</span>になります。
          {downsideIsBigger && ratio >= 1.5 ? (
            <>
              下振れは上振れの<span className="font-semibold">約{ratio.toFixed(1)}倍</span>です。
            </>
          ) : null}
        </p>

        <div className="mb-4 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-2 pr-3 font-medium">売るもの</th>
                <th className="py-2 pr-3 text-right font-medium">最高の店なら</th>
                <th className="py-2 text-right font-medium">最低の店なら</th>
              </tr>
            </thead>
            <tbody>
              {WEIGHTS.map((w) => {
                const s = w.purity === "k24" ? k24 : k18;
                return (
                  <tr key={w.label} className="border-b border-border/60">
                    <td className="py-2 pr-3">
                      {w.label}
                      <span className="ml-1 text-xs text-muted">約{w.grams}g</span>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                      +{yen(s.upside * w.grams)}円
                    </td>
                    <td className="py-2 text-right tabular-nums">−{yen(s.downside * w.grams)}円</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          いずれも中央値の店で売った場合との差額です。重さは一般的な目安で、実際の品物によって変わります。
        </p>
      </section>

      {/* ---- 4. 理由 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">なぜ上下が対称にならないのか</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          上には天井があります。金の地金価格という共通の基準があり、買取店はそこから
          自社の取り分を引いた額を提示します。おたからやは自社サイトで
          「買取価格は、精錬・加工に要する費用等を差し引いた金額となります」と、
          コメ兵は掲載価格を「田中貴金属工業株式会社の公表価格等を基準に当社が算出した」ものと
          明記しています。基準より高く買う理由がないので、上には限りがあります。
        </p>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          実際、数字もそうなっています。{PURITY_LABELS[k24.purity]}で中央値以上の社の価格は
          <span className="font-semibold">{yen(k24.upperSpread)}円</span>の幅に収まっているのに対し、
          中央値以下は<span className="font-semibold">{yen(k24.lowerSpread)}円</span>に広がっています。
          上は密集し、下は散らばります。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          下に、これに当たる共通の基準はありません。どこまで引くかは各社の方針次第で、
          外から見える一律の下限はない、というのがここから言えることです。
          なぜその方針になるのかは各社が公表していないため、当サイトでは分かりません。
        </p>
      </section>

      {/* ---- 5. 実際にどうするか ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">この数字から言えること</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          いちばん高い店を探し当てる労力より、
          <span className="font-semibold">極端に安い店を避ける</span>ほうが、金額への効き方が大きいということです。
          {PURITY_LABELS[k24.purity]}で言えば、最高の店を引き当てて得られるのは
          +{yen(k24.upside)}円/gですが、下位を避けるだけで{yen(k24.downside)}円/gの目減りを防げます。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          そのために必要なのは、相場そのものではなく
          「今日この店は、他社の中で何番目か」です。当サイトが順位と中央値との差を必ず併記しているのは、
          その1点が分かれば足りるからです。
        </p>
      </section>

      {/* ---- 6. 限界 ---- */}
      <section className="mb-10 rounded-2xl border border-border bg-surface-2/60 p-4 sm:p-5">
        <h2 className="font-serif-jp mb-3 text-base font-semibold">この記事が示していないこと</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-foreground/80">
          <li>
            ここで比べているのは各社が<span className="font-semibold">公表している参考価格</span>です。
            実際の査定額は、品物の状態・手数料の有無・キャンペーンなどで変わります。
          </li>
          <li>
            価格を公表していない社は、この比較に入っていません。公表していないことと、
            金額が高いか安いかは別の話です。
          </li>
          <li>
            測ったのは{measuredOn ? jaDate(measuredOn) : "直近"}の1日分です。順位は日によって入れ替わります。
          </li>
        </ul>
      </section>

      <div className="flex flex-col gap-2 text-sm">
        <Link href="/compare" className="underline underline-offset-2">
          今日の{k24.count}社の価格を横並びで見る
        </Link>
        <Link href="/company" className="underline underline-offset-2">
          買取店ごとのページで、順位と中央値との差を見る
        </Link>
      </div>
      <OtherColumns current="/column/price-gap" />
    </div>
  );
}
