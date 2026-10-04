import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";

const PATH = "/column/identity-check";

// 条文は価格と違って毎日は動かない。ただし改正はあるので、引用には必ず
// 「いつ読んだか」を添える。数字を本文に書くのは、この確認日だけにする。
const CHECKED_AT = "2026年10月4日";
const EGOV_ACT = "https://laws.e-gov.go.jp/law/324AC0000000108";
const EGOV_RULE = "https://laws.e-gov.go.jp/law/407M50400000010";
const NEXUS_BUY = "https://www.nexus13.co.jp/buy/";
const REFASTA_TERMS = "https://kinkaimasu.jp/kiyaku/";

export function generateMetadata(): Metadata {
  return {
    title: "1万円未満なら、法律は本人確認を求めていない",
    description:
      "金を売るとき身分証を求められるのはなぜか。古物営業法第15条の条文と、国家公安委員会規則の金額(1万円)、" +
      "その例外から外される古物の一覧を e-Gov の原文で確認しました。貴金属はその一覧に入っていません。" +
      "宅配買取のeKYC、18歳未満が売れない理由、口座が本人名義に限られることも各社の規約から整理しています。",
    alternates: { canonical: PATH },
  };
}

export default function IdentityCheckPage() {
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
        1万円未満なら、法律は本人確認を求めていない
      </h1>

      <p className="mb-8 text-base leading-relaxed">
        金を売ろうとすると、どの店でも身分証を求められます。「身分証なしで売れる店」を探している人もいますが、まず法律が何を求めているかを条文で確かめました。結果として、求めていない場合があります。
      </p>

      {/* ---- 1. 原則 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">原則は「確認しなければならない」</h2>
        <p className="mb-3 text-base leading-relaxed">
          買取店は古物商です。古物営業法の第15条に、こう書かれています。
        </p>
        <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          <p>
            「古物商は、古物を買い受け、若しくは交換し、又は売却若しくは交換の委託を受けようとするときは、相手方の真偽を確認するため、次の各号のいずれかに掲げる措置をとらなければならない。」
          </p>
          <p className="mt-2">「一 相手方の住所、氏名、職業及び年齢を確認すること。」</p>
          <footer className="mt-2 text-xs text-muted">
            出典:{" "}
            <a
              href={EGOV_ACT}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              古物営業法（昭和二十四年法律第百八号）第15条
            </a>
            （e-Gov法令検索、{CHECKED_AT}に確認）
          </footer>
        </blockquote>
        <p className="text-base leading-relaxed">
          確認するのは<strong>住所・氏名・職業・年齢</strong>の4つです。「身分証を見せること」とは書かれていません。署名入りの文書を出す方法や、電子署名による方法も並んでいて、身分証の提示はそのうちの一つの実務的なやり方です。
        </p>
      </section>

      {/* ---- 2. 例外 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">例外として、1万円未満は要りません</h2>
        <p className="mb-3 text-base leading-relaxed">同じ第15条の第2項に、例外が置かれています。</p>
        <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          <p>「前項の規定にかかわらず、次に掲げる場合には、同項に規定する措置をとることを要しない。」</p>
          <p className="mt-2">
            「一 対価の総額が国家公安委員会規則で定める金額未満である取引をする場合（特に前項に規定する措置をとる必要があるものとして国家公安委員会規則で定める古物に係る取引をする場合を除く。）」
          </p>
        </blockquote>
        <p className="mb-3 text-base leading-relaxed">その金額は、規則のほうに書かれています。</p>
        <blockquote className="mb-3 rounded-xl border border-accent/30 bg-accent-soft/40 p-4 text-sm leading-relaxed">
          <p>「法第十五条第二項第一号の国家公安委員会規則で定める金額は、一万円とする。」</p>
          <footer className="mt-2 text-xs text-muted">
            出典:{" "}
            <a
              href={EGOV_RULE}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              古物営業法施行規則（平成七年国家公安委員会規則第十号）第16条
            </a>
            （e-Gov法令検索、{CHECKED_AT}に確認）
          </footer>
        </blockquote>
        <p className="mb-3 text-base leading-relaxed">
          ただし条文には「ただし一部の古物は除く」という但し書きが付いています。その一覧も規則に並んでいて、次の5つです。
        </p>
        <ul className="mb-3 list-disc space-y-1 rounded-xl border border-border bg-surface p-4 pl-9 text-sm leading-relaxed">
          <li>自動二輪車及び原動機付自転車（部分品を含む）</li>
          <li>エアコンディショナーの室外ユニット及び電気温水機器のヒートポンプ</li>
          <li>専ら家庭用コンピュータゲームに用いられるプログラムを記録した物</li>
          <li>光学的方法により音又は影像を記録した物</li>
          <li>グレーチング（金属製のものに限る）</li>
        </ul>
        <p className="text-base leading-relaxed">
          <strong>貴金属は入っていません。</strong>
          つまり1万円未満で金を売るとき、古物営業法は本人確認を義務づけていません。それでも店が求めるのは、法律が禁じていないからではなく、店の側の判断です。買い取った相手を帳簿に記録する義務が別にあり（第16条）、後から足りないことに気づいても遡れないので、はじめから全員に求めるのが実務になっています。
        </p>
      </section>

      {/* ---- 3. 送って売る場合 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">送って売るときに、身分証の「厚み」を撮らされる理由</h2>
        <p className="mb-3 text-base leading-relaxed">
          宅配買取では、顔と身分証をスマートフォンで撮って送る方式（eKYC）が使われます。身分証を平らに撮るだけでなく、斜めから厚みを撮らされることがあります。これは店の思いつきではなく、規則に書かれている方法です。
        </p>
        <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          <p>
            「…当該古物商が提供するソフトウェアを使用して、本人確認用画像情報（当該相手方に当該ソフトウェアを使用して撮影をさせた当該相手方の容貌及び身分証明書等…の画像情報であって、当該写真付き身分証明書等に係る画像情報が、当該写真付き身分証明書等に記載された住所、氏名及び年齢又は生年月日、当該写真付き身分証明書等に貼り付けられた写真
            <strong>並びに当該写真付き身分証明書等の厚みその他の特徴</strong>
            を確認することができるものをいう。）の送信を受けること」
          </p>
          <footer className="mt-2 text-xs text-muted">
            出典:{" "}
            <a
              href={EGOV_RULE}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              古物営業法施行規則 第15条
            </a>
            （e-Gov法令検索、{CHECKED_AT}に確認）
          </footer>
        </blockquote>
        <p className="mb-3 text-base leading-relaxed">
          厚みを求めているのは、画面に映した画像やコピーで済ませられないようにするためです。実際に、この条番号をそのまま引いて説明している社があります。
        </p>
        <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          <p>
            「古物営業法施行規則第15条第3項第8号に定める方法により、マイページにご登録の上、身分証（表面・裏面・厚みの画像）及びお客様の容貌（セルフィー）の撮影・送信によるeKYC手続きが完了しているお客様については、査定完了後、通常のお振込方法にてお支払いいたします。」
          </p>
          <p className="mt-2">
            「お品物の査定は、eKYC手続きが未完了の場合であっても通常通り行いますが、買取代金のお振込みは、eKYC手続きが完了するまで行うことができません。」
          </p>
          <footer className="mt-2 text-xs text-muted">
            出典:{" "}
            <a
              href={REFASTA_TERMS}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-2"
            >
              リファスタ「ご利用規約」第7条
            </a>
            （当サイトが{CHECKED_AT}に確認）
          </footer>
        </blockquote>
        <p className="text-base leading-relaxed">
          査定は進むが振込は止まる、という形です。送ってから気づくと品物だけ先方にある状態になるので、申し込む前に済ませておくほうが早く終わります。送って売るときの返送料や少額時の差し引きは
          <Link href="/column/mail-in-purchase" className="mx-1 underline underline-offset-2 hover:text-accent">
            宅配買取の記事
          </Link>
          にまとめています。
        </p>
      </section>

      {/* ---- 4. 18歳未満 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">18歳未満は、親の同意書があっても売れません</h2>
        <p className="mb-3 text-base leading-relaxed">
          確認する4つに「年齢」が入っているのは、売れる年齢に制限があるからです。条例まで含めて、はっきり断っている社があります。
        </p>
        <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          <p>
            「18歳未満の方からのお買取は、古物営業法、及び東京都青少年の健全な育成に関する条例第15条第2項（質受け及び古物買受けの制限）により致しかねます。
            <strong>弊社の場合、保護者の同意書があっても当サービスをご利用頂く事は出来ません。</strong>」
          </p>
          <footer className="mt-2 text-xs text-muted">
            出典:{" "}
            <a
              href={REFASTA_TERMS}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-2"
            >
              リファスタ「ご利用規約」第6条
            </a>
            （当サイトが{CHECKED_AT}に確認）
          </footer>
        </blockquote>
        <p className="text-base leading-relaxed">
          条例は都道府県ごとに定められているため、線の引き方は店や地域で違います。家族の品物を代わりに持ち込む場合も、買取契約を結ぶのは持ち込んだ本人になります。親の物を子が売る、といった形を考えているなら、先にその店に確認してください。
        </p>
      </section>

      {/* ---- 5. 実務 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">店に持っていくとき、実際に何が要るか</h2>
        <p className="mb-3 text-base leading-relaxed">
          求められる身分証の種類を具体的に書いている社があります。
        </p>
        <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          <p>
            「買取ご成約の際はご本人様の確認が必要となります。次の身分証明証のいずれかを必ずお持ちください。・運転免許証 ・健康保険証 ・パスポート ・外国人登録証明書 ・住基カード」
            <br />
            「200万円を超えるお取引きの場合はこちら」
          </p>
          <footer className="mt-2 text-xs text-muted">
            出典:{" "}
            <a
              href={NEXUS_BUY}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-2"
            >
              ネクサス「店頭買取」
            </a>
            （当サイトが{CHECKED_AT}に確認）
          </footer>
        </blockquote>
        <p className="mb-3 text-base leading-relaxed">
          200万円を超えると別の案内になるのは、古物営業法とは別の法律（犯罪収益移転防止法）で扱いが変わるためです。まとまった量を持ち込む予定なら、先に店へ連絡しておくほうが当日が早く済みます。
        </p>
        <p className="text-base leading-relaxed">
          振込で受け取る場合、口座にも条件が付きます。「買取代金の支払い先となる銀行口座は、お客様の本人確認書類に記載されているお客様ご自身の名義の口座に限定されます」と書いている社があり（
          <a
            href={REFASTA_TERMS}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline underline-offset-2"
          >
            リファスタ「ご利用規約」
          </a>
          、{CHECKED_AT}確認）、家族名義の口座には振り込めません。身分証の住所が今の住所と違っていると、ここで止まります。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          法令の引用は e-Gov 法令検索の原文から、各社の記載は公式サイトから、いずれも{CHECKED_AT}に読んで転記したものです。要約ではなく、書かれている文をそのまま引いています。法令は改正されることがあり、各社の規約も予告なく変わります。当サイトは法律の専門家ではないため、個別の事情については店や専門家にご確認ください。ここに書いたのは「条文に何と書いてあるか」であって、特定の取引が適法かどうかの判断ではありません。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
