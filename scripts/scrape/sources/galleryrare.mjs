import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://galleryrare.jp/goldplatinum/";

const ID_TO_PURITY = {
  k24_price: "k24",
  k22_price: "k22",
  k216_price: "k21_6",
  k20_price: "k20",
  k18_price: "k18",
  k14_price: "k14",
  k10_price: "k10",
  k9_price: "k9",
  pt1000_price: "pt1000",
  pt950_price: "pt950",
  pt900_price: "pt900",
  pt850_price: "pt850",
};

export const id = "galleryrare";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  for (const [elId, purity] of Object.entries(ID_TO_PURITY)) {
    const text = $(`#${elId}`).first().text();
    const value = Number(text.replace(/[^\d]/g, ""));
    if (Number.isFinite(value) && value > 0) {
      prices[purity] = value;
    }
  }

  if (Object.keys(prices).length === 0) {
    throw new Error("galleryrare: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: new Date().toISOString().slice(0, 10) };
}
