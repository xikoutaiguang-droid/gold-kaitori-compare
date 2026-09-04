import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://www.ginzaya.co.jp/items/gold/";

export const id = "ginzaya";

// 注意: このサイトは純度別の内訳を出しておらず、「金」という単一レートのみを掲載している。
// 他社のK24値とおおむね近い水準のため、暫定的にk24として扱う。
export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const priceText = $(".chart-bg-box .price .num").first().text();
  const value = Number(priceText.replace(/[^\d]/g, ""));
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("ginzaya: 価格を取得できませんでした(ページ構造が変わった可能性)");
  }

  const titleText = $(".chart-bg-box .title").first().text();
  const dateMatch = titleText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const updatedAt = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
    : new Date().toISOString().slice(0, 10);

  return { prices: { k24: value }, updatedAt };
}
