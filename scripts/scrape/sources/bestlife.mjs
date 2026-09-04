import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://e-kaitori.jp/kaitori/gold/";

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
  Sv1000: "ag",
};

export const id = "best-life";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  // ページ内に複数のwp-block-tableが存在する(インゴット表は「金 K24」のような
  // 別ラベルのため誤取得しない)。純度表は先頭tdが "K24" のように完全一致する。
  $("table tr").each((_, row) => {
    const label = $(row).find("td").first().text().trim();
    const purity = LABEL_TO_PURITY[label];
    if (!purity) return;
    const priceText = $(row).find("td").eq(1).text();
    const value = Number(priceText.replace(/[^\d]/g, ""));
    if (Number.isFinite(value) && value > 0) {
      prices[purity] = value;
    }
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("best-life: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: new Date().toISOString().slice(0, 10) };
}
