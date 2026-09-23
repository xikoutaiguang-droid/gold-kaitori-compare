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

export const metadata: Metadata = {
  title: "金の刻印はどこにある？「750」「K18」「GP」の見分け方",
  description:
    "指輪やネックレスの刻印がどこにあるか、図で示します。K18と750が同じ意味であること、造幣局のホールマークとの違い、そしてK18GPのように金そのものではない刻印の見分け方まで。",
  alternates: { canonical: "/column/hallmark" },
};

/** 千分率の表記と、対応する日本での一般的な呼び方 */
const GOLD_MARKS = GOLD_PURITIES.filter((p) => PURITY_FINENESS[p] !== undefined);
const PT_MARKS = PLATINUM_PURITIES;

const PLATED = [
  { mark: "GP", full: "Gold Plated", body: "金メッキ。土台の金属の表面に、電気メッキで薄く金を付けたものです。金の層は製品全体の重さのごく一部にとどまります。" },
  { mark: "GF", full: "Gold Filled", body: "金張り。金の板を圧着したもので、メッキより層は厚くなります。「1/20 18KGF」のように、全体に対する金の割合が併記されることがあります。" },
  { mark: "GEP", full: "Gold Electro Plated", body: "電気メッキ。GPと同じ意味で使われます。" },
  { mark: "RGP", full: "Rolled Gold Plated", body: "金張りの一種を指す表記です。" },
];

export default function HallmarkPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        金の刻印はどこにある？「750」「K18」「GP」の見分け方
      </h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        買取価格は純度ごとに決まっているので、自分の品物が何なのか分からないと、
        いくらになるかも調べられません。純度が書いてあるのは、たいてい品物のどこかに
        小さく刻まれた文字です。まずはそれを見つけるところからです。
      </p>

      {/* 1. どこにあるか */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">どこを見ればいいか</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          刻印は目立つ場所には打たれません。身につけたときに見えない面に入っています。
        </p>
        <div className="flex flex-col gap-4">
          <RingDiagram />
          <ClaspDiagram />
          <EarringDiagram />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">
          文字は1mmに満たないことも多く、明るいところで拡大鏡やスマートフォンのカメラを
          使うと読みやすくなります。長く使った品物では擦れて薄くなっていることもあります。
        </p>
      </section>

      {/* 2. 何が書いてあるか */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">「K18」と「750」は同じ意味</h2>
        <div className="mb-4">
          <StampTypesDiagram />
        </div>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          金の純度の書き方は2通りあります。Kのあとに数字を置く24分率と、
          1000分の何かで表す千分率です。K18は18/24で75%、千分率なら750。
          どちらも同じ品位を指しています。
        </p>
        <div className="mb-4 overflow-x-auto">
          <table className="w-full min-w-[380px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-2 pr-3 font-medium">刻印（K表記）</th>
                <th className="py-2 pr-3 font-medium">千分率</th>
                <th className="py-2 text-right font-medium">含有率</th>
              </tr>
            </thead>
            <tbody>
              {GOLD_MARKS.map((p) => (
                <tr key={p} className="border-b border-border/60">
                  <td className="py-2 pr-3">{PURITY_LABELS[p]}</td>
                  <td className="py-2 pr-3 tabular-nums text-muted">
                    {Math.round(PURITY_FINENESS[p] * 1000)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {(PURITY_FINENESS[p] * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-foreground/80">
          プラチナは{PT_MARKS.map((p) => PURITY_LABELS[p]).join("・")}のように、
          Ptのあとに千分率をそのまま書きます。銀はSVやSILVERのあとに925などと入ります。
        </p>
      </section>

      {/* 3. 造幣局のホールマーク */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          「K18」はメーカーの表示で、公的な証明ではありません
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          意外に知られていないのですが、K18やPt900という刻印は、その製品を作った側が
          打っているものです。造幣局はこの点をはっきり書いています。
        </p>
        <figure className="my-4 border-l-2 border-accent/50 pl-4">
          <blockquote className="text-sm leading-relaxed text-foreground/80">
            K18、Pt900などの記号は造幣局の証明記号ではありません。
          </blockquote>
          <figcaption className="mt-1 text-xs text-muted">
            造幣局「貴金属製品の品位区分と証明記号」より
          </figcaption>
        </figure>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          公的な証明は造幣局のホールマークで、日の丸と、ひし形の中に千分率の数字、
          そして金属を示す記号の組み合わせです。金では999・916・750・585・416・375、
          プラチナでは900・850・700、銀では1000・925・900・800・750が使われます。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          この違いは金額にも表れます。当サイトが掲載しているおたからやは、公表しているK24の価格を
          「ホールマーク（造幣局刻印）付きのメダルや小判など、特定の製品を基準とした参考買取価格」とし、
          アクセサリーなどのスクラップは査定額が異なる場合があると明記しています。
        </p>
      </section>

      {/* 4. GP/GF */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          K18のうしろに2文字あったら、金そのものではありません
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          ここがいちばん間違えやすいところです。「K18GP」は一見K18に見えますが、
          意味はまったく違います。土台は別の金属で、表面だけが金です。
          買取価格は金の重さで決まるので、金額も大きく変わります。
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
        <p className="text-sm leading-relaxed text-foreground/80">
          刻印を読むときは、数字のあとに英字が続いていないかまで確かめてください。
          擦れていると見落としやすい部分です。
        </p>
      </section>

      {/* 5. 読めないとき */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">刻印が見つからない・読めないとき</h2>
        <ul className="mb-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-foreground/80">
          <li>小さい品物や、細いチェーンには、そもそも刻印がないことがあります。</li>
          <li>
            磁石にはっきりくっつくなら、土台が鉄やニッケルの可能性があります。
            ただし逆は言えません。詳しくは
            <Link href="/column/plating-check" className="mx-1 underline underline-offset-2">
              メッキと金の簡単な見分け方
            </Link>
            にまとめています。
          </li>
          <li>
            確実に知るには査定を受けることになります。多くの買取店では、
            査定だけなら費用はかかりません。
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-foreground/80">
          当サイトでも、純度が分からない品物の金額を出すことはできません。
          刻印が読めたら、その純度で各社の価格を比べてください。
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
    </div>
  );
}
