import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";
import { todayJst } from "../lib/date.mjs";

/*
 * 質屋さのや(株式会社山貴佐野屋)。
 *
 * この社の表は列が4つある。
 *   [日付] [買取金額(円/g)] [前日比] [質預り金額(円/g)] [前日比]
 * 当サイトが集めているのは売ったときに受け取る額なので、**買取金額の列だけ**を採る。
 * 質預りは借入れであって売買ではない(/column/pawn)。隣の列なので取り違えやすい。
 *
 * ページには「国内公表価格」としてK24・Pt1000の建値も別に出ているが、
 * あれは田中貴金属の建値にあたるもので同社の買取価格ではない。表の中だけを読む。
 */
const URL = "https://www.sanoya.co.jp/gold/";

const TO_PURITY = {
  K24: "k24",
  K22: "k22",
  K20: "k20",
  K18: "k18",
  K14: "k14",
  Pt1000: "pt1000",
  Pt950: "pt950",
  Pt900: "pt900",
  Pt850: "pt850",
};

export const id = "sanoya";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  let updatedAt = null;

  $("table").each((_, table) => {
    const head = $(table).find("tr").first().text().replace(/\s+/g, " ");
    // 買取金額の列を持つ表だけを見る。推移表(日付・18金・Pt900・為替)は除く
    if (!head.includes("買取金額")) return;

    const d = head.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    if (d && !updatedAt) {
      updatedAt = `${d[1]}-${String(d[2]).padStart(2, "0")}-${String(d[3]).padStart(2, "0")}`;
    }

    $(table)
      .find("tr")
      .slice(1)
      .each((_i, tr) => {
        const cells = $(tr)
          .find("th,td")
          .map((_j, c) => $(c).text().replace(/\s+/g, " ").trim())
          .get();
        if (cells.length < 2) return;
        // 「24金（K24）」からK24を、「Pt900」はそのまま
        const m = cells[0].match(/K\d{1,2}|Pt\d{3,4}/);
        if (!m) return;
        const purity = TO_PURITY[m[0]];
        if (!purity || purity in prices) return;
        // 2列目が買取金額。質預り金額(4列目)と取り違えない
        const value = Number(cells[1].replace(/[^0-9]/g, ""));
        if (Number.isFinite(value) && value > 0) prices[purity] = value;
      });
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("sanoya: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: updatedAt ?? todayJst() };
}
