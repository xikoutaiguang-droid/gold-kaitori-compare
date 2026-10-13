import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";
import { todayJst } from "../lib/date.mjs";

// 鑑定空間(株式会社ホーム・コム)。品位ごとの表が3つに分かれている。
//   table.gold_type_price … 金
//   table.scrap           … プラチナと銀(2つある)
// 別に table.ingot_price_table があるが、そちらはインゴット建てなので採らない
// (宝飾品=スクラップの基準で揃える。他社も同じ扱い)。
const URL = "https://brandcom.co.jp/kikinzoku/gold-kaitori/";

const TO_PURITY = {
  K24: "k24",
  K22: "k22",
  "K21.6": "k21_6",
  K20: "k20",
  K18: "k18",
  K14: "k14",
  K10: "k10",
  K9: "k9",
  Pt1000: "pt1000",
  "Pt1000・999": "pt1000",
  Pt950: "pt950",
  Pt900: "pt900",
  Pt850: "pt850",
  Sv1000: "ag",
};

export const id = "brandcom";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};

  $("table.gold_type_price tr, table.scrap tr").each((_, tr) => {
    const cells = $(tr)
      .find("th,td")
      .map((_i, c) => $(c).text().replace(/\s+/g, " ").trim())
      .get();
    if (cells.length < 2) return;
    // 「K18(18金)」「Pt1000・999(プラチナ1000・999)」「Sv1000(純銀)」のように
    // 括弧で和名が続く。括弧の前だけを見る。
    const label = cells[0].replace(/[(（].*$/, "").trim();
    // ホワイトゴールドの行(K18WG等)は同じ品位の重複なので採らない。
    // 先に出てくる無印の行を正とする。
    if (/WG$/.test(label)) return;
    const purity = TO_PURITY[label];
    if (!purity || purity in prices) return;
    const m = cells[1].match(/([0-9][0-9,]*)\s*円/);
    if (!m) return;
    const value = Number(m[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value > 0) prices[purity] = value;
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("brandcom: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  // 「更新日：2026年10月13日（10:00 更新）」
  const text = html.replace(/<[^>]+>/g, " ");
  const m = text.match(/更新日\s*[:：]\s*(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const updatedAt = m
    ? `${m[1]}-${String(m[2]).padStart(2, "0")}-${String(m[3]).padStart(2, "0")}`
    : todayJst();

  return { prices, updatedAt };
}
