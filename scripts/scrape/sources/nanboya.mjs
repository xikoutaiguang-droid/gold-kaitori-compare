import { fetchJson } from "../lib/fetchHtml.mjs";

const URL = "https://nanboya.com/ajax/metals-market-prices.json";

/** これより古ければ取得失敗として扱う。lib/companies.ts の鮮度判定と揃えている */
const MAX_AGE_DAYS = 10;

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

// このエンドポイントはrobots.txtでAllow指定されているが、2025-11-02で更新が止まっている。
// なんぼや自身は https://nanboya.com/gold-kaitori/ で価格を公開し続けており、
// そちらの更新日は生HTMLにも入っているが、金額本体はJavaScriptで描画されるため
// 素のfetchでは読めない。取得を再開するにはヘッドレスブラウザが要る。
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

  // 以前はここで warning を返すだけで、古い値をそのまま書き込んでいた。
  // 結果、2025-11-02の価格が10か月間サイトに並び、実際の公表価格より
  // 約2,100円/g低い数字で17位に表示されていた。人が読む前提の警告は働かない。
  // 古いと分かった時点で失敗させ、前回の値を残したまま気づけるようにする。
  const ageDays = lastModified
    ? Math.round((Date.parse(today) - Date.parse(lastModified)) / 86400000)
    : null;
  if (ageDays === null || ageDays > MAX_AGE_DAYS) {
    throw new Error(
      `nanboya: 取得元JSONのlast_modified(${lastModified ?? "不明"})が${ageDays ?? "?"}日前です。` +
        `このエンドポイントは更新停止しています。公式の価格ページ(https://nanboya.com/gold-kaitori/)は` +
        `更新されていますが金額がJavaScript描画のため、取得方法の切り替えが必要です。`,
    );
  }

  return { prices, updatedAt: lastModified ?? today };
}
