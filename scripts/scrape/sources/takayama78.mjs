import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";
import { todayJst } from "../lib/date.mjs";

// 日本語パスなのでエンコード済みURLを直接指定する(元は https://takayama78.co.jp/買取カテゴリ/ )
const URL = "https://takayama78.co.jp/%E8%B2%B7%E5%8F%96%E3%82%AB%E3%83%86%E3%82%B4%E3%83%AA/";

export const id = "takayama78";

// 注意: このページが公開しているのはK18とPt900(どちらも製品1gの価格)だけで、
// K24等の内訳はない。
//
// 以前はK18しか読んでいなかった。表は左右2つに分かれていて(.gold_left が金、
// .gold_right がプラチナ)、左しか見ていなかったためで、その間ずっと
// companies.json に残っていた古いPt900(8,610円)が、K18を取り直すたびに
// 新しい日付を与えられて公開され続けていた。実際のページは8,300円だった。
// 取得していない値を保存に残さないこと自体は store.mjs 側で直してある。
const SECTIONS = [
  { selector: ".gold_left table.gold", label: "K18", key: "k18" },
  { selector: ".gold_right table.gold", label: "Pt900", key: "pt900" },
];

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const heading = $("#market-price")
    .filter((_, el) => /現在の金相場/.test($(el).text()))
    .first();
  const wrap = heading.nextAll(".price_wrap").first();

  const prices = {};
  for (const section of SECTIONS) {
    wrap.find(section.selector).find("tr").each((_, row) => {
      const label = $(row).find(".price_title").text().replace(/\s+/g, "");
      if (label !== section.label) return;
      const priceText = $(row).find(".price_content p").first().text();
      const value = Number(priceText.replace(/[^\d]/g, ""));
      if (Number.isFinite(value) && value > 0) {
        prices[section.key] = value;
      }
    });
  }

  const dateMatch = heading.text().match(/(\d{1,2})月(\d{1,2})日/);
  const year = new Date().getFullYear();
  const updatedAt = dateMatch
    ? `${year}-${dateMatch[1].padStart(2, "0")}-${dateMatch[2].padStart(2, "0")}`
    : todayJst();

  if (Object.keys(prices).length === 0) {
    throw new Error("takayama78: 価格を取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt };
}
