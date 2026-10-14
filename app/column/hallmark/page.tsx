import type { Metadata } from "next";
import Link from "next/link";
import {
  RingDiagram,
  ClaspDiagram,
  EarringDiagram,
  StampTypesDiagram,
} from "@/components/HallmarkDiagrams";
import { PURITY_FINENESS } from "@/lib/units";
import { PURITY_LABELS, GOLD_PURITIES, PLATINUM_PURITIES } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";
import ColumnHero from "@/components/ColumnHero";
import {
  MINT_CHECKED_AT,
  MINT_DISCONTINUED,
  MINT_GOLD_KARAT,
  MINT_QUOTES,
  SHOP_HALLMARK_NOTE,
  assertFinenessMatchesMint,
  type MintQuote,
} from "@/lib/hallmarkMint";

const PATH = "/column/hallmark";

/**
 * 引用は lib/hallmarkMint.ts に置いてある。
 *
 * この記事は当サイトで早い時期に書いたもので、造幣局の一文を引きながら
 * 出典のURLを持たず、日次の照合にも入っていなかった。他の記事は全部そうしているのに
 * ここだけ素の文章になっていた。引用を向こうに移して、毎日取り直す対象にしている。
 *
 * 品位の数字は lib/units.ts から出す。ここに書くと、計算ページとずれても気づけない。
 */

export const metadata: Metadata = {
  title: "金の刻印はどこにある？「750」「K18」「GP」の意味と見分け方",
  description:
    "指輪やネックレスの刻印がどこにあるか、図で示します。K18と750が同じ意味であること、" +
    "「K18」は造幣局の証明ではないこと、古い品物に入っている1000や835という数字の正体、" +
    "そしてK18GPのように金そのものではない表記の見分け方まで、造幣局の原文を引いてまとめました。",
  alternates: { canonical: PATH },
};

const PT_MARKS = PLATINUM_PURITIES;
/** 造幣局の区分に無い、当サイトが扱っている金の純度 */
const NOT_IN_MINT = GOLD_PURITIES.filter(
  (p) => !MINT_GOLD_KARAT.some((m) => m.purity === p),
);

const PLATED = [
  {
    mark: "GP",
    full: "Gold Plated",
    body: "金メッキ。土台の金属の表面に、電気メッキで薄く金を付けたものです。金の層は製品全体の重さのごく一部にとどまります。",
  },
  {
    mark: "GF",
    full: "Gold Filled",
    body: "金張り。金の板を圧着したもので、メッキより層は厚くなります。「1/20 18KGF」のように、全体に対する金の割合が併記されることがあります。",
  },
  { mark: "GEP", full: "Gold Electro Plated", body: "電気メッキ。GPと同じ意味で使われます。" },
  { mark: "RGP", full: "Rolled Gold Plated", body: "金張りの一種を指す表記です。" },
];

function Quote({ entry, highlight }: { entry: MintQuote; highlight?: boolean }) {
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
        （{MINT_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

export default function HallmarkPage() {
  // 刻印の記事と計算ページで違う品位を出さないための歯止め。合わなければビルドで落ちる
  assertFinenessMatchesMint();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, metadata), columnBreadcrumb(PATH, metadata)]} />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-3 text-xl font-semibold leading-snug sm:text-2xl">
        金の刻印はどこにある？「750」「K18」「GP」の意味と見分け方
      </h1>

      <ColumnHero href={PATH} />
      <p className="mb-8 text-base leading-relaxed">
        買取価格は純度ごとに決まっているので、自分の品物が何なのか分からないと、いくらになるかも調べられません。純度が書いてあるのは、たいてい品物のどこかに小さく刻まれた文字です。まずはそれを見つけるところからです。
      </p>

      {/* 1. どこにあるか */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">どこを見ればいいか</h2>
        <p className="mb-4 text-base leading-relaxed">
          刻印は目立つ場所には打たれません。身につけたときに見えない面に入っています。
        </p>
        <div className="flex flex-col gap-4">
          <RingDiagram />
          <ClaspDiagram />
          <EarringDiagram />
        </div>
        <p className="mt-4 text-base leading-relaxed">
          文字は1mmに満たないことも多く、明るいところで拡大鏡やスマートフォンのカメラを使うと読みやすくなります。長く使った品物では擦れて薄くなっていることもあります。
        </p>
      </section>

      {/* 2. 何が書いてあるか */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">「K18」と「750」は同じ意味</h2>
        <div className="mb-4">
          <StampTypesDiagram />
        </div>
        <p className="mb-3 text-base leading-relaxed">
          金の純度の書き方は2通りあります。Kのあとに数字を置く24分率と、1000分の何かで表す千分率です。K18は18/24で75%、千分率なら750。どちらも同じ品位を指しています。Kのほうがどこから来た書き方なのかは、造幣局が説明しています。
        </p>
        <Quote entry={MINT_QUOTES.karatIsTraditional} />
        <p className="mb-3 text-base leading-relaxed">
          そのうえで、千分率とカラット表示の対応を造幣局自身が表にして出しています。
        </p>
        <Quote entry={MINT_QUOTES.karatTable} />
        <div className="mb-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full table-fixed text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="px-3 py-2 font-medium">造幣局の品位区分</th>
                <th className="px-3 py-2 font-medium">カラット表示</th>
                <th className="px-3 py-2 text-right font-medium">含有率</th>
              </tr>
            </thead>
            <tbody>
              {MINT_GOLD_KARAT.map((m) => (
                <tr key={m.fineness} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 tabular-nums">{m.fineness}</td>
                  <td className="px-3 py-2">{PURITY_LABELS[m.purity]}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {(PURITY_FINENESS[m.purity] * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mb-3 text-base leading-relaxed">
          含有率は当サイトが計算に使っている値で、造幣局の区分と一致することをページを作るたびに確かめています。
          {NOT_IN_MINT.length > 0 && (
            <>
              なお当サイトでは
              {NOT_IN_MINT.map((p) => PURITY_LABELS[p]).join("・")}
              の価格も集めていますが、こちらは上の区分には入っていません。刻印としては使われていても、造幣局が証明する区分ではない、ということです。
            </>
          )}
        </p>
        <p className="text-base leading-relaxed">
          プラチナは{PT_MARKS.map((p) => PURITY_LABELS[p]).join("・")}
          のように、Ptのあとに千分率をそのまま書きます。銀はSVやSILVERのあとに925などと入ります。
        </p>
      </section>

      {/* 3. 造幣局のホールマーク */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          「K18」はメーカーの表示で、公的な証明ではありません
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          意外に知られていないのですが、K18やPt900という刻印は、その製品を作った側が打っているものです。造幣局がはっきり書いています。
        </p>
        <Quote entry={MINT_QUOTES.notMintMark} highlight />
        <Quote entry={MINT_QUOTES.k18Only} />
        <p className="mb-3 text-base leading-relaxed">
          では公的な証明は何かというと、造幣局が品位試験をして打つ記号のほうです。
        </p>
        <Quote entry={MINT_QUOTES.what} />
        <p className="mb-3 text-base leading-relaxed">
          日の丸と、ひし形の中の千分率の数字と、金属を示す記号の組み合わせで、これを通称ホールマークといいます。区分の数は決まっています。
        </p>
        <Quote entry={MINT_QUOTES.divisions} />
        <p className="mb-3 text-base leading-relaxed">
          ここで大事なのは、
          <strong>この制度は義務ではない</strong>ということです。
        </p>
        <Quote entry={MINT_QUOTES.voluntary} />
        <p className="text-base leading-relaxed">
          つまり、
          <strong>ホールマークが無いことは、金ではないことを意味しません</strong>
          。手元の指輪にK18としか入っていなくても、それが普通です。
        </p>
      </section>

      {/* 4. 古い刻印 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          古い品物の数字が、いまの表に無いことがあります
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          譲り受けた品物に「1000」や「835」と入っていて、調べても出てこない、ということがあります。これは表示の決まりが途中で変わったためです。
        </p>
        <Quote entry={MINT_QUOTES.iso} />
        <p className="mb-3 text-base leading-relaxed">何がどう変わったかも書かれています。</p>
        <Quote entry={MINT_QUOTES.thousandIs999} />
        <Quote entry={MINT_QUOTES.renumbered} />
        <p className="mb-3 text-base leading-relaxed">
          さらに、{MINT_DISCONTINUED.join("・")}の3つは区分そのものが無くなりました。ただし、
          <strong>すでに打たれたマークが無効になったわけではありません</strong>。
        </p>
        <Quote entry={MINT_QUOTES.discontinued} highlight />
        <p className="text-base leading-relaxed">
          古い品物に1000とあれば、いまの999と同じ意味です。835は当サイトでは
          {PURITY_LABELS.k20}として扱っています。見慣れない数字が入っていても、それだけで価値が下がることはありません。
        </p>
      </section>

      {/* 5. 色の名前 */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          ホワイトゴールドやピンクゴールドは、純度の名前ではありません
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          色の名前は、混ぜている金属の違いから来ています。金そのものの量とは別の話です。
        </p>
        <Quote entry={MINT_QUOTES.sameMark} highlight />
        <p className="mb-3 text-base leading-relaxed">
          どちらも750なら、刻印は同じ750です。買取の単価も{PURITY_LABELS.k18}として同じ扱いになります。色で値段が変わるわけではありません。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          紛らわしい言葉が1つあるので、造幣局がわざわざ注意しています。
        </p>
        <Quote entry={MINT_QUOTES.whiteGold} />
        <p className="mb-3 text-base leading-relaxed">
          ホワイトゴールドは金、白金はプラチナです。見た目が似ていても、1gあたりの単価は別の表で決まります。
        </p>
        <p className="mb-3 text-base leading-relaxed">銀にも同じような呼び名があります。</p>
        <Quote entry={MINT_QUOTES.sterling} />
        <p className="text-base leading-relaxed">
          スターリングシルバーと書いてあれば925、つまり銀92.5%ということです。
        </p>
      </section>

      {/* 6. GP/GF */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          K18のうしろに2文字あったら、金そのものではありません
        </h2>
        <p className="mb-4 text-base leading-relaxed">
          ここがいちばん間違えやすいところです。「K18GP」は一見K18に見えますが、意味はまったく違います。土台は別の金属で、表面だけが金です。買取価格は金の重さで決まるので、金額も大きく変わります。
        </p>
        <div className="mb-4 flex flex-col gap-3">
          {PLATED.map((x) => (
            <div key={x.mark} className="rounded-xl border border-border bg-surface p-3.5">
              <p className="mb-1 text-sm font-semibold">
                {x.mark}
                <span className="ml-2 text-xs font-normal text-muted">{x.full}</span>
              </p>
              <p className="text-xs leading-relaxed text-foreground/80">{x.body}</p>
            </div>
          ))}
        </div>
        <p className="text-base leading-relaxed">
          刻印を読むときは、数字のあとに英字が続いていないかまで確かめてください。擦れていると見落としやすい部分です。
        </p>
      </section>

      {/* 7. 金額に出る */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">この違いは、金額にも出ています</h2>
        <p className="mb-3 text-base leading-relaxed">
          当サイトが掲載している店の中にも、公表している単価が何を指しているのかを注記しているところがあります。
        </p>
        <Quote entry={SHOP_HALLMARK_NOTE} />
        <p className="text-base leading-relaxed">
          同じ「{PURITY_LABELS.k24}の価格」でも、指しているものが社によって違います。各社の注記を読み比べたものは{" "}
          <Link href="/column/what-a-gram-means" className="underline underline-offset-2">
            「1gいくら」は、店ごとに同じ意味ではない
          </Link>
          にまとめています。
        </p>
      </section>

      {/* 8. 読めないとき */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">刻印が見つからない・読めないとき</h2>
        <ul className="mb-4 list-disc space-y-2 rounded-xl border border-border bg-surface p-4 pl-9 text-sm leading-relaxed">
          <li>小さい品物や、細いチェーンには、そもそも刻印がないことがあります。</li>
          <li>
            上のとおりホールマークは任意の制度なので、無いことは珍しくありません。メーカーの刻印すら無い品物もあります。
          </li>
          <li>
            磁石にはっきりくっつくなら、土台が鉄やニッケルの可能性があります。ただし逆は言えません。詳しくは{" "}
            <Link href="/column/plating-check" className="underline underline-offset-2">
              メッキと金の見分け方
            </Link>
            にまとめています。
          </li>
          <li>
            確実に知るには査定を受けることになります。多くの買取店では、査定だけなら費用はかかりません。
          </li>
        </ul>
        <p className="text-base leading-relaxed">
          当サイトでも、純度が分からない品物の金額を出すことはできません。刻印が読めたら、その純度で各社の価格を比べてください。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          造幣局の記載は、同局の「貴金属製品の品位証明」と「貴金属製品の品位区分と証明記号」から
          {MINT_CHECKED_AT}
          に読んで引きました。要約ではなく、書かれている文をそのまま載せています。引用した文が出典から消えていないかは、当サイトの日次の点検で毎日取り直して照合しています。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          含有率は当サイトが計算に使っている値で、造幣局が公表している品位区分と一致することをページを作るたびに確かめています（合わなければ公開できないようにしてあります）。刻印の読み取りは品物の状態によります。最終的な品位の確認は、買取店の査定や造幣局の品位証明によってください。
        </p>
      </section>

      <div className="flex flex-col gap-2 text-sm">
        <Link href="/compare" className="underline underline-offset-2">
          読み取った純度で、各社の買取価格を比べる
        </Link>
        <Link href="/tools/purity-calculator" className="underline underline-offset-2">
          純度と重さから、含まれる純金属の量を計算する
        </Link>
        <Link href="/column/karat-and-price" className="underline underline-offset-2">
          その純度に、実際いくら払われているのかを測った記事
        </Link>
      </div>
      <OtherColumns current={PATH} />
    </div>
  );
}
