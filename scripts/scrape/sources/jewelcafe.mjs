import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://jewel-cafe.jp/kaitori/gold/";

// リンクテキスト例: "24金 (24K)" -> k24
const HREF_TO_PURITY = {
  "/kaitori/gold/k24/": "k24",
  "/kaitori/gold/k22/": "k22",
  "/kaitori/gold/k20/": "k20",
  "/kaitori/gold/k18/": "k18",
  "/kaitori/gold/k14/": "k14",
  "/kaitori/gold/k10/": "k10",
  "/kaitori/gold/k9/": "k9",
};

export const id = "jewel-cafe";

// 注意: このサイトはCloudflare content-signal(ai-train=no)でClaudeBot等の
// AI系クローラーを個別に拒否している。自社ボットとして明示したUser-Agentで、
// 学習目的ではなく本サービスの価格比較表示のためにのみ利用すること。
// 商用展開する場合は事前に問い合わせて許諾を得るのが望ましい。
export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  $("a.fc_blue").each((_, a) => {
    const href = $(a).attr("href");
    const purity = href && HREF_TO_PURITY[href];
    if (!purity) return;
    const row = $(a).closest("tr");
    const priceText = row.find(".bold").first().text();
    const value = Number(priceText.replace(/[^\d]/g, ""));
    if (Number.isFinite(value) && value > 0 && prices[purity] === undefined) {
      prices[purity] = value;
    }
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("jewel-cafe: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: new Date().toISOString().slice(0, 10) };
}
