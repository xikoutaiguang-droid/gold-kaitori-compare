import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";
import { parseJaDate } from "../lib/date.mjs";

const URL = "https://www.otakaraya.jp/gold/souba/";

// 相場表(ul.pm-rate-tables-block の li)の「24金(K24･純金)」「プラチナ900(Pt900)」の
// 括弧内の純度コードを、このアプリの純度キーへマッピングする。
// 以前は計算ツールの <select> を読んでいたが、2026年11月にページから無くなった。
// 「国内インゴット(金)」のようにコードを持たない行は対象外(宝飾品基準のみ採用)。
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
  $("ul.pm-rate-tables-block li").each((_, el) => {
    const label = $(el).find(".purity-type").text();
    const code = label.match(/\((K\d+(?:\.\d+)?|Pt\d+|Sv\d+)(?=[)･])/)?.[1];
    const purity = code ? LABEL_TO_PURITY[code] : undefined;
    const value = Number($(el).find(".rate-price").first().text().replace(/[^\d]/g, ""));
    if (purity && Number.isFinite(value) && value > 0 && !(purity in prices)) {
      prices[purity] = value;
    }
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("otakaraya: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  // 相場表の上に「2026年09月25日 14:00 更新」と出ている。土日はここが金曜のまま止まる。
  // 以前は実行日を入れていたので、金曜の価格に日曜の日付が付いていた。
  const stamp = $(".pm-rate-table-date li").first().text();
  const updatedAt = parseJaDate(stamp);
  if (!updatedAt) {
    throw new Error("otakaraya: 相場表の更新日を読めませんでした(.pm-rate-table-date の構造が変わった可能性)");
  }

  return { prices, updatedAt };
}
