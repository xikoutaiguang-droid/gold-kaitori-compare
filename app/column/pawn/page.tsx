import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import { PAWN_CHECKED_AT, PAWN_QUOTES } from "@/lib/pawnLaw";
import type { LawQuote } from "@/lib/taxLaw";

const PATH = "/column/pawn";

/**
 * 条文と店の記載は lib/pawnLaw.ts に置いてある。
 * 本文に文字列で書くと、相手が書き換えても気づけない。
 * あちらは scripts/verify-quotes.mjs が毎日取り直して照合している。
 */

function Quote({ entry, highlight }: { entry: LawQuote; highlight?: boolean }) {
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
          rel="noopener noreferrer nofollow"
          className="underline underline-offset-2"
        >
          {entry.label}
        </a>
        （{PAWN_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "質屋に金を持ち込むと、売ったことにはなりません",
    description:
      "質入れは売買ではなく、品物を預けてお金を借りる契約です。" +
      "預かり期間が3か月を下回らないこと、期限前ならいつでも受け戻せること、" +
      "期限を過ぎると所有権が移ること、利息の上限が貸金業と違うことを質屋営業法の条文で確かめました。" +
      "実際の質屋の記載も合わせて引いています。",
    alternates: { canonical: PATH },
  };
}

export default function PawnPage() {
  const meta = generateMetadata();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, meta), columnBreadcrumb(PATH, meta)]} />

      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>

      <h1 className="font-serif-jp mb-3 text-2xl font-semibold leading-snug sm:text-3xl">
        質屋に金を持ち込むと、売ったことにはなりません
      </h1>

      <p className="mb-4 text-base leading-relaxed">
        金の買取店を探していると、質屋も一緒に出てきます。
        同じ店が「売る」と「預ける」の両方を扱っていることも多く、カウンターも同じです。
        ただし契約は別のもので、守っている法律も違います。
      </p>
      <p className="mb-8 text-base leading-relaxed">
        買取は売買で、その場で所有権が相手に移ります。質入れは
        <strong>品物を預けてお金を借りる</strong>契約で、返せば品物は戻ります。
        何が決まっているのかを、質屋営業法の条文で確かめました。
      </p>

      {/* ---- 1. 定義 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">質屋営業は、買い取る商売ではない</h2>
        <Quote entry={PAWN_QUOTES.definition} />
        <p className="mb-3 text-base leading-relaxed">
          条文の最後は「金銭を貸し付ける営業をいう」で終わります。品物は担保で、
          返さなかったときに代わりに充てるもの、という組み立てです。
          店の説明も同じ書き方をしています。
        </p>
        <Quote entry={PAWN_QUOTES.shopLoan} />
      </section>

      {/* ---- 2. 3か月 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">預けられる期間は、3か月を下回らない</h2>
        <p className="mb-3 text-base leading-relaxed">
          期限は店が決めますが、短くできる下限が法律で止められています。
        </p>
        <Quote entry={PAWN_QUOTES.threeMonths} highlight />
        <p className="mb-3 text-base leading-relaxed">
          「三月未満の期間で定めてはならない」ので、個人が持ち込む場合は最低でも3か月あります。
          実際の店の案内も3か月です。
        </p>
        <Quote entry={PAWN_QUOTES.shopThreeMonths} />
        <Quote entry={PAWN_QUOTES.shopExtend} />
        <p className="text-base leading-relaxed">
          延長できるかどうかは店によります。延長の条件は法律ではなく各店の約定なので、
          預ける前にその店の掲示を読んでください。
        </p>
      </section>

      {/* ---- 3. 受け戻し ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">期限前なら、いつでも戻せる</h2>
        <Quote entry={PAWN_QUOTES.redeem} />
        <p className="text-base leading-relaxed">
          「いつでも」と書かれているので、3か月待つ必要はありません。
          相場が上がったから売ることにした、翌週に返せるようになった、どちらでも構いません。
          ただし戻すには元金と利息（店によっては保管料と呼びます）の両方が要ります。
        </p>
      </section>

      {/* ---- 4. 流質 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          期限を過ぎると所有権は移る。ただし借金は残らない
        </h2>
        <Quote entry={PAWN_QUOTES.forfeit} highlight />
        <p className="mb-3 text-base leading-relaxed">
          期限を過ぎた時点で、品物は質屋のものになります。これを流質といいます。
          同じことを店はこう書いています。
        </p>
        <Quote entry={PAWN_QUOTES.shopForfeit} />
        <Quote entry={PAWN_QUOTES.shopNoDebt} />
        <p className="mb-3 text-base leading-relaxed">
          品物を失う代わりに、返せなかったお金の請求は残りません。ここが借入れと違うところで、
          貸した側は品物で回収を終えます。
          品物の値段が借りた額より高くても、差額が戻ってくるわけではありません。
        </p>
        <p className="text-base leading-relaxed">
          なお、質入れ自体は売買ではありませんが、流質で所有権が移ったあとの税の扱いは事情によって変わります。
          売った場合の考え方は{" "}
          <Link href="/column/tax" className="underline underline-offset-2">
            金を売って税金がかかるのは、売った額ではなくもうけです
          </Link>
          にまとめていますが、質流れに当てはまるかどうかは税務署か税理士に確認してください。
        </p>
      </section>

      {/* ---- 5. 利息 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">利息の上限は、ふつうの借入れと違う</h2>
        <p className="mb-3 text-base leading-relaxed">
          質屋営業法の第36条は、出資法の金利の上限を読み替える条文です。
          ほかの貸付けでは年20パーセントとされているところが、質屋についてはこうなります。
        </p>
        <Quote entry={PAWN_QUOTES.interestCap} highlight />
        <p className="mb-3 text-base leading-relaxed">
          年109.5パーセント。1日あたり0.3パーセントという書き方も並んでいます。
          これは<strong>上限であって、各店がこの率で貸しているという意味ではありません</strong>。
          実際の率は店ごとに違い、同法は利息計算の方法と流質期限を店に掲示させています。
          預ける前に、その掲示を読んでください。
        </p>
        <p className="text-base leading-relaxed">
          少額を短期間借りる前提の商売なので上限が高く置かれていますが、
          3か月で受け戻すつもりなら、その3か月ぶんの利息が品物を取り戻す値段になります。
          手元の品をいくらで評価してもらえるかではなく、戻すときにいくら払うかで考える必要があります。
        </p>
      </section>

      {/* ---- 6. 審査 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">審査がないのは、品物で見ているから</h2>
        <Quote entry={PAWN_QUOTES.shopNoScreening} />
        <p className="text-base leading-relaxed">
          貸す相手ではなく預かる品物を見るので、収入や勤め先を聞かれません。
          一方で、本人確認は買取と同じく必要です。身分証について法律が何を求めているかは{" "}
          <Link href="/column/identity-check" className="underline underline-offset-2">
            1万円未満なら、法律は本人確認を求めていない
          </Link>
          で条文を引いています。
        </p>
      </section>

      {/* ---- 7. 選び方 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">売るか、預けるか</h2>
        <div className="mb-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full table-fixed text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="w-20 px-3 py-2 font-medium" />
                <th className="px-3 py-2 font-medium">売る（買取）</th>
                <th className="px-3 py-2 font-medium">預ける（質）</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-3 py-2 font-medium">品物</td>
                <td className="px-3 py-2">その場で相手のものになる</td>
                <td className="px-3 py-2">期限内に返せば戻る</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2 font-medium">あとで払うもの</td>
                <td className="px-3 py-2">なし</td>
                <td className="px-3 py-2">元金と利息</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2 font-medium">返せないとき</td>
                <td className="px-3 py-2">—</td>
                <td className="px-3 py-2">品物で終わり、請求は残らない</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">金額の目安</td>
                <td className="px-3 py-2">各社が1gあたりの価格を公表している</td>
                <td className="px-3 py-2">融資額は公表されていない</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-3 text-base leading-relaxed">
          買取のほうは、各社が1gあたりの価格を出しているので、持っていく前に比べられます。
          融資額を1gあたりで公表している質屋は、当サイトが見ている範囲にはありません。
          そのため「質に入れるといくら借りられるか」は、こちらでは比べられません。
        </p>
        <p className="text-base leading-relaxed">
          手放してよい品なら、まず
          <Link href="/compare" className="underline underline-offset-2">
            買取価格の比較
          </Link>
          で各社の単価と差し引きを見るほうが、金額をはっきりさせられます。
          手放したくない品を担保にお金を用意したい、という場合が質屋の出番です。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          条文は e-Gov 法令検索の原文から、店の記載は公式サイトから、いずれも{PAWN_CHECKED_AT}に
          読んで転記しました。要約ではなく、書かれている文をそのまま引いています
          （店の引用は、送り仮名や表記も直さずそのままです）。
          引用した文が出典から消えていないかは、当サイトの日次の点検で毎日取り直して照合しています。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          当サイトは法律の専門家ではありません。ここに書いたのは「条文と店の案内に何と書いてあるか」で、
          個別の契約がどうなるかの判断ではありません。
          利率も期限も延長の条件も店ごとに違い、法律は下限と上限を定めているだけです。
          実際に預けるときは、その店の掲示と約定を読んでください。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
