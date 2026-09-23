/**
 * その日の各社の価格を、社別の履歴に追記する。
 *
 * priceHistory.json は各社の平均しか持たないので、「この店が先週いくらだったか」は
 * そこからは出せない。日次ジョブの最後にこれを走らせて、社別の値も残す。
 *
 * 1日に2回実行されるため、同じ日の記録は上書きする。あとの実行のほうが新しい。
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data");
const HISTORY = path.join(DATA_DIR, "companyPriceHistory.json");
const COMPANIES = path.join(DATA_DIR, "companies.json");

async function main() {
  const companies = JSON.parse(await readFile(COMPANIES, "utf8"));

  const snapshot = {};
  for (const c of companies) {
    const prices = c?.priceData?.prices;
    if (prices && Object.keys(prices).length) snapshot[c.id] = prices;
  }
  if (!Object.keys(snapshot).length) {
    console.error("価格を持つ会社が1社もないため、追記しません");
    process.exit(1);
  }

  let history;
  try {
    history = JSON.parse(await readFile(HISTORY, "utf8"));
  } catch {
    history = { recordingStartedAt: null, notes: "", entries: [] };
  }
  if (!Array.isArray(history.entries)) history.entries = [];

  const today = new Date().toISOString().slice(0, 10);
  const existing = history.entries.findIndex((e) => e.date === today);
  const entry = { date: today, companies: snapshot };

  if (existing >= 0) {
    history.entries[existing] = entry;
  } else {
    history.entries.push(entry);
    history.entries.sort((a, b) => a.date.localeCompare(b.date));
  }
  history.recordingStartedAt = history.entries[0].date;

  await writeFile(HISTORY, JSON.stringify(history, null, 2) + "\n", "utf8");
  console.log(
    `社別履歴: ${today} を${existing >= 0 ? "更新" : "追加"}しました ` +
      `(${Object.keys(snapshot).length}社 / 通算${history.entries.length}日)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
