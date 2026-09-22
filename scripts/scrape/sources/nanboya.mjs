import { fetchJson } from "../lib/fetchHtml.mjs";

// 以前は https://nanboya.com/ajax/metals-market-prices.json を見ていたが、
// そちらは2025-11-02で更新が止まっており、10か月前の価格をサイトに載せ続けていた。
// 価格ページが実際に呼んでいるのはこちらのエンドポイントで、素のfetchで読める。
// (ページのHTMLからは金額がJavaScript描画のため読めないが、この JSON は直接取得できる)
const URL = "https://nanboya.com/ajax/metal-price/metal-list.json";

/** これより古ければ取得失敗として扱う。lib/companies.ts の鮮度判定と揃えている */
const MAX_AGE_DAYS = 10;

// 同社は同じ純度でもインゴットとスクラップを別建てで公表している。
// 他社が宝飾品向けに出している単価と並べるので、スクラップ側を採る。
// (例: 2026-09-18時点で gold_ingot 23,699円 / k24_scrap 23,462円)
// 当アプリに対応する純度キーが無いもの(K23・K12・K8・K5・WG・半々)は取らない。
const NAME_TO_PURITY = {
  k24_scrap: "k24",
  k22_scrap: "k22",
  "k21.6_scrap": "k21_6",
  k20_scrap: "k20",
  k18_scrap: "k18",
  k14_scrap: "k14",
  k10_scrap: "k10",
  k9_scrap: "k9",
  pt1000_scrap: "pt1000",
  pt950_scrap: "pt950",
  pt900_scrap: "pt900",
  pt850_scrap: "pt850",
  sv1000_scrap: "ag",
};

export const id = "nanboya";

export async function scrape() {
  const list = await fetchJson(URL);
  if (!Array.isArray(list)) {
    throw new Error("nanboya: 配列が返りませんでした(エンドポイントの仕様が変わった可能性)");
  }

  const prices = {};
  let recordedOn = null;

  for (const entry of list) {
    const purity = NAME_TO_PURITY[entry?.name];
    if (!purity) continue;
    const value = Number(entry?.latest?.buying_price);
    if (!Number.isFinite(value) || value <= 0) continue;
    prices[purity] = Math.round(value);
    // 全品目が同じ日付で更新されるが、念のため最も新しいものを採る
    const d = entry?.latest?.recorded_on;
    if (d && (!recordedOn || d > recordedOn)) recordedOn = d;
  }

  if (Object.keys(prices).length === 0) {
    throw new Error("nanboya: 価格を1件も取得できませんでした(JSON構造が変わった可能性)");
  }

  // 前のエンドポイントは生きたまま中身だけ古くなっていた。同じことが起きても
  // 黙って古い値を書き込まないよう、日付を見て失敗させる。
  const today = new Date().toISOString().slice(0, 10);
  const ageDays = recordedOn
    ? Math.round((Date.parse(today) - Date.parse(recordedOn)) / 86400000)
    : null;
  if (ageDays === null || ageDays > MAX_AGE_DAYS) {
    throw new Error(
      `nanboya: 取得したデータのrecorded_on(${recordedOn ?? "不明"})が${ageDays ?? "?"}日前です。` +
        `エンドポイントの更新が止まっていないか確認してください。`,
    );
  }

  return { prices, updatedAt: recordedOn };
}
