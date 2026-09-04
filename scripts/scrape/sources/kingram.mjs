import { fetchText } from "../lib/fetchHtml.mjs";

const URL = "https://kingram.jp/lineup/goldplatinum/gold/";

// ページはグラフ描画用に <script> 内へ window.marketData = {...}; という
// JSONオブジェクトを直接埋め込んでいる(独立したAPI/JSONエンドポイントは無い)。
// "gold"/"platinum"/"silver"キーは小売相場(参考値)、それ以外が買取価格の純度別系列。
const KEY_TO_PURITY = {
  k24: "k24",
  k22: "k22",
  k20: "k20",
  k18: "k18",
  k14: "k14",
  k10: "k10",
  k9: "k9",
  pt1000: "pt1000",
  pt950: "pt950",
  pt900: "pt900",
  pt850: "pt850",
  sv1000: "ag",
};

export const id = "kingram";

export async function scrape() {
  const html = await fetchText(URL);
  const match = html.match(/window\.marketData\s*=\s*(\{[\s\S]*?\});/);
  if (!match) {
    throw new Error("kingram: window.marketDataが見つかりませんでした(ページ構造が変わった可能性)");
  }

  const marketData = JSON.parse(match[1]);
  const prices = {};
  let updatedAt = null;

  for (const [dataKey, purity] of Object.entries(KEY_TO_PURITY)) {
    const series = marketData?.[dataKey]?.["30"];
    if (!Array.isArray(series) || series.length === 0) continue;

    // 日付が必ずしも配列末尾=最新とは限らないため、date文字列の最大値を採用する。
    const latest = series.reduce((a, b) => (b.date > a.date ? b : a));
    const value = Number(latest.price);
    if (Number.isFinite(value) && value > 0) {
      prices[purity] = value;
      if (!updatedAt || latest.date > updatedAt) updatedAt = latest.date;
    }
  }

  if (Object.keys(prices).length === 0) {
    throw new Error("kingram: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  return { prices, updatedAt: updatedAt ?? new Date().toISOString().slice(0, 10) };
}
