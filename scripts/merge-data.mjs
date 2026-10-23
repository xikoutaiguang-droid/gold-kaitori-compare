/**
 * data/ の中身を、別のブランチ(既定は origin/main)のものと突き合わせて統合する。
 *
 * なぜ要るか:
 * 価格の取得は手元のタスクとGitHub Actionsの両方で動いている。どちらも data/ だけを
 * 書き換えてコミットするので、片方が push できない期間があると、両側が
 * 「相手にない記録」を持った状態になる。2026年10月15日から23日がそれで、
 *   ・手元にしかない日: 10/23
 *   ・originのほうが社数が多い日: 10/15(22社 対 21社)、10/16(21 対 11)、
 *     10/20(20 対 19)、10/21(21 対 11)
 * という形に分かれていた。片側を選ぶと、その日に取れていた社の記録が消える。
 *
 * 手元のタスクは push に失敗すると rebase を試し、衝突したら中断して
 * 「次の回で取り直します」と書いて終わる。ところが衝突の原因は同じコミットなので、
 * 次の回もその次の回も同じところで止まる。8日間、毎時それを繰り返していた。
 * 「次回やり直す」で直るのは一時的な失敗だけで、中身の食い違いは直らない。
 *
 * 統合の規則は、ファイルの性質ごとに分けてある:
 *
 *   日付で積み上がるもの … 日付をキーに和を取る。両方にある日は下の規則で選ぶ。
 *     companyPriceHistory.json  同じ日は社ごとに和を取る。同じ社が両方にあれば、
 *                               純度の数が多いほうを採る(取れている項目が多い)。
 *                               同数なら手元を採る。
 *     priceHistory.json         その日の各社の平均。純度の数が多いほうを採り、
 *                               同数なら origin を採る(Actions は遅れている社を
 *                               追加取得してから計算しているため、母数が大きい)。
 *     fxRate.json               同じ出どころの同じ値なので、どちらでもよい。手元を採る。
 *     futuresOutlook.json       同上。手元を採る。
 *
 *   いまの値を持つもの … 新しいほうを採る。
 *     companies.json            社ごとに priceData.fetchedAt を比べる。
 *                               ファイル単位で選ぶと、片方でしか取れなかった社が消える。
 *     scrapeStatus.json         ranAt が新しいほう(ファイル単位)。
 *     referenceRate.json        updatedAt が新しいほう。
 *     dentalAlloy.json          updatedAt が新しいほう。
 *
 *   それ以外 … 触らない。食い違っていれば報告だけする(人が決めること)。
 *
 * 使い方:
 *   node scripts/merge-data.mjs            統合して data/ に書く
 *   node scripts/merge-data.mjs --dry-run  何が変わるかだけ出す
 *   node scripts/merge-data.mjs --ref origin/main
 */
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const refIndex = args.indexOf("--ref");
const REF = refIndex !== -1 ? args[refIndex + 1] : "origin/main";

/** 日付で積み上がるファイルと、同じ日が両方にあったときの選び方 */
const DATE_SERIES = {
  "companyPriceHistory.json": "companies",
  "priceHistory.json": "preferTheirs",
  "fxRate.json": "preferOurs",
  "futuresOutlook.json": "preferOurs",
};

/** ファイル単位で新しいほうを採るもの。値は比べる時刻のキー */
const NEWEST_WINS = {
  "scrapeStatus.json": "ranAt",
  "referenceRate.json": "updatedAt",
  "dentalAlloy.json": "updatedAt",
};

function theirVersion(file) {
  const r = spawnSync("git", ["show", `${REF}:data/${file}`], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) return null;
  return JSON.parse(r.stdout);
}

/**
 * 手元の版。無ければ null を返す。
 *
 * 1つでも読めないと最後まで走らずに終わっていた。このスクリプトが呼ばれるのは
 * push が詰まったときだけなので、ここで落ちると詰まったまま戻れなくなる。
 * 片方にしか無いファイルは、片方を使えばよいだけのこと。
 */
async function ourVersion(file) {
  try {
    return JSON.parse(await readFile(path.join(ROOT, "data", file), "utf8"));
  } catch (err) {
    if (err?.code === "ENOENT") return null;
    throw err;
  }
}

async function writeData(file, value) {
  await writeFile(path.join(ROOT, "data", file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

/** その純度の数。取れている項目が多いほうを「中身がある」とみなす */
function filled(record) {
  return Object.values(record ?? {}).filter((v) => typeof v === "number" && v > 0).length;
}

/** 日付の配列を和にする。片方にしかない日はそのまま入れ、両方にある日は pick に任せる */
function unionByDate(ours, theirs, pick) {
  const byDate = new Map();
  for (const e of theirs) byDate.set(e.date, { theirs: e });
  for (const e of ours) byDate.set(e.date, { ...(byDate.get(e.date) ?? {}), ours: e });

  const merged = [];
  const notes = { onlyOurs: [], onlyTheirs: [], bothChanged: [] };
  for (const date of [...byDate.keys()].sort()) {
    const { ours: o, theirs: t } = byDate.get(date);
    if (o && !t) {
      merged.push(o);
      notes.onlyOurs.push(date);
    } else if (t && !o) {
      merged.push(t);
      notes.onlyTheirs.push(date);
    } else {
      const chosen = pick(o, t, notes);
      merged.push(chosen);
    }
  }
  return { merged, notes };
}

/** 同じ日の中を社ごとに和にする */
function pickCompanies(o, t, notes) {
  const ids = new Set([...Object.keys(t.companies ?? {}), ...Object.keys(o.companies ?? {})]);
  const companies = {};
  let gained = 0;
  for (const id of [...ids].sort()) {
    const mine = o.companies?.[id];
    const yours = t.companies?.[id];
    if (mine && !yours) companies[id] = mine;
    else if (yours && !mine) {
      companies[id] = yours;
      gained += 1;
    } else {
      // 同じ社が両方にある。取れている純度が多いほうを採る。同数なら手元
      companies[id] = filled(yours) > filled(mine) ? yours : mine;
    }
  }
  if (gained) notes.bothChanged.push(`${o.date}(+${gained}社)`);
  return { ...o, companies };
}

function pickByFilledThenTheirs(o, t, notes) {
  const chosen = filled(o.prices) > filled(t.prices) ? o : t;
  if (JSON.stringify(o) !== JSON.stringify(t)) notes.bothChanged.push(o.date);
  return chosen;
}

const PICKERS = {
  companies: pickCompanies,
  preferTheirs: pickByFilledThenTheirs,
  preferOurs: (o, t, notes) => {
    if (JSON.stringify(o) !== JSON.stringify(t)) notes.bothChanged.push(o.date);
    return o;
  },
};

async function mergeDateSeries(file, mode) {
  const theirs = theirVersion(file);
  const ours = await ourVersion(file);
  if (!theirs && !ours) return false;
  if (!theirs) {
    console.log(`  ${file}: ${REF} に無いため、手元のものをそのまま使います`);
    return false;
  }
  if (!ours) {
    console.log(`  ${file}: 手元に無いため、${REF} のものを使います`);
    if (!DRY_RUN) await writeData(file, theirs);
    return true;
  }
  const { merged, notes } = unionByDate(ours.entries, theirs.entries, PICKERS[mode]);
  const next = { ...ours, entries: merged };
  const changed = JSON.stringify(next.entries) !== JSON.stringify(ours.entries);

  console.log(
    `  ${file}: 手元${ours.entries.length}件 / ${REF}${theirs.entries.length}件 → ${merged.length}件`,
  );
  if (notes.onlyOurs.length) console.log(`      手元にだけあった日: ${notes.onlyOurs.join(", ")}`);
  if (notes.onlyTheirs.length)
    console.log(`      ${REF}にだけあった日: ${notes.onlyTheirs.join(", ")}`);
  if (notes.bothChanged.length)
    console.log(`      両方にあって中身が違った日: ${notes.bothChanged.join(", ")}`);

  if (!DRY_RUN && changed) {
    await writeData(file, next);
  }
  return changed;
}

async function mergeCompanies() {
  const file = "companies.json";
  const theirs = theirVersion(file);
  const ours = await ourVersion(file);
  if (!theirs && !ours) return false;
  if (!theirs) return false;
  if (!ours) {
    console.log(`  ${file}: 手元に無いため、${REF} のものを使います`);
    if (!DRY_RUN) await writeData(file, theirs);
    return true;
  }

  const theirById = new Map(theirs.map((c) => [c.id, c]));
  let tookTheirs = 0;
  const merged = ours.map((mine) => {
    const yours = theirById.get(mine.id);
    if (!yours) return mine;
    const mineAt = mine.priceData?.fetchedAt ?? "";
    const yoursAt = yours.priceData?.fetchedAt ?? "";
    if (yoursAt > mineAt) {
      tookTheirs += 1;
      // 価格の部分だけを新しいほうに差し替える。社の説明や対応地域は
      // こちらの編集が新しいことがあるので、まるごと入れ替えない。
      return { ...mine, priceData: yours.priceData };
    }
    return mine;
  });
  // こちらに無い社が向こうにあれば足す(新しく追加された社が反対側で入っている場合)
  const ourIds = new Set(ours.map((c) => c.id));
  const added = theirs.filter((c) => !ourIds.has(c.id));
  const next = [...merged, ...added];

  console.log(
    `  ${file}: ${tookTheirs}社の価格を${REF}の新しいものに差し替え` +
      (added.length ? `、${added.length}社を追加` : ""),
  );
  const changed = JSON.stringify(next) !== JSON.stringify(ours);
  if (!DRY_RUN && changed) {
    await writeData(file, next);
  }
  return changed;
}

async function mergeNewestWins(file, timeKey) {
  const theirs = theirVersion(file);
  const ours = await ourVersion(file);
  if (!theirs) return false;
  if (!ours) {
    console.log(`  ${file}: 手元に無いため、${REF} のものを使います`);
    if (!DRY_RUN) await writeData(file, theirs);
    return true;
  }
  const mineAt = ours?.[timeKey] ?? "";
  const yoursAt = theirs?.[timeKey] ?? "";
  if (yoursAt > mineAt) {
    console.log(`  ${file}: ${REF} のほうが新しいので差し替えます (${yoursAt} > ${mineAt})`);
    if (!DRY_RUN) {
      await writeData(file, theirs);
    }
    return true;
  }
  console.log(`  ${file}: 手元のほうが新しいか同じなので、そのままにします`);
  return false;
}

async function main() {
  console.log(`data/ を ${REF} と突き合わせます${DRY_RUN ? "（書き換えません）" : ""}\n`);

  let changed = false;
  console.log("日付で積み上がるもの:");
  for (const [file, mode] of Object.entries(DATE_SERIES)) {
    changed = (await mergeDateSeries(file, mode)) || changed;
  }

  console.log("\nいまの値を持つもの:");
  changed = (await mergeCompanies()) || changed;
  for (const [file, key] of Object.entries(NEWEST_WINS)) {
    changed = (await mergeNewestWins(file, key)) || changed;
  }

  // 扱いを決めていないファイルに食い違いがあれば、黙って通さずに知らせる
  const handled = new Set([
    ...Object.keys(DATE_SERIES),
    ...Object.keys(NEWEST_WINS),
    "companies.json",
  ]);
  const diff = spawnSync("git", ["diff", "--name-only", REF, "--", "data/"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const others = (diff.stdout ?? "")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((p) => path.basename(p))
    .filter((f) => !handled.has(f));
  if (others.length) {
    console.log(`\n統合の規則を決めていないのに食い違っているファイル (${others.length}件):`);
    for (const f of others) console.log(`  - data/${f}（手元のままにしました。中身を見てください）`);
  }

  console.log(
    `\n${DRY_RUN ? "書き換えていません。" : changed ? "data/ を書き換えました。" : "変更はありませんでした。"}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
