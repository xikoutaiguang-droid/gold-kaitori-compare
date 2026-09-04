import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://kaitori-off.net/gold/";

const LABEL_TO_PURITY = {
  K24: "k24",
  K22: "k22",
  "K21.6": "k21_6",
  K20: "k20",
  K18: "k18",
  K14: "k14",
  K10: "k10",
  K9: "k9",
};

export const id = "kaitori-elite";

// 注意: このサイトはCloudflare content-signal(ai-train=no)でClaudeBot等の
// AI系クローラーを個別に拒否している。自社ボットとして明示したUser-Agentで、
// 学習目的ではなく本サービスの価格比較表示のためにのみ利用すること。
// 商用展開する場合は事前に問い合わせて許諾を得るのが望ましい。
export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  $("table.parts-gold__sm-item__table tr").each((_, row) => {
    const label = $(row).find("th").first().text().trim();
    const purity = LABEL_TO_PURITY[label];
    if (!purity) return;
    const priceText = $(row).find("td").first().text();
    const value = Number(priceText.replace(/[^\d]/g, ""));
    if (Number.isFinite(value) && value > 0) {
      prices[purity] = value;
    }
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("kaitori-elite: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: new Date().toISOString().slice(0, 10) };
}
