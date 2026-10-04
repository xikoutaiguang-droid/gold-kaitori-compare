import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_PATH = path.resolve(__dirname, "../../../data/companies.json");

export async function loadCompanies() {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function saveCompanies(companies) {
  await writeFile(DATA_PATH, JSON.stringify(companies, null, 2) + "\n", "utf-8");
}

/**
 * 指定IDの会社のpriceDataを更新する。取得できた純度のみ上書きし、
 * 取得できなかった純度は既存の値を残す(部分的な取得失敗でデータを失わないため)。
 */
export function applyPriceUpdate(companies, id, prices, updatedAt) {
  const company = companies.find((c) => c.id === id);
  if (!company) {
    throw new Error(`Unknown company id: ${id}`);
  }
  const before = JSON.stringify(company.priceData.prices);
  // 取得できたものだけを残す。前回の値に重ねない。
  //
  // 重ねていたせいで、取得元が返さなくなった純度が消えずに残り、しかも
  // 他の純度を取り直すたびに updatedAt が新しくなるので、いつまでも
  // 「今日の価格」として並んでいた。高山質店のPt900がそれで、同社のページには
  // 8,300円と出ているのに、こちらは古い8,610円を出し続けていた。
  //
  // 取れなくなったぶんが消えるのは、出なくなるだけで誤りにはならない。
  // 間違った値を今日の値として出し続けるほうが重い。
  const dropped = Object.keys(JSON.parse(before)).filter((k) => !(k in prices));
  company.priceData.prices = { ...prices };
  const changed =
    JSON.stringify(company.priceData.prices) !== before || company.priceData.updatedAt !== updatedAt;
  company.priceData.updatedAt = updatedAt;

  // updatedAt は各社が公表している日付だったり、取得日を代用していたりで意味が揃わない。
  // しかも1日に複数回価格を動かす店がある(コメ兵は建値の公表後と14時ごろの2回)。
  // 日付だけでは、読む人が朝の値と午後の値を見分けられないので、
  // 当サイトが実際に取りに行った時刻を別に残す。
  //
  // ただし毎回書き換えると、値が1円も動いていない回でも fetchedAt だけが変わる。
  // 1時間おきに取りに行くようにしたので、それだけで1日11回のコミットと
  // デプロイが走ることになり、中身は何も変わらない。
  // 値が動いたとき(changed)と、日付が変わったときだけ書き換える。
  // check-freshness.mjs は fetchedAt を .slice(0,10) で日付までしか見ないので、
  // 「何日も取得できていない」の検出はこれまでどおり効く。
  // 表示にも「その値をいつ取ったか」が出るが、同じ値を取り直しても
  // その値を得た時刻は変わらないので、むしろこちらが正しい。
  const prev = company.priceData.fetchedAt;
  const now = new Date().toISOString();
  if (changed || !prev || prev.slice(0, 10) !== now.slice(0, 10)) {
    company.priceData.fetchedAt = now;
  }
  // 取得元が返さなくなった純度は、ページから消える。いつも返ってこない
  // 純度なら直すべきは取得側なので、黙って消さずに呼び出し元へ伝える。
  return { company, dropped };
}
