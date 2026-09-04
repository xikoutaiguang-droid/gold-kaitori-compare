import * as cheerio from "cheerio";
import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://manekiya.shop/rate";

// 注: このページのK24〜K9の数値はおたからやと完全一致しており、
// 業界で広く使われている共通の相場データ(仕入れ元)を参照している可能性が高い。
const LABEL_TO_PURITY = {
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
  Sv1000: "ag",
};

export const id = "manekiya";

export async function scrape() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  const prices = {};
  // 金・プラチナ・シルバーのセクションが同じ".rate__price-item"パターンの
  // クラス名を使い回している(実装側の命名ゆれ)ため、コンテナクラスに頼らず
  // ページ内の全li.flexをラベルテキストで判定する。
  $("li.flex[data-price]").each((_, li) => {
    // ラベルは "K24（スクラップ)" のような装飾テキストを含みうるので、先頭表記のみ取り出す。
    const rawLabel = $(li).find(".other-name").text().trim();
    const label = rawLabel.match(/^(K\d+(\.\d+)?|Pt\d+|Sv\d+)/)?.[0];
    const purity = label && LABEL_TO_PURITY[label];
    if (!purity) return;

    const value = Number($(li).attr("data-price"));
    if (Number.isFinite(value) && value > 0 && prices[purity] === undefined) {
      prices[purity] = value;
    }
  });

  if (Object.keys(prices).length === 0) {
    throw new Error("manekiya: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: new Date().toISOString().slice(0, 10) };
}
