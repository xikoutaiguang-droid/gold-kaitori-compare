import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

// 日本語パスなのでエンコード済みURLを直接指定する(元は https://takayama78.co.jp/買取カテゴリ/ )
const URL = "https://takayama78.co.jp/%E8%B2%B7%E5%8F%96%E3%82%AB%E3%83%86%E3%82%B4%E3%83%AA/";

export const id = "takayama78";

// 注意: このページはK18(製品1gの価格)のみを公開しており、K24等の内訳はない。
export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const heading = $("#market-price")
    .filter((_, el) => /現在の金相場/.test($(el).text()))
    .first();
  const table = heading.nextAll(".price_wrap").first().find(".gold_left table.gold");

  const prices = {};
  table.find("tr").each((_, row) => {
    const label = $(row).find(".price_title").text().replace(/\s+/g, "");
    if (label !== "K18") return;
    const priceText = $(row).find(".price_content p").first().text();
    const value = Number(priceText.replace(/[^\d]/g, ""));
    if (Number.isFinite(value) && value > 0) {
      prices.k18 = value;
    }
  });

  const dateMatch = heading.text().match(/(\d{1,2})月(\d{1,2})日/);
  const year = new Date().getFullYear();
  const updatedAt = dateMatch
    ? `${year}-${dateMatch[1].padStart(2, "0")}-${dateMatch[2].padStart(2, "0")}`
    : new Date().toISOString().slice(0, 10);

  if (Object.keys(prices).length === 0) {
    throw new Error("takayama78: 価格を取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt };
}
