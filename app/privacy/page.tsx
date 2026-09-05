import type { Metadata } from "next";
import { OPERATOR_NAME, CONTACT_FORM_URL, ADSENSE_PUBLISHER_ID, GA_MEASUREMENT_ID } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "金買取相場比較のプライバシーポリシー・個人情報の取り扱いについて",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-6 text-xl font-semibold sm:text-2xl">プライバシーポリシー</h1>

      <div className="flex flex-col gap-6 text-base leading-relaxed text-foreground/80">
        <section>
          <h2 className="mb-2 font-semibold text-foreground">運営者情報</h2>
          <p>
            本サイト「金買取相場比較」(以下「当サイト」)は、個人({OPERATOR_NAME})が運営しています。
            掲載しているどの買取店とも資本関係のない、独立した立場で運営しています。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">掲載情報について</h2>
          <p>
            当サイトに掲載している金・貴金属買取店の価格情報、店舗情報、信頼度スコア等は、
            各社公式サイト等の公開情報をもとにした参考値です。正確性・最新性を保証するものではなく、
            実際の取引内容は各社に直接ご確認ください。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">アクセス解析について</h2>
          <p>
            当サイトはVercel Analyticsを利用して、ページの閲覧状況を集計しています。Cookieを使用せず、
            個人を特定できる情報は取得しません。閲覧されたページや大まかな地域・端末の種類などを匿名の集計値として
            把握し、サイトの改善に役立てる目的でのみ利用します。
          </p>
          {GA_MEASUREMENT_ID && (
            <p className="mt-2">
              あわせてGoogle
              Analyticsも利用しています。こちらはCookieを使用して、ページの閲覧状況や訪問経路などを集計します。
              収集した情報はGoogleのプライバシーポリシーに基づき処理されます。Google
              Analyticsによるデータ収集を無効にしたい場合は、
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener"
                className="mx-1 text-accent-strong hover:underline"
              >
                Googleアナリティクス オプトアウト アドオン
              </a>
              をブラウザに追加することで対応できます。
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">広告について</h2>
          {ADSENSE_PUBLISHER_ID ? (
            <>
              <p>
                当サイトは第三者配信の広告サービス「Google
                AdSense」を利用しています。Googleを含む第三者配信事業者は、Cookie(氏名・住所・メール
                アドレス・電話番号を含まない情報)を使用して、当サイトや他のサイトへのアクセス情報に基づき
                広告を配信することがあります。
              </p>
              <p className="mt-2">
                Googleのパーソナライズ広告や、これに基づくCookieの使用を無効にしたい場合は、
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener"
                  className="mx-1 text-accent-strong hover:underline"
                >
                  Googleの広告設定ページ
                </a>
                から変更できます。
              </p>
            </>
          ) : (
            <p>
              現時点で、当サイトはGoogle AdSense等の第三者配信広告サービスを導入していません。今後導入する場合、
              Cookie等を用いた広告配信について本ポリシーを更新し、改めて明記します。
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">アフィリエイトプログラムについて</h2>
          <p>
            当サイトは、掲載している買取店の一部についてアフィリエイトプログラムに参加している場合があります。
            利用者が当サイト経由のリンクから各社のサービスに申し込んだ場合、当サイトが紹介料を受け取ることが
            あります。アフィリエイトリンクを含むページ・リンクには「PR」の表示を付けています。なお、
            アフィリエイト提携の有無によって価格の並び順や信頼度目安を操作することはありません。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">位置情報について</h2>
          <p>
            「近くの買取店」機能では、ご利用の端末・ブラウザの位置情報取得機能(Geolocation
            API)を用いて現在地を取得します。位置情報はお近くの店舗を検索する目的でのみ、
            その場でGoogle Places APIへの問い合わせに使用し、当サイト側のサーバーやデータベースには保存しません。
            位置情報の提供は任意であり、許可しない場合でも他の機能は通常どおりご利用いただけます。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">ブラウザ内保存(ローカルストレージ)について</h2>
          <p>
            「複数点まとめて計算」機能で入力した品物の情報は、ご利用の端末のブラウザ内(localStorage)にのみ保存されます。
            当サイトのサーバーには送信・保存されず、他の利用者やデバイスと共有されることもありません。
            ブラウザのデータを削除すると、保存した内容も消去されます。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">外部サイトへのリンクについて</h2>
          <p>
            当サイトから各買取店の公式サイトへリンクしています。リンク先サイトでの情報の取り扱いについては、
            各サイトのプライバシーポリシーをご確認ください。当サイトはリンク先での取り扱いについて責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">お問い合わせ</h2>
          {CONTACT_FORM_URL ? (
            <p>
              本ポリシーおよび当サイトに関するお問い合わせは、
              <a
                href={CONTACT_FORM_URL}
                target="_blank"
                rel="noopener"
                className="mx-1 text-accent-strong hover:underline"
              >
                こちらのお問い合わせフォーム
              </a>
              からお願いいたします。
            </p>
          ) : (
            <p>お問い合わせ窓口は準備中です。</p>
          )}
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">改定について</h2>
          <p>本ポリシーは予告なく改定される場合があります。最新の内容は本ページをご確認ください。</p>
        </section>
      </div>
    </div>
  );
}
