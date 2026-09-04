import { fetchJson } from "../lib/fetchHtml.mjs";

export const id = "kaitori-daikichi";
// トップページがfetchしている実際のJSON API(ブラウザのNetworkタブで確認)。
// 地金(インゴット)価格ではなく、他社と条件を揃えるためscrap(地金化した貴金属の買取)価格を使用する。
const URL = "https://www.kaitori-daikichi.jp/list_gold/today_gold.json";

// APIのnameキー → サイト共通のPurityキー。地金プレミアムの乗るK18WG/K14WGや、
// 当サイトが扱わない刻印純度(K23/K17/K12/K8/K7/K5)は対象外とする。
const AU_NAME_TO_PURITY = {
  K24: "k24",
  K22: "k22",
  "K21.6": "k21_6",
  K20: "k20",
  K18: "k18",
  K14: "k14",
  K10: "k10",
  K9: "k9",
};

const PT_NAME_TO_PURITY = {
  Pt1000: "pt1000",
  Pt950: "pt950",
  Pt900: "pt900",
  Pt850: "pt850",
};

export async function scrape() {
  const json = await fetchJson(URL);
  const data = json?.data;
  const priceDate = data?.market?.price_date; // "YYYYMMDD"
  if (!priceDate || !/^\d{8}$/.test(priceDate)) {
    throw new Error("kaitori-daikichi: market.price_dateが取得できませんでした(APIレスポンス構造が変わった可能性)");
  }

  const njBuy = data.nj_buy ?? {};
  const prices = {};

  for (const entry of njBuy.au_scrap ?? []) {
    const purity = AU_NAME_TO_PURITY[entry.name];
    const value = Number(entry.price);
    if (purity && Number.isFinite(value) && value > 0) prices[purity] = value;
  }
  for (const entry of njBuy.pt_scrap ?? []) {
    const purity = PT_NAME_TO_PURITY[entry.name];
    const value = Number(entry.price);
    if (purity && Number.isFinite(value) && value > 0) prices[purity] = value;
  }
  // シルバーは純銀(Sv1000)を採用。他社の"ag"値(300円台)とも整合する。
  const sv1000 = (njBuy.ag_scrap ?? []).find((e) => e.name === "Sv1000");
  const svValue = Number(sv1000?.price);
  if (Number.isFinite(svValue) && svValue > 0) prices.ag = svValue;

  if (Object.keys(prices).length === 0) {
    throw new Error("kaitori-daikichi: 価格を1件も取得できませんでした(ページ構造が変わった可能性)");
  }

  const updatedAt = `${priceDate.slice(0, 4)}-${priceDate.slice(4, 6)}-${priceDate.slice(6, 8)}`;
  return { prices, updatedAt };
}
