import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR_NAME } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "このサイトについて｜運営方針とデータの集め方",
  description:
    "金買取相場比較がどのように運営され、価格データや信頼度スコアをどう集めているかを分かりやすく説明します。特定の買取店の運営ではなく、独立した立場で比較情報を提供しています。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">このサイトについて</h1>
      <p className="mb-8 text-base text-muted">
        安心してご利用いただけるよう、運営方針とデータの集め方を包み隠さずご説明します。
      </p>

      <div className="flex flex-col gap-8 text-base leading-relaxed">
        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">どこが運営していますか？</h2>
          <p>
            当サイトは「{OPERATOR_NAME}」が個人で運営しており、掲載しているどの買取店とも資本関係のない、
            独立した立場で比較情報をまとめています。祖母の遺品整理で指輪やネックレスを手放した際、お店ごとの
            査定額の差に驚いたことがこのサイトを作るきっかけでした。特定の会社を優遇したり、裏で表示順を操作したりすることはありません。
            掲載している会社の並び順は、選んだ純度・条件に基づいた価格やスコアの計算結果をそのまま表示しています。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">価格データはどうやって集めていますか？</h2>
          <p>
            各買取店が公式サイトで公表している買取参考価格を、日次で自動的に取得しています。
            当サイト独自の価格を作ったり、相場を予想したりすることはありません。あくまで「各社が
            自分たちのサイトで公表している数字」をそのまま並べて比較できるようにしています。
          </p>
          <p className="mt-2">
            ページ内に「更新日」を必ず表示しているので、いつ時点の情報かをご自身で確認いただけます。
            取得できていない項目は、正直に「データ取得中」と表示し、不確かな数字を埋めることはしません。
            また、買取店側がそもそも1g単価を公式サイトで公表していない場合は「公式に価格表示なし」と表示し、
            未取得と未公表を区別しています。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">「信頼度目安」「口コミ★評価」は何ですか？</h2>
          <p>
            <strong>信頼度目安</strong>は、店舗数・上場の有無・資本提携などの公開情報から算出した1〜5の目安です。
            接客の良し悪しなど、数値化できない部分は含まれていません。
          </p>
          <p className="mt-2">
            <strong>口コミ★評価</strong>は、各社の代表的な店舗をいくつか選び、Googleマップ上の評価・件数を
            集計した参考値です。全店舗を網羅した数字ではなく、またサンプル数が少ない場合は
            「サンプル少なめ・要注意」と明示しています。同名の無関係な店舗が紛れ込まないよう、
            公式サイトのドメインと一致する店舗だけを対象にする仕組みを入れています。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">広告・アフィリエイトについて</h2>
          <p>
            当サイトの運営には、Google
            AdSense等の広告や、買取店の一部とのアフィリエイトプログラムによる収益を充てている場合があります。
            アフィリエイトリンクを含むリンクには「PR」の表示を付けており、提携の有無によって掲載価格の並び順や
            信頼度目安を操作することはありません。詳しくは
            <Link href="/privacy" className="mx-1 text-accent-strong hover:underline">
              プライバシーポリシー
            </Link>
            をご覧ください。
          </p>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">ご利用にあたって</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>当サイトは買取店そのものではなく、比較のための情報サイトです。売買契約や査定は各買取店と直接行っていただきます。</li>
            <li>掲載価格・概算金額は目安であり、実際の査定額を保証するものではありません。</li>
            <li>会員登録や個人情報の入力なしに、価格比較・シミュレーターをご利用いただけます。</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif-jp mb-2 text-lg font-semibold">お問い合わせ</h2>
          <p>
            運営者情報・お問い合わせ先は
            <Link href="/privacy" className="mx-1 text-accent-strong hover:underline">
              プライバシーポリシー
            </Link>
            のページに記載しています。
          </p>
        </section>
      </div>
    </div>
  );
}
