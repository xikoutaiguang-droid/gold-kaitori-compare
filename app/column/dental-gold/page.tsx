import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import ColumnHero from "@/components/ColumnHero";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import {
  DENTAL_CHECKED_AT,
  KINPARA_COMPOSITION,
  MATERIAL_PRICE,
  MATERIAL_QUOTES,
  SHOP_QUOTES,
  measureDental,
  type DentalQuote,
} from "@/lib/dentalGold";
import { measureSpread } from "@/lib/spread";
import { PURITY_LABELS } from "@/lib/types";

const PATH = "/column/dental-gold";

/**
 * 引用は lib/dentalGold.ts に置いてある。本文に文字列で書くと書き換えに気づけないので、
 * あちらに集めて scripts/verify-quotes.mjs に毎日照合させる。
 *
 * 金額も本文に書かない。保険の材料価格は告示なので動かないが、買取価格は毎日動く。
 * 買取側は data/dentalAlloy.json を読んで、ビルドのたびに計算し直している。
 */

function Quote({ entry, highlight }: { entry: DentalQuote; highlight?: boolean }) {
  return (
    <blockquote
      className={`mb-3 rounded-xl border p-4 text-sm leading-relaxed ${
        highlight ? "border-accent/30 bg-accent-soft/40" : "border-border bg-surface"
      }`}
    >
      <p>「{entry.quote}」</p>
      <footer className="mt-2 text-xs text-muted">
        出典:{" "}
        <a
          href={entry.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {entry.label}
        </a>
        （{DENTAL_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "金歯は売れます。ただし純金の単価ではありません",
    description:
      "歯科で外した金歯を買い取ると書いている店はあります。ただし保険診療で使われてきたのは" +
      "金12％以上の金銀パラジウム合金で、純金ではありません。厚生労働省の告示にある材料価格と、" +
      "実際に公表されている買取単価、そして中身の金属から計算した額を並べました。",
    alternates: { canonical: PATH },
  };
}

const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");
const pct = (n: number) => `${n.toFixed(1)}%`;

/** data/ の日付はISOで入っているので、本文に出すときは日本語の表記に直す */
function jpDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : iso;
}

export default function DentalGoldPage() {
  const meta = generateMetadata();
  const m = measureDental();
  const k14 = measureSpread("k14");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, meta), columnBreadcrumb(PATH, meta)]} />

      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>

      <h1 className="font-serif-jp mb-3 text-2xl font-semibold leading-snug sm:text-3xl">
        金歯は売れます。ただし純金の単価ではありません
      </h1>

      <ColumnHero href={PATH} />

      <p className="mb-4 text-base leading-relaxed">
        歯の治療で外した金属が手元にある、という話をときどき聞きます。売れるのかどうかで言えば、売れます。買い取ると公式サイトに書いている店があります。
      </p>
      <p className="mb-8 text-base leading-relaxed">
        ただ、受け取る額は金の価格表の数字とは別になります。
        <strong>日本の保険診療で使われてきた「金歯」は、純金ではありません</strong>
        。何が入っているのかは、厚生労働省の告示に品名として書かれています。そこから順に見ていきます。
      </p>

      {/* ---- 1. 買い取ると書いている社 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          「歯科で使ったもの」を買い取ると書いている店はある
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          まず、持ち込む先があるかどうかです。当サイトが掲載している店の中に、はっきり書いている社があります。
        </p>
        <Quote entry={SHOP_QUOTES.ginzaya} />
        <Quote entry={SHOP_QUOTES.kingram} />
        <Quote entry={SHOP_QUOTES.jewelCafe} />
        <p className="text-base leading-relaxed">
          書いていない店が断るとはかぎりません。当サイトが読んだページに載っていなかっただけで、店頭で聞けば受け付ける場合もあります。ただ、先に「扱っています」と読めるかどうかは、持っていく前の判断材料として別のことです。
        </p>
      </section>

      {/* ---- 2. 中身 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          「金歯」の中身は、品名に書かれている
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          保険が利く治療で使う材料は、国が品名と価格を決めています。その一覧に、歯科で使う金属が並んでいます。よく「金歯」と呼ばれてきたものは、これです。
        </p>
        <Quote entry={MATERIAL_QUOTES.kinpara} highlight />
        <p className="mb-3 text-base leading-relaxed">
          品名がそのまま答えになっています。
          <strong>
            金銀パラジウム合金で、金は{KINPARA_COMPOSITION.goldPercent}％以上
          </strong>
          。いわゆる金パラです。残りはパラジウム、銀、銅です。宝飾品として売られている金とは、入っている金の量がまるで違います。どれくらい違うのかは、この記事の後ろで実際の単価から計算します。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          同じ表には、純度の違う金合金も、銀が主体の合金も載っています。歯に入っていた金属は一種類ではありません。
        </p>
        <Quote entry={MATERIAL_QUOTES.gold14} />
        <Quote entry={MATERIAL_QUOTES.silver} />
        <p className="text-base leading-relaxed">
          これは保険診療の一覧なので、保険の利かない治療で使われた金属は出てきません。純度は現物を見てもらうほかありません。
        </p>
      </section>

      {/* ---- 3. 材料価格は買取価格ではない ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          この一覧の金額は、買取価格ではありません
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          検索すると「金パラは1gあたり{yen(MATERIAL_PRICE.kinpara)}
          円」という数字が出てきます。上に引いた告示の金額です。ただ、これが何の金額なのかは、同じ告示の冒頭に書かれています。
        </p>
        <Quote entry={MATERIAL_QUOTES.basis} />
        <p className="mb-3 text-base leading-relaxed">
          <strong>診療報酬として算定される価格</strong>
          です。歯科医院が治療に材料を使ったときに、いくらで計算するかという額で、誰かが買い取る値段ではありません。消費税も含まれています。
        </p>
        {k14 && (
          <p className="mb-3 text-base leading-relaxed">
            向きを見れば分かります。同じ表の14カラット金合金は1gあたり{yen(MATERIAL_PRICE.gold14)}
            円ですが、当サイトが集めている{PURITY_LABELS.k14}の買取単価は、掲載{k14.count}
            社の中央値で1gあたり{yen(k14.median)}円です。
            <strong>材料価格のほうが{yen(MATERIAL_PRICE.gold14 - k14.median)}円高い</strong>
            。買うときの値段と売るときの値段が同じにならないのと同じで、別の種類の数字だということです。
          </p>
        )}
        <p className="mb-3 text-base leading-relaxed">
          この告示は、改正が繰り返されています。改正文の一覧を見ると、3月・6月・9月・12月の1日付のものが並んでいます。当サイトが読んだ時点で最後に載っていたのは、次の1件でした。
        </p>
        <Quote entry={MATERIAL_QUOTES.amendment} />
        <p className="text-base leading-relaxed">
          つまり、この{yen(MATERIAL_PRICE.kinpara)}
          円という額も固定ではありません。よその記事で見かけた数字が、すでに古いこともあります。
        </p>
      </section>

      {/* ---- 4. 実際の買取価格 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">では、買取価格はいくらなのか</h2>
        <p className="mb-3 text-base leading-relaxed">
          ここが調べにくいところです。{DENTAL_CHECKED_AT}
          に掲載25社の価格表を読んだところ、歯科材の1gあたりの金額を数字で出していたのは1社だけでした。
        </p>
        {m ? (
          <>
            <Quote entry={SHOP_QUOTES.refasta} highlight />
            <p className="mb-3 text-base leading-relaxed">
              この行に出ている金額が、{jpDate(m.buyUpdatedAt)}時点で1gあたり
              <strong>{yen(m.buyPerGram)}円</strong>です。保険の材料価格
              {yen(MATERIAL_PRICE.kinpara)}円に対して{pct(m.ratioToMaterial)}にあたります。
            </p>
            <p className="mb-3 text-base leading-relaxed">
              もう1社は、価格表に項目はあるものの、金額の欄が「ASK」でした。問い合わせないと分からないという意味です。
            </p>
            <Quote entry={SHOP_QUOTES.daikokuAsk} />
            {m.palladiumPart !== null && m.knownFloor !== null && m.ratioToFloor !== null && (
              <>
                <p className="mb-3 text-base leading-relaxed">
                  この金額をどう見るかは、中身から計算できます。品名の「Au12Pd20」のとおり、金が
                  {KINPARA_COMPOSITION.goldPercent}％、パラジウムが
                  {KINPARA_COMPOSITION.palladiumPercent}
                  ％です。どちらも1gあたりの買取単価が公表されているので、そのまま掛けます。
                </p>
                <div className="mb-3 overflow-hidden rounded-xl border border-border">
                  <table className="w-full table-fixed text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface text-left">
                        <th className="px-3 py-2 font-medium">金属</th>
                        <th className="w-14 px-2 py-2 text-right font-medium">割合</th>
                        <th className="px-2 py-2 text-right font-medium">1gの単価</th>
                        <th className="px-2 py-2 text-right font-medium">1gの中の額</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="px-3 py-2">金</td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {KINPARA_COMPOSITION.goldPercent}％
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {yen(m.goldPerGram)}円
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">{yen(m.goldPart)}円</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="px-3 py-2">パラジウム</td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {KINPARA_COMPOSITION.palladiumPercent}％
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {m.palladiumPerGram !== null ? `${yen(m.palladiumPerGram)}円` : "—"}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {yen(m.palladiumPart)}円
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="px-3 py-2">銀・銅</td>
                        <td className="px-2 py-2 text-right">残り</td>
                        <td className="px-2 py-2 text-right text-muted">数えない</td>
                        <td className="px-2 py-2 text-right text-muted">—</td>
                      </tr>
                      <tr className="bg-accent-soft/40">
                        <td className="px-3 py-2 font-medium">2つの合計</td>
                        <td className="px-2 py-2" />
                        <td className="px-2 py-2" />
                        <td className="px-2 py-2 text-right font-semibold tabular-nums">
                          {yen(m.knownFloor)}円
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mb-3 text-base leading-relaxed">
                  金の単価は{PURITY_LABELS.k24}の掲載{m.goldShops}
                  社の中央値、パラジウムは純度1000の公表値です。銀と銅は数えていないので、
                  <strong>{yen(m.knownFloor)}円は中身の価値の下限</strong>
                  です。実際にはもう少し高くなります。
                </p>
                <p className="mb-3 text-base leading-relaxed">
                  その下限に対して、買取価格{yen(m.buyPerGram)}円は{pct(m.ratioToFloor)}です。
                  {m.ratioToFloor < 100 ? (
                    <>
                      <strong>中身の金属の価値を下回っています</strong>
                      。溶かして金属ごとに分ける手間があるので、そのぶんが引かれていると読むのが自然ですが、理由は公表されていません。ここで言えるのは「金が入っているから金の値段になる」わけではない、ということです。
                    </>
                  ) : (
                    <>下限を上回っています。銀と銅の分がここに入っているとみられます。</>
                  )}
                </p>
              </>
            )}
            <p className="text-base leading-relaxed">
              {PURITY_LABELS.k24}の単価が1gあたり{yen(m.goldPerGram)}円の日に、同じ1gの金パラが
              {yen(m.buyPerGram)}円です。
              <strong>およそ{(m.goldPerGram / m.buyPerGram).toFixed(1)}分の1</strong>
              になります。金の価格表を見て額を想像すると、何倍も外れます。
            </p>
          </>
        ) : (
          <p className="text-base leading-relaxed">
            いまは各社の単価が揃っていないため、計算を表示していません。
          </p>
        )}
      </section>

      {/* ---- 5. 持ち込む前に ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">持ち込む前に決まっていないこと</h2>
        <ul className="mb-3 list-disc space-y-2 rounded-xl border border-border bg-surface p-4 pl-9 text-sm leading-relaxed">
          <li>
            <strong>1本が何グラムかは、ここでは言えません。</strong>
            形も大きさも治療ごとに違います。当サイトは1gあたりの数字しか持っていないので、重さは店のはかりで量ってもらうことになります。はかりの決まりは
            <Link href="/column/scale" className="underline underline-offset-2">
              買取店のはかりは、信用してよいのか
            </Link>
            にまとめています。
          </li>
          <li>
            <strong>歯や土台が付いたままの重さの扱いは、店ごとに違います。</strong>
            セラミックやレジンは金属ではないので、その分をどう扱うかで額が変わります。石が付いた品物についての各社の記載は
            <Link href="/column/what-a-gram-means" className="underline underline-offset-2">
              「1gいくら」は、店ごとに同じ意味ではない
            </Link>
            で引いています。
          </li>
          <li>
            <strong>金パラと銀合金は、別の値段です。</strong>
            上に引いた価格表の行にも「銀歯要問合せ」と添えられています。見た目で自分で決めずに、聞いたほうが確かです。保険の材料価格でも、銀合金第1種は1gあたり
            {yen(MATERIAL_PRICE.silver)}円で、金パラの{yen(MATERIAL_PRICE.kinpara)}
            円とは桁が違います。
          </li>
          <li>
            <strong>多くの店は、事前に単価を出していません。</strong>
            宝飾品の金のように「今日は1gいくら」と並んでいるわけではないので、持っていく前に比べることが難しい品目です。
          </li>
        </ul>
        <p className="text-base leading-relaxed">
          少量だと、単価から引かれるものの影響が大きくなります。何がいくら引かれるかは
          <Link href="/column/fees" className="underline underline-offset-2">
            金買取の手数料は、どこでいくら引かれるのか
          </Link>
          に各社の記載を集めています。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          材料価格は厚生労働省の法令等データベースにある告示の原文から、{DENTAL_CHECKED_AT}
          に読んで転記しました。各社の記載も同じ日に公式サイトから引いています。要約ではなく、書かれている文をそのまま載せています。引用した文が出典から消えていないかは、当サイトの日次の点検で毎日取り直して照合しています。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          買取単価と{PURITY_LABELS.k24}・{PURITY_LABELS.k14}
          の中央値は毎日取得し直していて、このページの計算はその日の値で作っています。中身から計算した額は、品名に出ている金とパラジウムの割合だけを使った下限で、銀と銅は数えていません。実際の査定は店の基準によります。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          当サイトは歯科の専門家ではありません。治療で入れた金属の扱いについて決まりを案内するものではなく、ここに書いたのは「告示に何と書いてあるか」と「各社が何を公表しているか」です。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
