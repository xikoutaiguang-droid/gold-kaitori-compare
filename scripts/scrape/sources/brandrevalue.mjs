import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://brandrevalue.com/cat/gold/souba";

// リンクテキスト例: "24金 相場" -> k24
const LABEL_TO_PURITY = {
  "24金": "k24",
  "22金": "k22",
  "21.6金": "k21_6",
  "20金": "k20",
  "18金": "k18",
  "14金": "k14",
  "10金": "k10",
  "9金": "k9",
};

export const id = "brand-revalue";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  $("tr.c-metal-price-details__prices-item").each((_, row) => {
    const linkText = $(row).find(".c-metal-price-details__link").first().text().trim();
    const label = linkText.replace(/\s*相場$/, "");
    const purity = LABEL_TO_PURITY[label];
    if (!purity) return;

    const priceText = $(row).find(".c-metal-price-details__price span").first().text();
    const value = Number(priceText.replace(/[^\d]/g, ""));
    if (Number.isFinite(value) && value > 0 && prices[purity] === undefined) {
      prices[purity] = value;
    }
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("brand-revalue: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: new Date().toISOString().slice(0, 10) };
}
