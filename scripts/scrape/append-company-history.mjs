/**
 * その日取得した各社の価格を、社別の履歴に追記する。
 *
 * priceHistory.json は各社の平均しか持たないので、「この店が先週いくらだったか」は
 * そこからは出せない。日次ジョブの最後にこれを走らせて、社別の値も残す。
 *
 * 記録する日付は実行日ではなく、その社が価格を公表した日(priceData.updatedAt)。
 * 取得に失敗した社は companies.json の値が前回のまま残るので、実行日で書くと
 * 「今日もこの値だった」という測っていない記録を作ってしまう。公表日で書けば、
 * 失敗した社はすでにある記録を上書きするだけで、日数は増えない。
 *
 * 1日に2回実行されるため、同じ公表日の記録は後の実行で上書きする。
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data");
const HISTORY = path.join(DATA_DIR, "companyPriceHistory.json");
const COMPANIES = path.join(DATA_DIR, "companies.json");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function main() {
  const companies = JSON.parse(await readFile(COMPANIES, "utf8"));
  const today = new Date().toISOString().slice(0, 10);

  let history;
  try {
    history = JSON.parse(await readFile(HISTORY, "utf8"));
  } catch {
    history = { recordingStartedAt: null, notes: "", entries: [] };
  }
  if (!Array.isArray(history.entries)) history.entries = [];

  const byDate = new Map(history.entries.map((e) => [e.date, e.companies]));
  const earliest = history.entries.length ? history.entries[0].date : today;

  let written = 0;
  let skipped = 0;
  for (const c of companies) {
    const prices = c?.priceData?.prices;
    if (!prices || !Object.keys(prices).length) continue;
    const updatedAt = c?.priceData?.updatedAt;
    // 公表日が読めない、記録開始より前、未来の日付 -- どれも信用できないので入れない
    if (!updatedAt || !ISO_DATE.test(updatedAt) || updatedAt < earliest || updatedAt > today) {
      skipped++;
      continue;
    }
    if (!byDate.has(updatedAt)) byDate.set(updatedAt, {});
    byDate.get(updatedAt)[c.id] = prices;
    written++;
  }

  if (!written) {
    console.error("記録できる価格が1社もないため、追記しません");
    process.exit(1);
  }

  history.entries = [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, cs]) => ({ date, companies: cs }));
  history.recordingStartedAt = history.entries[0].date;

  await writeFile(HISTORY, JSON.stringify(history, null, 2) + "\n", "utf8");
  console.log(
    `社別履歴: ${written}社を公表日で記録しました` +
      `${skipped ? `(公表日が古い/読めない ${skipped}社は除外)` : ""} ` +
      `/ 通算${history.entries.length}日 (最新 ${history.entries.at(-1).date})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
