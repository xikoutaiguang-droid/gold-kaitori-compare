import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import ColumnHero from "@/components/ColumnHero";
import {
  EXCLUDED_GOODS,
  IDENTITY_CHECKED_AT,
  IDENTITY_QUOTES,
  SHOP_RULE_QUOTES,
  type ShopRuleQuote,
} from "@/lib/identityLaw";
import type { LawQuote } from "@/lib/taxLaw";

const PATH = "/column/identity-check";

/**
 * 条文と各社の規約は lib/identityLaw.ts に置いてある。
 *
 * 以前はこのページの中に直接書いていて、URLも定数で組んでいたため、
 * 日次の照合(scripts/verify-quotes.mjs)の対象外だった。
 * 法令が改正されても各社が規約を書き換えても気づけない状態だったので、向こうに移した。
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
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {entry.label}
        </a>
        （e-Gov法令検索、{IDENTITY_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

function ShopQuote({ entry, children }: { entry: ShopRuleQuote; children?: React.ReactNode }) {
  return (
    <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
      <p>「{entry.quote}」</p>
      {children}
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
        （当サイトが{IDENTITY_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

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

      <ColumnHero href={PATH} />

      <p className="mb-8 text-base leading-relaxed">
        金を売ろうとすると、どの店でも身分証を求められます。「身分証なしで売れる店」を探している人もいますが、まず法律が何を求めているかを条文で確かめました。結果として、求めていない場合があります。
      </p>

      {/* ---- 1. 原則 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">原則は「確認しなければならない」</h2>
        <p className="mb-3 text-base leading-relaxed">
          買取店は古物商です。古物営業法の第15条に、こう書かれています。
        </p>
        <Quote entry={IDENTITY_QUOTES.principle} />
        <Quote entry={IDENTITY_QUOTES.whatToConfirm} />
        <p className="text-base leading-relaxed">
          確認するのは<strong>住所・氏名・職業・年齢</strong>
          の4つです。「身分証を見せること」とは書かれていません。署名入りの文書を出す方法や、電子署名による方法も並んでいて、身分証の提示はそのうちの一つの実務的なやり方です。
        </p>
      </section>

      {/* ---- 2. 例外 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">例外として、1万円未満は要りません</h2>
        <p className="mb-3 text-base leading-relaxed">同じ第15条の第2項に、例外が置かれています。</p>
        <Quote entry={IDENTITY_QUOTES.exception} />
        <Quote entry={IDENTITY_QUOTES.underAmount} />
        <p className="mb-3 text-base leading-relaxed">その金額は、規則のほうに書かれています。</p>
        <Quote entry={IDENTITY_QUOTES.amount} highlight />
        <p className="mb-3 text-base leading-relaxed">
          ただし条文には「ただし一部の古物は除く」という但し書きが付いています。その一覧も同じ規則に並んでいます。
        </p>
        <Quote entry={IDENTITY_QUOTES.excludedIntro} />
        <ul className="mb-3 list-disc space-y-1 rounded-xl border border-border bg-surface p-4 pl-9 text-sm leading-relaxed">
          {EXCLUDED_GOODS.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed">
          <strong>貴金属は入っていません。</strong>
          つまり1万円未満で金を売るとき、古物営業法は本人確認を義務づけていません。それでも店が求めるのは、法律が禁じていないからではなく、店の側の判断です。買い取った相手を帳簿に記録する義務が別にあり（第16条）、後から足りないことに気づいても遡れないので、はじめから全員に求めるのが実務になっています。
        </p>
      </section>

      {/* ---- 3. 送って売る場合 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          送って売るときに、身分証の「厚み」を撮らされる理由
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          宅配買取では、顔と身分証をスマートフォンで撮って送る方式（eKYC）が使われます。身分証を平らに撮るだけでなく、斜めから厚みを撮らされることがあります。これは店の思いつきではなく、規則に書かれている方法です。
        </p>
        <Quote entry={IDENTITY_QUOTES.ekycThickness} />
        <p className="mb-3 text-base leading-relaxed">
          厚みを求めているのは、画面に映した画像やコピーで済ませられないようにするためです。実際に、この条番号をそのまま引いて説明している社があります。
        </p>
        <ShopQuote entry={SHOP_RULE_QUOTES.ekyc} />
        <ShopQuote entry={SHOP_RULE_QUOTES.ekycHold} />
        <p className="text-base leading-relaxed">
          査定は進むが振込は止まる、という形です。送ってから気づくと品物だけ先方にある状態になるので、申し込む前に済ませておくほうが早く終わります。送って売るときの返送料や少額時の差し引きは
          <Link href="/column/mail-in-purchase" className="underline underline-offset-2 hover:text-accent">
            宅配買取の記事
          </Link>
          にまとめています。
        </p>
      </section>

      {/* ---- 4. 18歳未満 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          18歳未満は、親の同意書があっても売れません
        </h2>
        <p className="mb-3 text-base leading-relaxed">
          確認する4つに「年齢」が入っているのは、売れる年齢に制限があるからです。条例まで含めて、はっきり断っている社があります。
        </p>
        <ShopQuote entry={SHOP_RULE_QUOTES.minor} />
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
        <ShopQuote entry={SHOP_RULE_QUOTES.idList} />
        <ShopQuote entry={SHOP_RULE_QUOTES.idKinds} />
        <p className="mb-3 text-base leading-relaxed">
          同社が挙げているのは運転免許証・健康保険証・パスポート・外国人登録証明書・住基カードです。金額が大きいときは、案内そのものが別になります。
        </p>
        <ShopQuote entry={SHOP_RULE_QUOTES.overTwoMillion} />
        <p className="mb-3 text-base leading-relaxed">
          200万円を超えると扱いが変わるのは、古物営業法とは別の法律（犯罪収益移転防止法）によるものです。まとまった量を持ち込む予定なら、先に店へ連絡しておくほうが当日が早く済みます。
        </p>
        <p className="mb-3 text-base leading-relaxed">振込で受け取る場合、口座にも条件が付きます。</p>
        <ShopQuote entry={SHOP_RULE_QUOTES.account} />
        <p className="text-base leading-relaxed">
          家族名義の口座には振り込めません。身分証の住所が今の住所と違っていると、ここで止まります。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記事について</h2>
        <p className="text-xs leading-relaxed text-muted">
          法令の引用は e-Gov 法令検索の原文から、各社の記載は公式サイトから、いずれも
          {IDENTITY_CHECKED_AT}
          に読んで転記したものです。要約ではなく、書かれている文をそのまま引いています。引用した文が出典から消えていないかは、当サイトの日次の点検で毎日取り直して照合しています。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          法令は改正されることがあり、各社の規約も予告なく変わります。当サイトは法律の専門家ではないため、個別の事情については店や専門家にご確認ください。ここに書いたのは「条文に何と書いてあるか」であって、特定の取引が適法かどうかの判断ではありません。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
