import { fetchText } from "../lib/fetchHtml.mjs";

// 価格表示ページ(/brand/jewelry/gold/)は<span id="K24"></span>等の空箱にJSが値を書き込む方式。
// 実際の値はこの静的JSファイル内のbaseK/basePtと固定の計算式で決まっており、
// APIではなく単純な算術式なので、同じ式をこちらで再現して直接計算する。
const SOUBA_JS_URL = "https://www.netoff.co.jp/sell/js/souba.js";

export const id = "netoff";

export async function scrape() {
  const js = await fetchText(SOUBA_JS_URL);

  const baseKMatch = js.match(/var\s+baseK\s*=\s*(\d+)/);
  const basePtMatch = js.match(/var\s+basePt\s*=\s*(\d+)/);
  const dateMatch = js.match(/Update_Date"\]\s*=\s*"(\d{4})年(\d{1,2})月(\d{1,2})日/);

  if (!baseKMatch || !basePtMatch) {
    throw new Error("netoff: souba.jsからbaseK/basePtを取得できませんでした(計算式が変わった可能性)");
  }

  const baseK = Number(baseKMatch[1]);
  const basePt = Number(basePtMatch[1]);

  // souba_disp.js の計算式をそのまま再現(floor(round(base*率)*0.8))
  const calc = (base, rate) => Math.floor(Math.round(base * rate) * 0.8);

  const prices = {
    k24: calc(baseK, 0.965),
    k20: calc(baseK, 0.8),
    k18: calc(baseK, 0.735),
    k14: calc(baseK, 0.5),
    pt1000: calc(basePt, 0.965),
    pt950: calc(basePt, 0.915),
    pt900: calc(basePt, 0.88),
    pt850: calc(basePt, 0.83),
  };

  const updatedAt = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
    : new Date().toISOString().slice(0, 10);

  return { prices, updatedAt };
}
