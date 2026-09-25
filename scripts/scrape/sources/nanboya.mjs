import { fetchJson } from "../lib/fetchHtml.mjs";

/**
 * なんぼやの公表価格。
 *
 * 取得先は robots.txt が明示的に許可しているエンドポイントに限る。
 * 同社の robots.txt は "Disallow: /ajax" としたうえで、
 *   Allow: /ajax/todays-prices.json
 *   Allow: /ajax/metals-market-prices.json
 * の2本だけを開けている。
 *
 * 経緯:
 * ・metals-market-prices.json は2025-11-02で更新が止まり、10か月前の価格を載せ続けていた
 * ・そこで価格ページが実際に呼んでいる /ajax/metal-price/metal-list.json に切り替えたが、
 *   これは Allow に並んでいない = Disallow: /ajax の対象で、取りに行ってはいけない場所だった
 * ・todays-prices.json は許可されていて、中身も最新である
 *
 * 切り替えにあたり、旧エンドポイントで保存済みの2026-09-24の値13品位すべてと
 * 突き合わせて、下のキー対応が正しいことを確認している(全件一致)。
 * とくに gold-k21-price は当アプリの k21_6(21.6金)と同じ値だった。
 */
const URL = "https://nanboya.com/ajax/todays-prices.json";

/** これより古ければ取得失敗として扱う。lib/companies.ts の鮮度判定と揃えている */
const MAX_AGE_DAYS = 10;

/**
 * 当アプリの純度キー -> このJSONのキー。
 * K23・K12・K8・K5・ホワイトゴールド・Pt/K18の半々は対応する純度キーが無いので取らない。
 */
const PURITY_TO_KEY = {
  k24: "gold-k24-price",
  k22: "gold-k22-price",
  k21_6: "gold-k21-price",
  k20: "gold-k20-price",
  k18: "gold-k18-price",
  k14: "gold-k14-price",
  k10: "gold-k10-price",
  k9: "gold-k9-price",
  pt1000: "platinum-pt1000-price",
  pt950: "platinum-pt950-price",
  pt900: "platinum-pt900-price",
  pt850: "platinum-pt850-price",
  ag: "silver-sv1000-price",
};

export const id = "nanboya";

export async function scrape() {
  const data = await fetchJson(URL);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("nanboya: オブジェクトが返りませんでした(エンドポイントの仕様が変わった可能性)");
  }

  const prices = {};
  for (const [purity, key] of Object.entries(PURITY_TO_KEY)) {
    const value = Number(data[key]);
    if (!Number.isFinite(value) || value <= 0) continue;
    prices[purity] = Math.round(value);
  }

  if (Object.keys(prices).length === 0) {
    throw new Error("nanboya: 価格を1件も取得できませんでした(JSON構造が変わった可能性)");
  }

  // 前のエンドポイントは生きたまま中身だけ古くなっていた。同じことが起きても
  // 黙って古い値を書き込まないよう、更新時刻を見て失敗させる。
  const ts = Number(data["last-updated-timestamp"]);
  if (!Number.isFinite(ts) || ts <= 0) {
    throw new Error("nanboya: last-updated-timestamp を読めませんでした。更新の新しさを確認できません。");
  }
  // 日本時間で日付を取る。UTCで切ると、この値(日本時間の0時ちょうど)が前日になる。
  // 実際 1790175600 は UTC 9/23 15:00 = JST 9/24 0:00 で、UTCのままだと1日ずれた。
  const updatedAt = new Date(ts * 1000 + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const ageDays = Math.round((Date.now() - ts * 1000) / 86400000);
  if (ageDays > MAX_AGE_DAYS) {
    throw new Error(
      `nanboya: 取得したデータの更新日(${updatedAt})が${ageDays}日前です。` +
        `エンドポイントの更新が止まっていないか確認してください。`,
    );
  }

  return { prices, updatedAt };
}
