import { notImplemented } from "./_stub.mjs";

export const id = "brandoff";
const URL = "https://kaitori.brandoff.co.jp/kaitori/gold";

export const scrape = notImplemented(
  id,
  URL,
  "1gあたりの純度別価格表は無く、「金相場速報」として単一の参考値のみを掲示(しかも確認時点で2026年4月時点のまま更新されておらず、現在の日付とズレていた)。店頭問い合わせ制のため、信頼できる日次の数値を自動取得する手段がない。"
);
