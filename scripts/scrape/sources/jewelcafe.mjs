import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";
import { parseJaDate } from "../lib/date.mjs";

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

  // ページに <time datetime="2026-09-25T19:45:26+09:00" itemprop="dateModified"> があり、
  // 日本時間のオフセット付きで書かれている。表示用の「2026年9月25日19:45更新！」より確実。
  // 同社は「平日午前9-11時に更新いたします」と書いており、土日はここが止まる。
  const machine = $("time[itemprop='dateModified']").attr("datetime");
  const updatedAt = parseJaDate(machine) ?? parseJaDate($(".price-date-badge").first().text());
  if (!updatedAt) {
    throw new Error("jewel-cafe: 更新日を読めませんでした(dateModified の構造が変わった可能性)");
  }

  return { prices, updatedAt };
}
