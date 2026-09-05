// デプロイ先が決まったら実際のドメインに差し替えること。
// metadataBase・sitemap・robots.txtのSitemap行が全てここを参照する。
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
export const SITE_NAME = "金買取相場比較";

// 運営者情報。実名でなく、人物として親しみやすい苗字での運営を選択している。
// 「田中」は当サイトが参考値として引用する田中貴金属と紛らわしいため避けている。
export const OPERATOR_NAME = "佐藤";
// お問い合わせ用Googleフォームの回答用URL(公開用の入力フォームリンク)。
// 発行後にここへ差し替える。空のままだと「準備中」表示になる。
export const CONTACT_FORM_URL = process.env.NEXT_PUBLIC_CONTACT_FORM_URL ?? "";

// Google AdSenseのパブリッシャーID("pub-"に続く数字。"ca-pub-"ではなく"pub-"部分のみ)。
// AdSenseの審査に通ってから発行される値をここへ設定する。空のままだと広告タグ・ads.txtは
// 出力されない(誤った値で審査に不利益を与えないため)。
export const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "";

// Google Search Consoleのサイト所有権確認用コード(HTMLタグ方式のcontent属性の値のみ)。
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "";

// Google Analytics(GA4)の測定ID("G-"から始まる文字列)。
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
