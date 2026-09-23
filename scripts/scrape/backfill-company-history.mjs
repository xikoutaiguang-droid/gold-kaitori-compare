/**
 * 社別の価格履歴を、git のコミット履歴から掘り起こす。
 *
 * data/companies.json は日次ジョブが毎日上書きしているが、そのたびにコミットしているので、
 * 過去の各社の価格は履歴の中に残っている。priceHistory.json には各社の単純平均しか
 * 入れていなかったため、「この店が先週いくらだったか」は今まで取り出せなかった。
 *
 * 1日に2回実行しているので、日付ごとにいちばん新しいコミットを採る。
 * 一度実行すれば足りる想定だが、何度実行しても同じ結果になるよう書いてある。
 */
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data");
const OUT = path.join(DATA_DIR, "companyPriceHistory.json");
const TARGET = "data/companies.json";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

/** 日付 -> その日最後のコミットSHA */
function lastCommitPerDay() {
  const lines = git(["log", "--format=%H %ad", "--date=short", "--", TARGET]).trim().split("\n");
  const byDay = new Map();
  // git log は新しい順。各日で最初に出てきたものがその日の最後のコミット
  for (const line of lines) {
    const [sha, date] = line.split(" ");
    if (sha && date && !byDay.has(date)) byDay.set(date, sha);
  }
  return [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function snapshotAt(sha) {
  let raw;
  try {
    raw = git(["show", `${sha}:${TARGET}`]);
  } catch {
    return null;
  }
  let companies;
  try {
    companies = JSON.parse(raw);
  } catch {
    return null;
  }
  const out = {};
  for (const c of companies) {
    const prices = c?.priceData?.prices;
    if (prices && Object.keys(prices).length) out[c.id] = prices;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * 取得が壊れていた期間。ここで記録された値は「その社が公表していた価格」ではなく
 * 「当サイトが表示してしまっていた古い値」なので、履歴から外す。
 *
 * 残したままにすると、取得を直した日に大きな変動があったように見える。
 * 実際なんぼやは、旧エンドポイントの停止に気づいて差し替えた日に +1,860円/g 動いた
 * ように表示された。相場ではなく、こちらの修復である。
 * until(その日を含む)までを除外する。
 */
const BROKEN_UNTIL = {
  // 取得元JSONが2025-11-02で更新停止。2026-09-23に別エンドポイントへ差し替えた
  nanboya: "2026-09-22",
  // 日次ジョブが取得に失敗し続け、2026-09-22に手動で取り直すまで9/11の値のままだった
  goldmrs: "2026-09-21",
  refasta: "2026-09-21",
};

function stripBroken(companies, date) {
  const out = { ...companies };
  for (const [id, until] of Object.entries(BROKEN_UNTIL)) {
    if (date <= until) delete out[id];
  }
  return out;
}

async function main() {
  const days = lastCommitPerDay();
  const entries = [];
  for (const [date, sha] of days) {
    const companies = snapshotAt(sha);
    if (!companies) continue;
    const cleaned = stripBroken(companies, date);
    if (Object.keys(cleaned).length) entries.push({ date, companies: cleaned });
  }

  if (!entries.length) {
    console.error("履歴から1日ぶんも取り出せませんでした");
    process.exit(1);
  }

  const payload = {
    recordingStartedAt: entries[0].date,
    notes:
      "各社の公表買取価格(円/g)を日次で記録したもの。1日に2回取得しているため、" +
      "その日の最後に取得した値を採用している。" +
      "2026-09-23より前の分は git のコミット履歴から復元した。" +
      "取得が壊れていた期間の値(なんぼや〜9/22、ゴールドミセスとリファスタ〜9/21)は、" +
      "その社の公表価格ではなく当サイトが表示していた古い値なので除いてある。",
    entries,
  };
  await writeFile(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8");

  const size = JSON.stringify(payload).length;
  console.log(`${entries.length}日ぶんを書き出しました (${entries[0].date} 〜 ${entries[entries.length - 1].date})`);
  console.log(`社数(最新日): ${Object.keys(entries[entries.length - 1].companies).length}`);
  console.log(`ファイル: ${Math.round(size / 1024)}KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
