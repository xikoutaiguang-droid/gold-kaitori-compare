import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://kaitori.rodeodrive.co.jp/gold/";

const AU_TO_PURITY = {
  K24: "k24",
  K22: "k22",
  "K21.6": "k21_6",
  K20: "k20",
  K18: "k18",
  K14: "k14",
  K10: "k10",
  K9: "k9",
};
const PT_TO_PURITY = { Pt1000: "pt1000", Pt950: "pt950", Pt900: "pt900", Pt850: "pt850" };

export const id = "rodeodrive";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};

  const readTable = (selector, map) => {
    const dts = $(selector).find("dt");
    dts.each((_, el) => {
      const code = $(el).text().trim();
      const purity = map[code];
      if (!purity) return;
      const value = Number($(el).next("dd").find(".js_number").first().text().replace(/[^0-9]/g, ""));
      if (Number.isFinite(value) && value > 0) prices[purity] = value;
    });
  };

  readTable("dl.showgold", AU_TO_PURITY);
  readTable("dl.showplatium", PT_TO_PURITY);

  // シルバーはSv1000(純銀)を採用。他社の"ag"値との整合を優先する。
  const svDts = $("dl.showsilver").find("dt");
  svDts.each((_, el) => {
    if ($(el).text().trim() !== "Sv1000") return;
    const value = Number($(el).next("dd").find(".js_number").first().text().replace(/[^0-9]/g, ""));
    if (Number.isFinite(value) && value > 0) prices.ag = value;
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("rodeodrive: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  const dateMatch = html.match(/(\d{4})\/(\d{2})\/(\d{2})\s*<\/span><span>更新/);
  const updatedAt = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
    : new Date().toISOString().slice(0, 10);

  return { prices, updatedAt };
}
