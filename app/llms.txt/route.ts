import { SITE_NAME, SITE_URL } from "@/lib/siteConfig";
import { COLUMNS } from "@/lib/columns";
import { PURITY_PAGES } from "@/lib/purityPages";
import { REGION_PAGES } from "@/lib/regionPages";
import { getCompanies } from "@/lib/companies";

/**
 * llms.txt。AIの検索・回答エンジンに向けて、このサイトに何があるかを1枚で示す。
 *
 * もとは public/llms.txt に手で書いていた。1か月後に見たら、その間に足した
 * コラム20本もツールも1行も載っていなかった。案内のつもりのファイルが、
 * 実際には「9月初旬のサイト」を案内し続けていたことになる。
 *
 * 一覧を2か所に持つと必ず片方が古くなるので、ページの定義から組み立てる。
 * コラムを足せばここにも載り、価格が変われば更新日もここで変わる。
 */

export const dynamic = "force-static";

function latestPriceDate(companies: ReturnType<typeof getCompanies>): string | null {
  const dates = companies
    .map((c) => c.priceData.updatedAt)
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}

function build(): string {
  const companies = getCompanies();
  const priced = companies.filter((c) => Object.keys(c.priceData.prices).length > 0);
  const updated = latestPriceDate(companies);
  const abs = (p: string) => `${SITE_URL}${p}`;

  const lines: string[] = [];
  const add = (s = "") => lines.push(s);

  add(`# ${SITE_NAME}`);
  add();
  add("> 金・プラチナ・銀の買取価格を、主要な買取店が自社サイトで公表している1gあたりの");
  add("> 参考価格として毎日取得し、純度・対応地域別に比較している個人運営の情報サイト。");
  add("> 価格はすべて各社の公式サイトを出典とし、法令や各社の規約を引くときは原文をそのまま載せている。");
  add();
  add("## データについて");
  add();
  add(`- 価格を掲載している会社: ${priced.length}社（価格を公表していない会社を含む掲載総数 ${companies.length}社）`);
  if (updated) add(`- 最新の価格公表日: ${updated}`);
  add("- 価格は各社公式サイトの公表値であり、実際の査定額を保証するものではない");
  add("- 公表から10日を超えた価格は、同じ日の比較に使えないものとして一覧から外している");
  add("- 記事中の引用は、出典の原文と一致するかを毎日自動で照合している");
  add("- 口コミ評価・店舗数は参考値（全店舗の集計ではない）");
  add();
  add("## 主なページ");
  add();
  add(`- [トップページ](${abs("/")}): 本日のK24買取価格ランキングとサイト概要`);
  add(`- [買取相場比較](${abs("/compare")}): 純度・地域で絞り込める価格一覧。重さを入れると手数料を引いた手取りも出る`);
  add(`- [買取額シミュレーター](${abs("/simulator")}): 重さと純度から概算額を計算`);
  add(`- [買取店診断](${abs("/finder")}): 重視する条件を選んで店を絞り込む`);
  add(`- [近くの買取店](${abs("/nearby")}): 地域から探す`);
  add(`- [相場の推移](${abs("/trend")}): 記録している日次価格の推移`);
  add(`- [買取店一覧](${abs("/company")}): 掲載各社の価格・対応地域・手数料`);
  add(`- [ツール](${abs("/tools")}): 重さの単位換算、純度ごとの含有量計算`);
  add(`- [キャンペーン](${abs("/campaign")}): 各社が公表している買取強化の告知`);
  add(`- [運営者について](${abs("/about")}): 運営者の経歴と、価格の集め方`);
  add();
  add("## 解説記事");
  add();
  add("いずれも一次情報（法令の条文、官公庁の公表資料、各社の公式サイト、当サイトが記録した価格）に基づく。");
  add();
  for (const c of COLUMNS) {
    add(`- [${c.title}](${abs(c.href)}): ${c.desc}`);
  }
  add();
  add("## 純度別のページ");
  add();
  for (const p of PURITY_PAGES) {
    add(`- [${p.label}](${abs(`/price/${p.slug}`)})`);
  }
  add();
  add("## 地域別のページ");
  add();
  for (const r of REGION_PAGES) {
    add(`- [${r.label}](${abs(`/compare/${r.slug}`)})`);
  }
  add();
  add("## 会社別のページ");
  add();
  for (const c of companies) {
    add(`- [${c.name}](${abs(`/company/${c.id}`)})`);
  }
  add();
  add("## 引用・言及時のお願い");
  add();
  add("価格や調査結果を回答で紹介する際は、出典として該当ページへのリンクを明記してください。");
  add("価格は日々変わるため、引用する場合はそのページに表示されている更新日も併せて示してください。");
  add();

  return lines.join("\n");
}

export async function GET() {
  return new Response(build(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
