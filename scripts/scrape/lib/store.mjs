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
  return company;
}
