import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";
import { todayJst } from "../lib/date.mjs";

const URL = "https://gold.tanaka.co.jp/commodity/souba/";

export const id = "tanaka-reference";

// 注意: これは比較対象の「買取店」ではなく、地金の基準値として使う田中貴金属の
// 店頭買取価格(K24/純金)。data/companies.jsonではなくdata/referenceRate.jsonに書き込む。
export async function scrapeReferenceRate() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  // 同じ表に、金・プラチナ・銀それぞれの「店頭小売価格」と「店頭買取価格」が
  // 並んでいる。買取だけを見ていたが、売るときに受け取れる額と、買うときに払う額の
  // 開きは、金とプラチナと銀で割合がまるで違う。その差を書くために両方を残す。
  // 既存の prices.k24 はそのまま置く(各社の比較で参照しているため)。
  const cell = (rowClass, cellClass) => {
    const text = $(`#metal_price tr.${rowClass} td.${cellClass}`).first().text();
    const n = Number(text.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const value = cell("gold", "purchase_tax");
  if (value === null) {
    throw new Error("tanaka: 価格を取得できませんでした(ページ構造が変わった可能性)");
  }

  // 銀は小数で出る(357.61円)ので、丸めずにそのまま持つ
  const spread = {};
  for (const [metal, rowClass] of [
    ["gold", "gold"],
    ["platinum", "pt"],
    ["silver", "silver"],
  ]) {
    const retail = cell(rowClass, "retail_tax");
    const purchase = cell(rowClass, "purchase_tax");
    if (retail === null || purchase === null) continue;
    spread[metal] = { retail, purchase };
  }

  const heading = $("h3")
    .filter((_, el) => $(el).text().includes("地金価格"))
    .first()
    .find("span")
    .text();
  const dateMatch = heading.match(/(\d{4})年(\d{2})月(\d{2})日/);
  const updatedAt = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : todayJst();

  return { prices: { k24: value }, spread, updatedAt };
}
