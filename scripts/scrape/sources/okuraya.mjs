import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://okuraya.jp/";

// 「純金」(地金)と「K24」(スクラップ)が別の価格で並記されているため、
// 他社との比較性を優先し、スクラップ扱いのK24を採用する。
const LABEL_TO_PURITY = {
  K24: "k24",
  K18: "k18",
  K14: "k14",
  Pt1000: "pt1000",
  Pt950: "pt950",
  Pt900: "pt900",
  Pt850: "pt850",
};

export const id = "okuraya";

// 注意: 「大蔵」という会社名の同定に不確実性が残る(三重県鈴鹿市の地域業者を暫定採用)。
// ユーザーが意図した会社と異なる可能性があるため、確認が取れ次第見直すこと。
export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  $(".content-kaitoriToday table tr").each((_, row) => {
    const cells = $(row).find("td");
    for (let i = 0; i + 1 < cells.length; i += 1) {
      const label = $(cells[i]).text().trim();
      const purity = LABEL_TO_PURITY[label];
      if (!purity) continue;
      const value = Number($(cells[i + 1]).text().replace(/[^\d]/g, ""));
      if (Number.isFinite(value) && value > 0) {
        prices[purity] = value;
      }
    }
  });

  const dateText = $(".content-kaitoriToday .date").first().text();
  const dateMatch = dateText.match(/(\d{4})年(\d{2})月(\d{2})日/);
  const updatedAt = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : new Date().toISOString().slice(0, 10);

  if (Object.keys(prices).length === 0) {
    throw new Error("okuraya: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt };
}
