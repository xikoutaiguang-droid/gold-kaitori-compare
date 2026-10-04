import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import {
  NON_TAXABLE_ITEM_LIMIT,
  PAYMENT_RECORD_LIMIT,
  SPECIAL_DEDUCTION,
  formatGrams,
  gramsOfGold,
} from "@/lib/taxThresholds";
import { NTA_3105, NTA_3152, NTA_3161, NTA_AS_OF, TAX_CHECKED_AT, TAX_QUOTES } from "@/lib/taxLaw";

const PATH = "/column/tax";

/**
 * 条文と国税庁の文は lib/taxLaw.ts に置いてある。
 * 本文に文字列で書くと、相手が書き換えても気づけないため。
 * あちらは scripts/verify-quotes.mjs が毎日取り直して照合している。
 *
 * 金額(30万円・50万円・200万円)は条文の数字なので直接書く。
 * 「それが何グラムか」だけは相場で動くので lib/taxThresholds.ts で当日の値から出す。
 */

/** 条文も国税庁も「三十万円」「50万円」と書くので、桁区切りではなく万で出す */
const man = (n: number) => `${(n / 10_000).toLocaleString("ja-JP")}万円`;
/** 2026-10-02 のような記録上の日付を、文章に混ぜられる形にする */
const jpDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : iso;
};

function Quote({
  entry,
  highlight,
}: {
  entry: (typeof TAX_QUOTES)[string];
  highlight?: boolean;
}) {
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
        （{TAX_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "金を売って税金がかかるのは、売った額ではなくもうけです",
    description:
      "金の売却で出てくる30万円・50万円・200万円は、それぞれ非課税の線・特別控除・税務署に調書が出る線で、どれも別のことを指しています。" +
      "所得税法と同施行令の条文、国税庁タックスアンサーの原文で確かめました。" +
      "宝飾品と地金で扱いが違うこと、200万円が課税の基準ではないことも整理しています。",
    alternates: { canonical: PATH },
  };
}

export default function TaxPage() {
  const meta = generateMetadata();
  const g30 = gramsOfGold(NON_TAXABLE_ITEM_LIMIT);
  const g200 = gramsOfGold(PAYMENT_RECORD_LIMIT);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, meta), columnBreadcrumb(PATH, meta)]} />

      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>

      <h1 className="font-serif-jp mb-3 text-2xl font-semibold leading-snug sm:text-3xl">
        金を売って税金がかかるのは、売った額ではなくもうけです
      </h1>

      <p className="mb-4 text-base leading-relaxed">
        金を売ろうとして税金を調べると、30万円・50万円・200万円という数字が出てきます。この3つは別々のことを指していて、どれも「これを超えたら税金がかかる」という線ではありません。何がどの数字なのかを、所得税法とその施行令、国税庁のタックスアンサーの原文で確かめました。
      </p>
      <p className="mb-8 text-base leading-relaxed">
        先に結論だけ書くと、課税の対象になるのは売って受け取った金額ではなく、
        <strong>買ったときより高く売れたぶん</strong>です。買った値段を覚えていない昔の品でも、考え方は変わりません。
      </p>

      <p className="mb-8 text-sm leading-relaxed text-muted">
        条文まではいらない、要点だけ知りたいという場合は{" "}
        <Link href="/guide/tax" className="underline underline-offset-2">
          金・貴金属を売ったときの税金
        </Link>
        に、同じ内容をやさしくまとめています。
      </p>

      {/* ---- 1. 身につけていた品 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          ふだん使っていた品は、そもそも課税されない場合がある
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          所得税法は、生活に使っている動産を売ったときの所得には課税しないと定めています。
        </p>
        <Quote entry={TAX_QUOTES.nonTaxableAct} />
        <p className="mb-3 text-base leading-relaxed">
          「政令で定めるもの」の中身は、施行令のほうに書かれています。読み方が少しひねられていて、<strong>30万円を超えるものを「以外のもの」から外す</strong>
          という形になっています。
        </p>
        <Quote entry={TAX_QUOTES.nonTaxableOrder} highlight />
        <p className="mb-3 text-base leading-relaxed">
          その「次に掲げるもの」の一つめが、貴金属です。
        </p>
        <Quote entry={TAX_QUOTES.nonTaxableOrderItem} />
        <p className="mb-3 text-base leading-relaxed">
          国税庁の説明では、同じことがこう書かれています。
        </p>
        <Quote entry={TAX_QUOTES.dailyGoods} />
        <Quote entry={TAX_QUOTES.dailyGoodsException} />
        <p className="mb-3 text-base leading-relaxed">
          つまり1個または1組で{man(NON_TAXABLE_ITEM_LIMIT)}を超えなければ、生活に使っていた品を売った所得は課税されません。指輪やネックレスを1点売る、という多くの場合はここに収まります。
          {g30 && (
            <>
              {" "}
              {man(NON_TAXABLE_ITEM_LIMIT)}は、{g30.source}が{jpDate(g30.updatedAt)}に公表した
              1gあたり{Math.round(g30.unitPrice).toLocaleString("ja-JP")}円で換算すると、純金で約
              {formatGrams(g30.grams)}gにあたります。
            </>
          )}
        </p>
        <p className="text-base leading-relaxed">
          ただし前提として、条文は「生活の用に供する」資産と書いています。値上がりを見込んで買ったインゴットは、身につけていた指輪とは扱いが違います。手元の品がどちらなのかは書類や経緯で決まるので、迷う場合は税務署か税理士に確認してください。
        </p>
      </section>

      {/* ---- 2. 地金 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">地金は、金額に関係なく譲渡所得になる</h2>
        <Quote entry={TAX_QUOTES.bullionIsCapitalGain} />
        <p className="text-base leading-relaxed">
          「総合課税」とは、給与などほかの所得と合算してから税率をかけるという意味です。株式の売却益のように、そこだけ切り離して一定の税率で終わる形ではありません。そのため、同じ利益でも人によって税額が変わります。
        </p>
      </section>

      {/* ---- 3. もうけ ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          計算の出発点は、売った額から買った額を引いたもの
        </h2>
        <p className="mb-3 text-base leading-relaxed">国税庁の計算式はこうです。</p>
        <Quote entry={TAX_QUOTES.gainFormula} />
        <p className="mb-3 text-base leading-relaxed">
          ここからさらに、{man(SPECIAL_DEDUCTION)}が引かれます。
        </p>
        <Quote entry={TAX_QUOTES.deductionFormula} highlight />
        <Quote entry={TAX_QUOTES.deductionCap} />
        <p className="mb-3 text-base leading-relaxed">この50万円は、条文では次のように置かれています。</p>
        <Quote entry={TAX_QUOTES.specialDeductionAct} />
        <p className="mb-3 text-base leading-relaxed">
          {man(SPECIAL_DEDUCTION)}は<strong>売った額ではなく、もうけから引く額</strong>です。
          100万円で売れたとしても、買ったのが80万円なら、もうけは20万円。特別控除の{man(SPECIAL_DEDUCTION)}に届かないので、その年にほかの総合課税の譲渡益が無ければ課税される譲渡所得は出ません（売るためにかかった費用も引けます）。
        </p>
        <p className="text-base leading-relaxed">
          注意したいのは、控除が<strong>その年の合計に対して1回だけ</strong>という点です。引用した注のとおり、金地金の譲渡益とそれ以外の総合課税の譲渡益を合わせて
          {man(SPECIAL_DEDUCTION)}が限度になります。何回かに分けて売っても、売るたびに{man(SPECIAL_DEDUCTION)}引けるわけではありません。
        </p>
      </section>

      {/* ---- 4. 5年 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">5年を超えて持っていた場合は、半分になる</h2>
        <p className="mb-3 text-base leading-relaxed">
          所有していた期間が5年を超えると長期譲渡所得になり、課税される額が半分になります。
        </p>
        <Quote entry={TAX_QUOTES.longTermHalf} highlight />
        <p className="text-base leading-relaxed">
          長期と短期の分かれ目は、買った日から売った日までの期間です。詳しい区分は国税庁の{" "}
          <a
            href={NTA_3152}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            No.3152「譲渡所得の計算のしかた(総合課税)」
          </a>
          にまとまっています。
        </p>
        <p className="mb-3 text-base leading-relaxed">
          相続や贈与で受け取った品は、自分が受け取った日から数えるのではありません。条文は、前の持ち主が持っていた期間を引き継ぐと定めています。
        </p>
        <Quote entry={TAX_QUOTES.inheritedHolding} />
        <p className="text-base leading-relaxed">
          親から受け継いだ指輪を翌年に売った場合でも、親が5年を超えて持っていたなら長期として計算します。受け取った日だけを見て短期と決めつけないでください（限定承認による相続など、この扱いから外れる場合が条文に挙げられています）。
        </p>
      </section>

      {/* ---- 5. 200万円 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          200万円は、税金の線ではなく「税務署に知らせがいく」線
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          よく見かける200万円は、所得税法の別の条文から来ています。まず、売った側に告知の義務があります。
        </p>
        <Quote entry={TAX_QUOTES.noticeActWho} />
        <Quote entry={TAX_QUOTES.noticeActWhat} />
        <Quote entry={TAX_QUOTES.noticeActObligation} />
        <p className="mb-3 text-base leading-relaxed">
          「政令で定める金額以下のものを除く」の金額が、施行令に置かれています。
        </p>
        <Quote entry={TAX_QUOTES.noticeLimit} highlight />
        <p className="mb-3 text-base leading-relaxed">
          そしてこの対価を支払った業者が、税務署に調書を出します。
        </p>
        <Quote entry={TAX_QUOTES.paymentRecord} />
        <p className="mb-3 text-base leading-relaxed">
          {man(PAYMENT_RECORD_LIMIT)}を超えると税金がかかる、という意味ではありません。かかるかどうかは前の章までの計算で決まり、ここで変わるのは
          <strong>税務署がその取引を把握するかどうか</strong>だけです。逆に{man(PAYMENT_RECORD_LIMIT)}以下なら申告しなくてよい、ということでもありません。
          {g200 && (
            <>
              {" "}
              {man(PAYMENT_RECORD_LIMIT)}は、{g200.source}の{jpDate(g200.updatedAt)}時点の価格で純金約{formatGrams(g200.grams)}gぶんです。
            </>
          )}
        </p>
        <p className="mb-3 text-base leading-relaxed">
          もう一つ、条文が対象にしているのは
          <strong>「金若しくは白金の地金又は金貨若しくは白金貨」</strong>です。
          K18のネックレスや指輪は、この条文でいう金地金等には当たりません。店頭で200万円を超える取引に別の案内が出ることはありますが、それは犯罪収益移転防止法など別の法律によるもので、ここで引いた条文とは別の話です。
        </p>
        <p className="text-base leading-relaxed">
          身分証を求められる1万円の線は、さらに別の法律（古物営業法）です。こちらは{" "}
          <Link href="/column/identity-check" className="underline underline-offset-2">
            1万円未満なら、法律は本人確認を求めていない
          </Link>
          で条文を引いています。
        </p>
      </section>

      {/* ---- 6. 継続 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">何度も売っていると、譲渡所得ではなくなる</h2>
        <Quote entry={TAX_QUOTES.continuousIsBusiness} />
        <p className="text-base leading-relaxed">
          事業所得や雑所得になると、{man(SPECIAL_DEDUCTION)}の特別控除も、
          5年超で半分になる扱いも使えません。家にあった品をまとめて手放すのと、売買を繰り返すのとでは、同じ「金を売る」でも別の扱いになります。
        </p>
      </section>

      {/* ---- 7. まとめ ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">3つの数字の整理</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full table-fixed text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="w-20 px-3 py-2 font-medium">金額</th>
                <th className="px-3 py-2 font-medium">何の線か</th>
                <th className="w-28 px-3 py-2 font-medium">根拠</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-3 py-2 tabular-nums">{man(NON_TAXABLE_ITEM_LIMIT)}</td>
                <td className="px-3 py-2">
                  1個または1組がこれを超えると、生活用動産の非課税から外れる
                </td>
                <td className="px-3 py-2">所得税法施行令25条</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2 tabular-nums">{man(SPECIAL_DEDUCTION)}</td>
                <td className="px-3 py-2">
                  もうけから引ける特別控除。売った額ではなく、その年の譲渡益の合計に対して1回
                </td>
                <td className="px-3 py-2">所得税法33条4項</td>
              </tr>
              <tr>
                <td className="px-3 py-2 tabular-nums">{man(PAYMENT_RECORD_LIMIT)}</td>
                <td className="px-3 py-2">
                  地金・金貨の売却で、業者が税務署に支払調書を出す線。課税の線ではない
                </td>
                <td className="px-3 py-2">所得税法施行令350条の7</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-base leading-relaxed">
          売る前に見ておくと分かりやすいのは、この順番です。手元の品が生活に使っていたものか、1個または1組で{man(NON_TAXABLE_ITEM_LIMIT)}を超えるか。超えるなら、買った値段より高く売れたか。高く売れたなら、その差が
          {man(SPECIAL_DEDUCTION)}を超えるか。{man(PAYMENT_RECORD_LIMIT)}は、この判断のどこにも出てきません。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          法令の引用は e-Gov 法令検索の原文から、国税庁の引用はタックスアンサー（{NTA_AS_OF}）から、いずれも{TAX_CHECKED_AT}に読んで転記しました。要約ではなく、書かれている文をそのまま引いています。引用した文が出典から消えていないかは、当サイトの日次の点検で毎日取り直して照合しています。金額をグラムに換算した箇所は、公表されている当日の参考価格から計算して表示しています。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          当サイトは税の専門家ではありません。ここに書いたのは「条文と国税庁の説明に何と書いてあるか」であって、個別の取引にどう当てはまるかの判断ではありません。取得費を示す書類が無い場合の扱いや、相続した品の所有期間、確定申告が要るかどうかは、事情によって変わります。実際の申告は、所轄の税務署か税理士にご確認ください。法令も国税庁の記載も改正・更新されることがあります。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          参考: 国税庁{" "}
          <a href={NTA_3161} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            No.3161 金地金の譲渡による所得
          </a>
          、{" "}
          <a href={NTA_3105} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            No.3105 譲渡所得の対象となる資産と課税方法
          </a>
          、{" "}
          <a href={NTA_3152} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            No.3152 譲渡所得の計算のしかた(総合課税)
          </a>
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
