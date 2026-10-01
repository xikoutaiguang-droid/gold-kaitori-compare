/**
 * 保存している金額が、その社のページに実際に書かれている数字かを確かめる。
 *
 * 取得スクリプトの点検(check-freshness)は「取れたか」「古くないか」しか見ない。
 * セレクタがページ上の別の表を指していても、値は毎日新しくなるので気づけない。
 * 実際リファスタでは、同じセレクタが別の表を拾って全純度が13.7%ずれたことがある。
 *
 * そこでここでは、セレクタを一切使わずに確かめる。
 * 保存している「21,823」という文字列が、その社のページの中にあるかどうかだけを見る。
 * 取得と同じ道筋を通らないので、取得が間違っていればここで食い違う。
 *
 * 自動では流していない。各社のページを20回取りに行くので、日に何度も走らせるものではない。
 * 金額が合っているかを人が確かめたいときに手で実行する:
 *   node scripts/scrape/audit-against-source.mjs
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const UA = "GoldCompareBot/0.1 (+https://kin-hikaku.com/privacy)";

/**
 * ページのHTMLに数字が書かれていない社。文字列照合では確かめられないので、
 * 何を見ればいいかをここに書いておく。黙って対象外にはしない。
 */
const NOT_IN_HTML = {
  nanboya:
    "価格は /ajax/todays-prices.json にあり、ページ側はそれを読み込んで表示している。" +
    "確かめるときはそのJSONを直接見ること(robots.txtで明示的に許可されている)。",
  netoff:
    "souba.js の中で baseK から計算している(K24 = floor(round(baseK*0.965)*0.8) など)。" +
    "数字そのものはファイルに無いので、baseK と式を見ること。",
  ginzaya: "ページの数字はJavaScriptで差し込まれる。curlで取るHTMLには0が入っている。ブラウザで見ること。",
};

function fmt(n) {
  return n.toLocaleString("en-US");
}

async function main() {
  const companies = JSON.parse(await readFile(path.join(ROOT, "data", "companies.json"), "utf8"));
  const checked = [];
  const mismatched = [];
  const skipped = [];

  for (const c of companies) {
    const k24 = c.priceData?.prices?.k24;
    const k18 = c.priceData?.prices?.k18;
    if (k24 === undefined && k18 === undefined) continue;

    if (NOT_IN_HTML[c.id]) {
      skipped.push(`  - ${c.name}(${c.id}): ${NOT_IN_HTML[c.id]}`);
      continue;
    }

    const url = c.priceSourceUrl || c.officialUrl;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      const html = await res.text();
      const miss = [];
      for (const [label, value] of [
        ["K24", k24],
        ["K18", k18],
      ]) {
        if (value === undefined) continue;
        if (!html.includes(fmt(value)) && !html.includes(String(value))) miss.push(`${label}=${fmt(value)}`);
      }
      if (res.status !== 200) {
        mismatched.push(`  - ${c.name}(${c.id}): ${url} が ${res.status} を返しました`);
      } else if (miss.length) {
        mismatched.push(`  - ${c.name}(${c.id}): ${miss.join(", ")} がページに見つかりません / ${url}`);
      } else {
        checked.push(c.id);
      }
    } catch (err) {
      mismatched.push(`  - ${c.name}(${c.id}): 取得できません (${err.message})`);
    }
    // 相手のサイトに連続で当てない
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`ページの記載と一致: ${checked.length}社`);
  if (skipped.length) {
    console.log(`\n文字列照合ができない社 (${skipped.length}社):`);
    console.log(skipped.join("\n"));
  }
  if (mismatched.length) {
    console.error(`\n一致しなかった社 (${mismatched.length}社):`);
    console.error(mismatched.join("\n"));
    console.error("\nページを開いて、保存している金額が本当にその社の価格かを確認してください。");
    process.exit(1);
  }
  console.log("\n照合できた社はすべて、保存している金額がページに書かれていました。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
