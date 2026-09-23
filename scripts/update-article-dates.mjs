/**
 * 記事ページの公開日・更新日を git のコミット履歴から書き出す。
 *
 * 構造化データ(Article)に日付を載せたいが、日付を手で書くと必ず実態とずれる。
 * ファイルがいつ足されて、いつ最後に直されたかは git が知っているので、そこから採る。
 *
 * ビルド時に git を呼ばないのは、Vercel のビルド環境では履歴が浅く切られていて
 * 最初のコミットまで遡れないことがあるため。結果をファイルに落としてコミットする。
 *
 * 記事を追加・修正したらこれを実行して、出力を一緒にコミットする。
 * 日次ジョブには入れていない: actions/checkout の既定は fetch-depth: 1 で、
 * 浅いクローンでは最初のコミットまで遡れず、公開日が全部「今日」になってしまう。
 * 気づかないまま日付を書き換えるほうが、更新が1日遅れるより悪い。
 */
import { execFileSync } from "node:child_process";
import { readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "articleDates.json");

/** 記事として扱うページ。ここに無いページには Article を出さない。 */
const ARTICLE_DIRS = ["app/column", "app/guide"];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).trim();
}

/** そのファイルに触れたコミットの日付(古い順) */
function commitDates(file) {
  const out = git(["log", "--follow", "--format=%ad", "--date=short", "--", file]);
  if (!out) return [];
  return out.split("\n").reverse();
}

async function articlePages() {
  const found = [];
  for (const dir of ARTICLE_DIRS) {
    let names;
    try {
      names = await readdir(path.join(ROOT, dir), { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of names) {
      if (!entry.isDirectory()) continue;
      const file = `${dir}/${entry.name}/page.tsx`;
      const route = "/" + file.replace(/^app\//, "").replace(/\/page\.tsx$/, "");
      found.push({ route, file });
    }
  }
  return found.sort((a, b) => a.route.localeCompare(b.route));
}

/** 浅いクローンでは履歴が途中で切れているので、日付を書き出してはいけない */
function isShallow() {
  try {
    return git(["rev-parse", "--is-shallow-repository"]) === "true";
  } catch {
    return false;
  }
}

async function main() {
  if (isShallow()) {
    console.error("このリポジトリは浅いクローン(shallow)です。最初のコミットまで遡れないため、");
    console.error("公開日が実際より新しく出てしまいます。git fetch --unshallow してから実行してください。");
    process.exit(1);
  }

  const pages = await articlePages();
  const articles = {};
  const missing = [];

  for (const { route, file } of pages) {
    const dates = commitDates(file);
    if (!dates.length) {
      // まだコミットしていない新しい記事。日付を作り出すよりは載せない。
      missing.push(route);
      continue;
    }
    articles[route] = { published: dates[0], modified: dates[dates.length - 1] };
  }

  await writeFile(
    OUT,
    JSON.stringify(
      {
        notes:
          "各記事ページの公開日(そのファイルの最初のコミット)と更新日(最後のコミット)。" +
          "scripts/update-article-dates.mjs が git の履歴から書き出す。手で編集しない。",
        articles,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  console.log(`記事の日付: ${Object.keys(articles).length}件を書き出しました`);
  if (missing.length) console.log(`履歴なし(未コミット): ${missing.join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
