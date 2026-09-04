import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://komehyo.jp/kaitori/gold/souba/";

const VALUE_TO_PURITY = {
  "24k": "k24",
  "22k": "k22",
  "21-6k": "k21_6",
  "20k": "k20",
  "18k": "k18",
  "14k": "k14",
  "10k": "k10",
  "9k": "k9",
  pt1000: "pt1000",
  pt950: "pt950",
  pt900: "pt900",
  pt850: "pt850",
  sv: "ag",
};

export const id = "komehyo";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  $("#js-simulation-metal option").each((_, el) => {
    const key = $(el).attr("value");
    const purity = VALUE_TO_PURITY[key];
    const value = Number($(el).attr("data-price"));
    if (purity && Number.isFinite(value) && value > 0) {
      prices[purity] = value;
    }
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("komehyo: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: new Date().toISOString().slice(0, 10) };
}
