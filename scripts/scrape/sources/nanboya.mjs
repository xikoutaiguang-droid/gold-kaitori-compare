import { fetchJson } from "../lib/fetchHtml.mjs";

const URL = "https://nanboya.com/ajax/metals-market-prices.json";

// JSON内のキー名 -> このアプリの純度キー
const KEY_TO_PURITY = {
  k24: "k24",
  k22: "k22",
  k20: "k20",
  k18: "k18",
  k14: "k14",
  k10: "k10",
};

export const id = "nanboya";

// 注意: このエンドポイントはrobots.txtでAllow指定されているが、
// 2026-09-03時点で取得した内容のlast_modifiedが2025-11-02のまま更新されておらず、
// 実際にサイト側で使われているライブデータと一致しない可能性がある。
// 運用時は last_modified が実行日に近いことを必ず確認し、古い場合は
// このソースを一時的に無効化すること。
export async function scrape() {
  const json = await fetchJson(URL);
  const lastModified = json?.header?.last_modified?.date;

  const prices = {};
  for (const [key, purity] of Object.entries(KEY_TO_PURITY)) {
    const entry = json?.data?.[key];
    const value = Number(entry?.last_price);
    if (Number.isFinite(value) && value > 0) {
      prices[purity] = value;
    }
  }

  if (Object.keys(prices).length === 0) {
    throw new Error("nanboya: 価格を1件も取得できませんでした(JSON構造が変わった可能性)");
  }

  const today = new Date().toISOString().slice(0, 10);
  const isStale = lastModified && lastModified !== today;

  return {
    prices,
    updatedAt: lastModified ?? today,
    warning: isStale
      ? `nanboya: JSONのlast_modified(${lastModified})が本日(${today})と異なります。データが古い可能性があります。`
      : undefined,
  };
}
