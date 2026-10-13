import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";
import { todayJst } from "../lib/date.mjs";

// 「金のレート（1gあたり）」「プラチナのレート（1gあたり）」の2つの表に、
// 品位ごとの行が並んでいる。どちらも table.p-rate-table。
const URL = "https://goldplaza.jp/gold/rate";

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
  Pt950: "pt950",
  Pt900: "pt900",
  Pt850: "pt850",
};

// この社はK12・K8も出しているが、当サイトは刻印として使われる純度だけを扱う。
// インゴットの行は宝飾品(スクラップ)とは基準が違うので採らない。
// 他社(リファスタ等)でも同じ扱いにしている。

export const id = "goldplaza";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};

  $("table.p-rate-table tr").each((_, tr) => {
    const cells = $(tr)
      .find("th,td")
      .map((_i, c) => $(c).text().replace(/\s+/g, " ").trim())
      .get();
    if (cells.length < 2) return;
    const label = cells[0];
    if (label.includes("インゴット")) return;
    const purity = TO_PURITY[label];
    if (!purity || purity in prices) return;
    // 「17,082円 (+101)」のような中身。前日比を拾わないよう、円より前だけを見る
    const m = cells[1].match(/([0-9][0-9,]*)\s*円/);
    if (!m) return;
    const value = Number(m[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value > 0) prices[purity] = value;
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("goldplaza: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  // 「更新日: 2026年10月13日 10:00」。無ければ「データ取得日 : 2026年10月13日」
  const text = html.replace(/<[^>]+>/g, " ");
  const m = text.match(/(?:更新日|データ取得日)\s*[:：]\s*(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const updatedAt = m
    ? `${m[1]}-${String(m[2]).padStart(2, "0")}-${String(m[3]).padStart(2, "0")}`
    : todayJst();

  return { prices, updatedAt };
}
