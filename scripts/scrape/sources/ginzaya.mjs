import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";
import { todayJst } from "../lib/date.mjs";

const URL = "https://www.ginzaya.co.jp/items/gold/";

export const id = "ginzaya";

// 注意: このサイトは純度別の内訳を出しておらず、「金」という単一レートのみを掲載している。
// 他社のK24値とおおむね近い水準のため、暫定的にk24として扱う。
export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const priceEl = $(".chart-bg-box .price .num").first();
  if (priceEl.length === 0) {
    throw new Error("ginzaya: 価格の要素が見つかりませんでした(ページ構造が変わった可能性)");
  }

  const priceText = priceEl.text();
  const value = Number(priceText.replace(/[^\d]/g, ""));
  if (!Number.isFinite(value) || value <= 0) {
    // 要素はあるのに0が入っている。2026-09-28に実際に起きた。
    // 同じURLをブラウザから読むと正しい値(23,558円/g)が入ったHTMLが返るので、
    // ページがJSで描かれているのではなく、こちらに返ってくるキャッシュが
    // 0のまま固まっている。0を書き込むと順位が壊れるので、必ず失敗させる。
    throw new Error(
      `ginzaya: 掲載値が0でした(取得したHTMLの表示日: ${$(".chart-bg-box .title").first().text().trim() || "不明"})。` +
        "ブラウザでは正しい値が出るため、同社側のキャッシュが壊れている可能性があります。",
    );
  }

  const titleText = $(".chart-bg-box .title").first().text();
  const dateMatch = titleText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const updatedAt = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
    : todayJst();

  return { prices: { k24: value }, updatedAt };
}
