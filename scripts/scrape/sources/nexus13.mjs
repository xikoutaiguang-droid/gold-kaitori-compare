import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://www.nexus13.co.jp/metals/";

const GOLD_NUMBER_TO_PURITY = {
  24: "k24",
  22: "k22",
  21.6: "k21_6",
  20: "k20",
  18: "k18",
  14: "k14",
  10: "k10",
  9: "k9",
};

const PT_NUMBER_TO_PURITY = {
  1000: "pt1000",
  950: "pt950",
  900: "pt900",
  850: "pt850",
};

export const id = "nexus13";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  $("tr").each((_, row) => {
    // 表記ゆれ("Pt 900"のように数字の前にスペースが入ることがある)を吸収するため
    // 空白を除去してから判定する。
    const label = $(row)
      .find("th")
      .first()
      .text()
      .trim()
      .normalize("NFKC")
      .replace(/\s+/g, "");
    const priceText = $(row).find("td").first().text();
    const value = Number(priceText.replace(/[^\d]/g, ""));
    if (!Number.isFinite(value) || value <= 0) return;

    // "K24コイン"のような地金以外の商品行は除外し、"K24(純度100%)"のような
    // 素材そのものの行のみを対象にする。
    const kMatch = label.match(/^K(\d+(?:\.\d+)?)\(純度/);
    if (kMatch) {
      const purity = GOLD_NUMBER_TO_PURITY[Number(kMatch[1])];
      if (purity) prices[purity] = value;
      return;
    }

    const ptMatch = label.match(/^Pt(\d+)\(純度/);
    if (ptMatch) {
      const purity = PT_NUMBER_TO_PURITY[Number(ptMatch[1])];
      if (purity) prices[purity] = value;
      return;
    }

    if (/^SV1000$/.test(label)) {
      prices.ag = value;
    }
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("nexus13: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: new Date().toISOString().slice(0, 10) };
}
