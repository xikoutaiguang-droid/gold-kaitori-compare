/**
 * この PC から価格を取り直して push する。タスク スケジューラから1時間おきに呼ぶ。
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
 * 1日1回ではなく1時間おきにする理由:
 * 各社が価格を出す時刻はばらばらで、朝のうちは揃わない。コミット履歴で
 * 「その時刻にサイトが今日の価格を出せていた社の割合」を実測すると、
 * 平日の8時台2%、9時台50%、10時台66%、11時台73%、12時台95%だった。
 * 取得が1日2回(10:30と16:30)しかないので、その間に価格を出した社は
 * 次の回まで前日の日付のまま表示されることになる。
 *
 * GitHub Actions 側にも1時間おきの catch-up があるが、スケジュール実行が
 * 落とされたり数時間遅れたりする。実測では9/28に入れてから5日間で、
 * 朝9〜11時台の枠が値を拾えたことは一度も無かった。こちらは自分のPCなので
 * 遅延しない。どちらか一方に寄せず、両方動かす。
 *
 * 1回目は全社、2回目以降は遅れている社だけ:
 * 全社を毎時取りに行くと1日220件を超える。相手に対して過剰なので、
 * その日まだ全社取得をしていなければ全社、済んでいれば --stale で
 * 「まだ今日の日付になっていない社」だけにする。対象は日中に減っていき、
 * 全社揃った時点で0件になって何も取りに行かなくなる。
 * 1日1回は全社を取る必要がある。1〜2社だけ取ると、市場の動きを決められず
 * 「その社だけ不自然に動いていないか」の判定が粗くなるため。
 *
 * 最初は .cmd で書いたが、cmd の && || と for /l の入れ子が固まったので
 * Node に移した。ここでやっているのは git と node の呼び出しだけ。
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOG_DIR = path.join(ROOT, ".local");
const LOG = path.join(LOG_DIR, "local-refresh.log");
/** その日に全社取得を済ませたかどうかの目印。日付を1行だけ書く */
const FULL_MARK = path.join(LOG_DIR, "last-full-sweep.txt");

/** 1日1回。全社を取りに行き、履歴や先物の見通しもまとめて更新する */
const FULL_STEPS = [
  ["scripts/scrape/index.mjs"],
  ["scripts/scrape/update-reference-rate.mjs"],
  ["scripts/scrape/append-history.mjs"],
  ["scripts/scrape/append-company-history.mjs"],
  ["scripts/scrape/record-futures-outlook.mjs"],
];

/** 2回目以降。まだ今日の日付になっていない社だけ拾いに行く */
const CATCH_UP_STEPS = [
  // 建値も日中に動く。各社の値と同じ日で揃うよう先に取る
  ["scripts/scrape/update-reference-rate.mjs"],
  ["scripts/scrape/index.mjs", "--stale"],
  ["scripts/scrape/append-history.mjs"],
  ["scripts/scrape/append-company-history.mjs"],
];

/** 日本時間の日付。UTCで切ると朝9時より前が前日になってしまう */
function todayJst() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function fullSweepDoneToday() {
  try {
    return readFileSync(FULL_MARK, "utf8").trim() === todayJst();
  } catch {
    return false; // 目印が無い = まだ
  }
}

function markFullSweep() {
  try {
    mkdirSync(LOG_DIR, { recursive: true });
    writeFileSync(FULL_MARK, `${todayJst()}
`, "utf8");
  } catch {
    // 書けなければ次回も全社取得になるだけで、害は無い
  }
}

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
  const full = !fullSweepDoneToday();
  log(full ? "開始 (全社取得)" : "開始 (遅れている社だけ)");

  // CI が先にコミットしていることがあるので、取得の前に合わせる
  git(["pull", "--rebase", "--autostash", "origin", "main"], { allowFail: true });

  for (const step of full ? FULL_STEPS : CATCH_UP_STEPS) {
    log(`実行: ${step.join(" ")}`);
    // 1社の失敗で全体を止めない。日次ジョブの continue-on-error と同じ扱い
    run(process.execPath, step, { allowFail: true });
  }
  // 取得できた社が1社でもあれば、その日の全社取得は済んだものとして扱う。
  // ここで失敗していても、次の回が --stale で拾いに行く。
  if (full) markFullSweep();

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

  // 点検は全社取得の回だけ。--stale の回は対象が「遅れている社」に偏っていて、
  // 毎時同じ警告が11回ログに並ぶだけになる。
  if (full) {
    log("点検");
    run(process.execPath, ["scripts/scrape/check-freshness.mjs"], { allowFail: true });
  }

  log("終了");
}

main();
