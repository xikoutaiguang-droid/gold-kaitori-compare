import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";
import { todayJst } from "../lib/date.mjs";

const URL = "https://goldmrs.jp/";

// ラベル表記が半角"K"と全角"Ｋ"混在("K24(純度100％)" / "Ｋ14(純度58.5％)")なので
// 正規化してから純度キーへマッピングする。金は#top_kaitori_box1、プラチナは
// #top_kaitori_box2に分かれている。
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

/**
 * GitHub Actions のIPからは取得できない。
 *
 * data/scrapeStatus.json の履歴を数えると CIからは31回試して1度も成功していない。同じコードで、同じ時間帯に
 * 手元のPCから実行すると5回中5回通る。リファスタも同じ数字だったが、あちらは
 * 中間証明書を送っていないのが原因だった。こちらはTLSの鎖が正常
 * (openssl s_client で Verify return code: 0)なので、別の理由で弾かれている。
 * WAFがクラウドの共有IPを弾いているとみられる。
 * User-Agentを偽ったりプロキシを挟めば抜けられるかもしれないが、それは
 * 相手が拒んでいるものを騙して取りに行くことなので、しない。
 *
 * 再試行の回数を増やしても0%は0%のままなので、CIでは最初から実行しない。
 * 値は scripts/local-refresh.mjs の定期実行(手元のPC)で取得する。
 * 手元からも取れなくなれば、check-freshness.mjs の「古い価格」で落ちる。
 */
export const ciBlocked = "GitHub Actionsから31回中0回成功。手元のPCからは5回中5回成功";

export const id = "goldmrs";

function extractFromTable($, containerSelector, labelPattern, numberToPurity, prices) {
  $(`${containerSelector} table tr`).each((_, row) => {
    const label = $(row).find("td").first().text().trim().normalize("NFKC");
    const m = label.match(labelPattern);
    if (!m) return;
    const purity = numberToPurity[Number(m[1])];
    if (!purity) return;

    const priceText = $(row).find("td.price").text();
    const value = Number(priceText.replace(/[^\d]/g, ""));
    if (Number.isFinite(value) && value > 0) {
      prices[purity] = value;
    }
  });
}

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  extractFromTable($, "#top_kaitori_box1", /^K(\d+(?:\.\d+)?)/, GOLD_NUMBER_TO_PURITY, prices);
  extractFromTable($, "#top_kaitori_box2", /^Pt(\d+)/, PT_NUMBER_TO_PURITY, prices);

  const updatedText = $("#kaitori_kousin").text();
  const dateMatch = updatedText.match(/(\d{4})年(\d{2})月(\d{2})日/);
  const updatedAt = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : todayJst();

  if (Object.keys(prices).length === 0) {
    throw new Error("goldmrs: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt };
}
