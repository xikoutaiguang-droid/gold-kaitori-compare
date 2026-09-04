// 大阪取引所の金先物(限日先物=スポット相当・直近限月の標準先物)の清算値段を
// data/futuresOutlook.json に日次で記録する。
//
// 「予想(直近限月の先物価格)」と「実際(その限月日が来たときの限日先物=スポット相当価格)」を
// 後で突き合わせて答え合わせ表示するための元データ。答え合わせ自体はlib/futuresOutlook.tsが
// このファイルを読んで表示時に計算する(このファイル自体は書き換えない)。
//
// 実行タイミング: 毎営業日1回実行することを想定。
// 実行: node scripts/scrape/record-futures-outlook.mjs

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchGoldFuturesSettlement } from "./lib/jpx.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTLOOK_PATH = path.resolve(__dirname, "../../data/futuresOutlook.json");

async function main() {
  const outlook = JSON.parse(await readFile(OUTLOOK_PATH, "utf-8"));

  const today = new Date().toISOString().slice(0, 10);
  const futures = await fetchGoldFuturesSettlement();

  const entry = {
    date: today,
    spotPrice: futures.spotPrice,
    nearestContract: futures.nearestContract,
    nearestTargetDate: futures.nearestTargetDate,
    nearestPrice: futures.nearestPrice,
  };

  const existingIndex = outlook.entries.findIndex((e) => e.date === today);
  if (existingIndex >= 0) {
    outlook.entries[existingIndex] = entry;
    console.log(`[更新] ${today}のエントリを上書きしました。`);
  } else {
    outlook.entries.push(entry);
    console.log(`[追加] ${today}のエントリを追加しました。`);
  }

  outlook.entries.sort((a, b) => (a.date < b.date ? -1 : 1));

  await writeFile(OUTLOOK_PATH, JSON.stringify(outlook, null, 2) + "\n", "utf-8");
  console.log(JSON.stringify(entry));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
