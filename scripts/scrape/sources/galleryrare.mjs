import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";
import { parseJaDate } from "../lib/date.mjs";

const URL = "https://galleryrare.jp/goldplatinum/";

const ID_TO_PURITY = {
  k24_price: "k24",
  k22_price: "k22",
  k216_price: "k21_6",
  k20_price: "k20",
  k18_price: "k18",
  k14_price: "k14",
  k10_price: "k10",
  k9_price: "k9",
  pt1000_price: "pt1000",
  pt950_price: "pt950",
  pt900_price: "pt900",
  pt850_price: "pt850",
};

export const id = "galleryrare";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  for (const [elId, purity] of Object.entries(ID_TO_PURITY)) {
    const text = $(`#${elId}`).first().text();
    const value = Number(text.replace(/[^\d]/g, ""));
    if (Number.isFinite(value) && value > 0) {
      prices[purity] = value;
    }
  }

  if (Object.keys(prices).length === 0) {
    throw new Error("galleryrare: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  // 相場表の上に <div class="result__update"><time>更新日：2026年10月1日</time></div> がある。
  // time の datetime 属性は 2026-08-20 のまま放置されていて当てにならないので、
  // 表示されている文字のほうを読む。同社の更新は11時ごろで、それ以前に取ると前日のまま。
  const stamp = $(".result__update").first().text();
  const updatedAt = parseJaDate(stamp);
  if (!updatedAt) {
    throw new Error("galleryrare: 更新日を読めませんでした(.result__update の構造が変わった可能性)");
  }

  return { prices, updatedAt };
}
