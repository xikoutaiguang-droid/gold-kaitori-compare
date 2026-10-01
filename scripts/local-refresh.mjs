/**
 * この PC から価格を取り直して push する。タスク スケジューラから1日1回呼ぶ。
 *
 * なぜ必要か:
 * ゴールドミセスとリファスタは、GitHub Actions からの取得が403で弾かれる。
 * 両社の robots.txt は対象ページを許可しているので、クロールを拒否されている
 * わけではなく、データセンターのIPがWAFで弾かれていると見ている。
 * 実測では、直近14日のうち両社の価格が記録に残ったのは5日だけだった。
 * 20社中2社が3分の2の日で比較から抜けていて、しかもリファスタはK18で
 * 1位になることが多い。住宅回線からは毎回取得できる。
 *
 * 2社だけでなく全社を取り直すのは、1〜2社だけ実行すると
 * 「その社だけ不自然に動いていないか」の判定(lib/plausibility.mjs)が
 * 効かなくなるため。市場の動きを決めるのに他社の値が要る。
 *
 * GitHub Actions 側の取得は止めない。こちらは PC の電源が入っているときしか
 * 動かないので、どちらか一方に寄せない。
 *
 * 最初は .cmd で書いたが、cmd の && || と for /l の入れ子が固まったので
 * Node に移した。ここでやっているのは git と node の呼び出しだけ。
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOG_DIR = path.join(ROOT, ".local");
const LOG = path.join(LOG_DIR, "local-refresh.log");

/** 取得に使うスクリプト。GitHub Actions の日次ジョブと同じ並び */
const STEPS = [
  "scripts/scrape/index.mjs",
  "scripts/scrape/update-reference-rate.mjs",
  "scripts/scrape/append-history.mjs",
  "scripts/scrape/append-company-history.mjs",
  "scripts/scrape/record-futures-outlook.mjs",
];

function log(line) {
  const stamp = new Date().toISOString();
  const text = `[${stamp}] ${line}\n`;
  process.stdout.write(text);
  try {
    mkdirSync(LOG_DIR, { recursive: true });
    appendFileSync(LOG, text, "utf8");
  } catch {
    // ログが書けなくても取得は続ける
  }
}

function run(cmd, args, { allowFail = false } = {}) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", shell: false });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  if (out) log(`  ${out.split("\n").slice(-6).join("\n  ")}`);
  if (r.status !== 0 && !allowFail) log(`  (終了コード ${r.status})`);
  return r.status === 0;
}

function git(args, opts) {
  return run("git", args, opts);
}

function main() {
  log("開始");

  // CI が先にコミットしていることがあるので、取得の前に合わせる
  git(["pull", "--rebase", "--autostash", "origin", "main"], { allowFail: true });

  for (const step of STEPS) {
    log(`実行: ${step}`);
    // 1社の失敗で全体を止めない。日次ジョブの continue-on-error と同じ扱い
    run(process.execPath, [step], { allowFail: true });
  }

  git(["add", "data/"], { allowFail: true });

  const diff = spawnSync("git", ["diff", "--cached", "--quiet"], { cwd: ROOT });
  if (diff.status === 0) {
    log("データに変更なし。コミットしません");
  } else {
    const day = new Date().toISOString().slice(0, 10);
    git(["commit", "-m", `chore: 手元から価格取得 ${day}`], { allowFail: true });

    let pushed = false;
    for (let i = 1; i <= 3 && !pushed; i++) {
      pushed = git(["push", "origin", "main"], { allowFail: true });
      if (!pushed) {
        log(`push に失敗しました。リベースして再試行します (${i}/3)`);
        git(["pull", "--rebase", "--autostash", "origin", "main"], { allowFail: true });
      }
    }
    log(pushed ? "push しました" : "push できませんでした。次回の実行で再試行されます");
  }

  log("点検");
  run(process.execPath, ["scripts/scrape/check-freshness.mjs"], { allowFail: true });

  log("終了");
}

main();
