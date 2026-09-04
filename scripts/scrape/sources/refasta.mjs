import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

// トップページに金・プラチナ・銀すべての相場表が埋め込まれている(タブ切り替えはCSSのみ)。
const URL = "https://kinkaimasu.jp/";

const TH_TO_PURITY = { Pt1000: "pt1000", Pt950: "pt950", Pt900: "pt900", Pt850: "pt850", Sv1000: "ag" };
const AU_DETAIL_PATTERN = /^K(\d+(?:\.\d+)?)・\d+/;
const AU_CODE_TO_PURITY = {
  "24": "k24",
  "22": "k22",
  "21.6": "k21_6",
  "20": "k20",
  "18": "k18",
  "14": "k14",
  "10": "k10",
  "9": "k9",
};

export const id = "refasta";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};

  $("tr[hinmoku-price-data]").each((_, el) => {
    const row = $(el);
    const th = row.find("th").first().text().trim();
    const detailText = row.find("td.market-detail").first().text().replace(/\s+/g, "");
    const priceText = row.find("td.market-price").first().text();
    const value = Number(priceText.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(value) || value <= 0) return;

    // インゴット建ての行(IG/インゴット表記あり)は対象外。宝飾品(スクラップ)基準のみ採用。
    if (detailText.includes("IG") || detailText.includes("インゴット")) return;

    if (TH_TO_PURITY[th]) {
      if (!(TH_TO_PURITY[th] in prices)) prices[TH_TO_PURITY[th]] = value;
      return;
    }

    const auMatch = detailText.match(AU_DETAIL_PATTERN);
    if (auMatch && AU_CODE_TO_PURITY[auMatch[1]]) {
      const purity = AU_CODE_TO_PURITY[auMatch[1]];
      if (!(purity in prices)) prices[purity] = value;
    }
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("refasta: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  const dateMatch = html.match(/(\d{4})\/(\d{2})\/(\d{2})\s*\d{2}:\d{2}更新/);
  const updatedAt = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
    : new Date().toISOString().slice(0, 10);

  return { prices, updatedAt };
}
