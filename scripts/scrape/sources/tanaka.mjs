import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://gold.tanaka.co.jp/commodity/souba/";

export const id = "tanaka-reference";

// 注意: これは比較対象の「買取店」ではなく、地金の基準値として使う田中貴金属の
// 店頭買取価格(K24/純金)。data/companies.jsonではなくdata/referenceRate.jsonに書き込む。
export async function scrapeReferenceRate() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const row = $("#metal_price tr.gold");
  const priceText = row.find("td.purchase_tax").first().text();
  const value = Number(priceText.replace(/[^\d]/g, ""));

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("tanaka: 価格を取得できませんでした(ページ構造が変わった可能性)");
  }

  const heading = $("h3")
    .filter((_, el) => $(el).text().includes("地金価格"))
    .first()
    .find("span")
    .text();
  const dateMatch = heading.match(/(\d{4})年(\d{2})月(\d{2})日/);
  const updatedAt = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : new Date().toISOString().slice(0, 10);

  return { prices: { k24: value }, updatedAt };
}
