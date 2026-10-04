import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, OPERATOR_NAME } from "@/lib/siteConfig";
import articleDates from "@/data/articleDates.json";

/**
 * 構造化データ(JSON-LD)の組み立て。
 *
 * 検索結果の見え方を変えるだけでなく、ページに書いていないことを書くと
 * ガイドライン違反になるため、ここで作る内容は必ず画面に出ている内容と揃える。
 * 「会社が運営している」と書かないのは、運営者ページに個人運営と明記しているため。
 */

const abs = (path: string) => new URL(path, SITE_URL).toString();

/**
 * 共有・構造化データに使う画像。記事ごとの画像は用意していないので、
 * サイト共通の1枚を指す。ここを変えると og:image と Article の image が両方変わる。
 */
export const SHARE_IMAGE_PATH = "/hero-gold.jpg";

/** 運営者。#で始まるIDを付けて、他の型から参照できるようにする。 */
const PERSON_ID = abs("/about") + "#operator";

/** サイト自体のID。各ページの構造化データからここを参照する。 */
const WEBSITE_ID = abs("/") + "#website";

function person() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: OPERATOR_NAME,
    url: abs("/about"),
    // 運営者ページに書いてある経歴と同じ内容に揃える
    description: "買取店で店長を務めた経験があり、現在も買取業界に籍を置く個人運営者。",
  };
}

/**
 * サイト全体の情報。ルートレイアウトから1回だけ出す。
 * 各ページの JSON-LD からは @id で参照する。
 */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: abs("/"),
    name: SITE_NAME,
    inLanguage: "ja",
    description:
      "金・プラチナ・銀の買取価格を、主要な買取店ごとに毎日取得して比較しているサイトです。",
    publisher: person(),
  };
}

/**
 * 記事ページ。見出しと説明は metadata から取り出すので、ページの文言を直せば
 * 構造化データも一緒に変わる。両方を手で書くと必ず片方が古くなる。
 *
 * 公開日・更新日は git の履歴から書き出した値
 * (scripts/update-article-dates.mjs)。履歴が無い記事には日付を付けない。
 */
export function articleJsonLd(route: string, metadata: Metadata) {
  const dates = (articleDates.articles as Record<string, { published: string; modified: string }>)[
    route
  ];
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: headlineOf(metadata),
    image: abs(SHARE_IMAGE_PATH),
    description: typeof metadata.description === "string" ? metadata.description : undefined,
    inLanguage: "ja",
    mainEntityOfPage: { "@type": "WebPage", "@id": abs(route) },
    isPartOf: { "@id": WEBSITE_ID },
    author: person(),
    publisher: person(),
    ...(dates ? { datePublished: dates.published, dateModified: dates.modified } : {}),
  };
}

/** metadata.title は文字列のこともテンプレート指定のこともある */
function headlineOf(metadata: Metadata): string {
  const t = metadata.title;
  if (typeof t === "string") return t;
  if (t && typeof t === "object") {
    if ("absolute" in t && typeof t.absolute === "string") return t.absolute;
    if ("default" in t && typeof t.default === "string") return t.default;
  }
  return SITE_NAME;
}

export interface Crumb {
  name: string;
  /** 先頭に / を付けたパス。最後の1つ(現在のページ)も含める */
  path: string;
}

/**
 * パンくず。検索結果でURLの代わりに階層が出るようになる。
 * 画面に出しているパンくずと同じ並びにすること。
 */
export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

/** コラム記事のパンくず。画面上の「コラム › 記事名」と同じ並びにする。 */
export function columnBreadcrumb(route: string, metadata: Metadata) {
  return breadcrumbJsonLd([
    { name: SITE_NAME, path: "/" },
    { name: "コラム", path: "/column" },
    { name: headlineOf(metadata), path: route },
  ]);
}

/**
 * 一覧ページ。画面に並んでいるものを、そのままの順番で示す。
 *
 * 一覧ページには Article を出せない(記事ではない)が、何の一覧なのかが
 * 構造として読めないと、検索エンジンにも回答エンジンにも
 * 「リンクが並んだページ」としか見えない。並び順と件数は画面と必ず揃える。
 */
export function collectionJsonLd(
  route: string,
  metadata: Metadata,
  items: { name: string; path: string; description?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": abs(route),
    url: abs(route),
    name: headlineOf(metadata),
    description: typeof metadata.description === "string" ? metadata.description : undefined,
    inLanguage: "ja",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: person(),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        description: it.description,
        url: abs(it.path),
      })),
    },
  };
}

/**
 * 日次で記録している価格データそのもの。
 *
 * 画面のグラフは人が読むためのもので、機械が読むなら /data/prices.json にある。
 * 同じ日の各社の価格を並べたものは当サイトにしかないので、引用されるときに
 * 「どこから取れるか」「いつからいつまでか」を構造として示しておく。
 * distribution には実際に取得できるURLだけを書く(用意していない形式は書かない)。
 */
export function priceDatasetJsonLd(opts: {
  route: string;
  startDate: string;
  endDate: string | null;
  distributionPath: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": abs(opts.route) + "#dataset",
    name: "金・プラチナ・銀の買取参考価格(日次)",
    description:
      "主要な買取店が公式サイトで公表している1gあたりの買取参考価格を毎日取得し、" +
      "純度別の日次平均として記録したもの。各社の当日値と出典URLも含む。",
    url: abs(opts.route),
    inLanguage: "ja",
    isAccessibleForFree: true,
    creator: person(),
    publisher: person(),
    temporalCoverage: opts.endDate ? `${opts.startDate}/${opts.endDate}` : `${opts.startDate}/..`,
    variableMeasured: ["買取参考価格(円/g)"],
    measurementTechnique: "各社公式サイトの公表値を日次で取得",
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: abs(opts.distributionPath),
      },
    ],
  };
}
