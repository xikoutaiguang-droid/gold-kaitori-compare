// data/companies.json の現在価格から、純度ごとの単純平均を計算して
// data/priceHistory.json に日次エントリとして追記する。
//
// 特定1社に依存しない「市場全体の目安」を時系列で残すことで、
// トップページ・売り時診断ページでの推移グラフに使う。
//
// 実行タイミング: npm run scrape (各社の価格更新)の後に毎日1回実行することを想定。
// 同じ日付のエントリが既にある場合は上書きする(1日に複数回実行しても壊れない)。
//
// 実行: node scripts/scrape/append-history.mjs

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPANIES_PATH = path.resolve(__dirname, "../../data/companies.json");
const HISTORY_PATH = path.resolve(__dirname, "../../data/priceHistory.json");

const TRACKED_PURITIES = ["k24", "k18", "pt850", "ag"];

async function main() {
  const companies = JSON.parse(await readFile(COMPANIES_PATH, "utf-8"));
  const history = JSON.parse(await readFile(HISTORY_PATH, "utf-8"));

  const today = new Date().toISOString().slice(0, 10);
  const prices = {};

  for (const purity of TRACKED_PURITIES) {
    const values = companies
      .map((c) => c.priceData.prices[purity])
      .filter((v) => typeof v === "number" && v > 0);
    if (values.length === 0) continue;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    prices[purity] = Math.round(avg);
  }

  if (Object.keys(prices).length === 0) {
    console.error("価格データが1件も見つかりませんでした。先にnpm run scrapeを実行してください。");
    process.exit(1);
  }

  const existingIndex = history.entries.findIndex((e) => e.date === today);
  const entry = { date: today, prices };
  if (existingIndex >= 0) {
    history.entries[existingIndex] = entry;
    console.log(`[更新] ${today}のエントリを上書きしました。`);
  } else {
    history.entries.push(entry);
    console.log(`[追加] ${today}のエントリを追加しました。`);
  }

  history.entries.sort((a, b) => (a.date < b.date ? -1 : 1));

  await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2) + "\n", "utf-8");
  console.log(JSON.stringify(prices));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
