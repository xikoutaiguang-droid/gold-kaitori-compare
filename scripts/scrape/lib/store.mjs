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
  company.priceData.prices = { ...company.priceData.prices, ...prices };
  company.priceData.updatedAt = updatedAt;
  // updatedAt は各社が公表している日付だったり、取得日を代用していたりで意味が揃わない。
  // しかも1日に複数回価格を動かす店がある(コメ兵は建値の公表後と14時ごろの2回)。
  // 日付だけでは、読む人が朝の値と午後の値を見分けられないので、
  // 当サイトが実際に取りに行った時刻を別に残す。
  company.priceData.fetchedAt = new Date().toISOString();
  return company;
}
