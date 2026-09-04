import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://gem-sigma.com/gold/gold/";

const LABEL_TO_PURITY = {
  K24: "k24",
  K22: "k22",
  "K21.6": "k21_6",
  K20: "k20",
  K18: "k18",
  K14: "k14",
  K10: "k10",
  K9: "k9",
  Pt1000: "pt1000",
  Pt950: "pt950",
  Pt900: "pt900",
  Pt850: "pt850",
};

const TABLE_HEADERS = ["ゴールド", "プラチナ"];

export const id = "gem-sigma";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  // ページ内に「ゴールド」表と「プラチナ」表があるため、両方のtheadを持つtableを対象にする。
  $("table").each((_, table) => {
    const header = $(table).find("thead th").first().text().trim();
    if (!TABLE_HEADERS.includes(header)) return;
    $(table)
      .find("tbody tr")
      .each((__, row) => {
        const label = $(row).find("td").first().text().trim();
        const purity = LABEL_TO_PURITY[label];
        if (!purity) return;
        const priceText = $(row).find("td").eq(1).text();
        const value = Number(priceText.replace(/[^\d]/g, ""));
        if (Number.isFinite(value) && value > 0) {
          prices[purity] = value;
        }
      });
  });

  const dayText = $(".todays_day").first().text();
  const dateMatch = dayText.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  const updatedAt = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
    : new Date().toISOString().slice(0, 10);

  if (Object.keys(prices).length === 0) {
    throw new Error("gem-sigma: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt };
}
