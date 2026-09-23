/**
 * 社別の価格履歴を、git のコミット履歴から掘り起こす。
 *
 * data/companies.json は日次ジョブが毎日上書きしているが、そのたびにコミットしているので、
 * 過去の各社の価格は履歴の中に残っている。priceHistory.json には各社の単純平均しか
 * 入れていなかったため、「この店が先週いくらだったか」は今まで取り出せなかった。
 *
 * 記録する日付は、コミットした日ではなく、その社が価格を公表した日
 * (priceData.updatedAt)を使う。取得に失敗した日は companies.json の値が前日のまま
 * コミットされるので、コミット日で並べると「その日もその値だった」という記録を
 * 勝手に作ってしまう。updatedAt で並べれば、取れなかった日はそもそも記録が増えない。
 *
 * 一度実行すれば足りる想定だが、何度実行しても同じ結果になるよう書いてある。
 */
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data");
const OUT = path.join(DATA_DIR, "companyPriceHistory.json");
const TARGET = "data/companies.json";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

/** 日付 -> その日最後のコミットSHA(新しい順に見て最初に出てきたもの) */
function lastCommitPerDay() {
  const lines = git(["log", "--format=%H %ad", "--date=short", "--", TARGET]).trim().split("\n");
  const byDay = new Map();
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
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function main() {
  const days = lastCommitPerDay();
  if (!days.length) {
    console.error("コミット履歴が読めませんでした");
    process.exit(1);
  }
  const firstCommitDay = days[0][0];

  /** 公表日 -> { 社ID -> 価格 } */
  const byDate = new Map();
  let ignoredOlderThanRange = 0;
  let ignoredNoDate = 0;

  for (const [commitDay, sha] of days) {
    const companies = snapshotAt(sha);
    if (!companies) continue;
    for (const c of companies) {
      const prices = c?.priceData?.prices;
      if (!prices || !Object.keys(prices).length) continue;
      const updatedAt = c?.priceData?.updatedAt;
      if (!updatedAt || !ISO_DATE.test(updatedAt)) {
        ignoredNoDate++;
        continue;
      }
      // 取得が壊れて何か月も前の値が居座っていたもの(なんぼやの2025-11-02など)は、
      // 記録開始日を不自然に過去へ引き延ばすだけなので入れない。
      if (updatedAt < firstCommitDay || updatedAt > commitDay) {
        ignoredOlderThanRange++;
        continue;
      }
      if (!byDate.has(updatedAt)) byDate.set(updatedAt, {});
      // 同じ公表日の値は、あとに取得したコミットのほうを採る(1日に2回更新する店がある)
      byDate.get(updatedAt)[c.id] = prices;
    }
  }

  const entries = [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, companies]) => ({ date, companies }));

  if (!entries.length) {
    console.error("履歴から1日ぶんも取り出せませんでした");
    process.exit(1);
  }

  const payload = {
    recordingStartedAt: entries[0].date,
    notes:
      "各社の公表買取価格(円/g)の記録。日付はその社が価格を公表した日(公式サイトの表示日)で、" +
      "当サイトが取得した日ではない。取得に失敗した日は記録が増えないため、" +
      "値が動いていない日と取れなかった日が混ざらない。" +
      "2026-09-23より前の分は git のコミット履歴から復元した。",
    entries,
  };
  await writeFile(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8");

  console.log(`${entries.length}日ぶんを書き出しました (${entries[0].date} 〜 ${entries.at(-1).date})`);
  console.log(`社数(最新日): ${Object.keys(entries.at(-1).companies).length}`);
  console.log(`除外: 公表日なし ${ignoredNoDate}件 / 範囲外の公表日 ${ignoredOlderThanRange}件`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
