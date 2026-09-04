import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://www.otakaraya.jp/gold/souba/";

// ページ内の計算ツール <select id="rateSimulation--select"> の option ラベルを
// このアプリの純度キーへマッピングする。
const LABEL_TO_PURITY = {
  K24: "k24",
  "K21.6": "k21_6",
  K22: "k22",
  K20: "k20",
  K18: "k18",
  K14: "k14",
  K10: "k10",
  K9: "k9",
  Pt1000: "pt1000",
  Pt950: "pt950",
  Pt900: "pt900",
  Pt850: "pt850",
  Sv1000: "ag",
};

export const id = "otakaraya";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  $("#rateSimulation--select option").each((_, el) => {
    const label = $(el).text().trim();
    const purity = LABEL_TO_PURITY[label];
    const value = Number($(el).attr("value"));
    if (purity && Number.isFinite(value) && value > 0) {
      prices[purity] = value;
    }
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("otakaraya: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: new Date().toISOString().slice(0, 10) };
}
