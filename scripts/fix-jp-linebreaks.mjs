/**
 * JSXの中で日本語の文が改行されていると、画面では半角スペースになる。
 *
 * 何が起きていたか:
 * ソースを読みやすく折り返しただけのつもりが、JSXは行の区切りを空白1つに変える。
 * 日本語には分かち書きが無いので、「ありません。 どの店も」「〜は どこにも」のように
 * 文の途中が不自然に空く。実機(390px)では1行24文字しか入らないため、
 * その空きが行ごとに現れて、文字が散らばって見えていた。
 * 20本のコラムだけで448か所あった。
 *
 * 直し方:
 * 前の行が日本語で終わり、次の行が日本語で始まるときに、その2行を繋ぐ。
 * 画面に出る文字は1文字も変わらない(消えるのは行の区切りだけ)。
 *
 *   node scripts/fix-jp-linebreaks.mjs          直す
 *   node scripts/fix-jp-linebreaks.mjs --check  直す必要があるかだけ見る(CI用)
 *
 * コメントの中は繋がない。画面に影響しないうえ、長い1行になって読みにくくなるだけなので。
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET_DIRS = ["app", "components"];
const EXTENSIONS = [".tsx"];

/** 行頭に来たら「日本語の続き」とみなす文字 */
const HEAD = /^[぀-ゟ゠-ヿ一-鿿「『（【]/;
/** 行末がこれなら「文の途中で折り返した」とみなす */
const TAIL = /[぀-ゟ゠-ヿ一-鿿、。」』）！？…ー〜】]$/;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      yield* walk(full);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      yield full;
    }
  }
}

/** 各行がコメントの中かどうか。{/* *\/} と /* *\/ と // を見る */
function commentFlags(lines) {
  let depth = 0;
  return lines.map((line) => {
    const starts = (line.match(/\/\*/g) ?? []).length;
    const ends = (line.match(/\*\//g) ?? []).length;
    const was = depth > 0;
    depth = Math.max(0, depth + starts - ends);
    return was || starts > 0 || ends > 0 || line.trimStart().startsWith("//");
  });
}

function joinLines(source) {
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.split(newline);
  const comments = commentFlags(lines);

  const out = [];
  const outComment = [];
  let joins = 0;

  lines.forEach((line, i) => {
    const prev = out[out.length - 1];
    if (out.length && !comments[i] && !outComment[outComment.length - 1]) {
      if (TAIL.test(prev.trimEnd()) && HEAD.test(line.trimStart())) {
        out[out.length - 1] = prev.trimEnd() + line.trimStart();
        joins += 1;
        return;
      }
    }
    out.push(line);
    outComment.push(comments[i]);
  });

  return { text: out.join(newline), joins };
}

async function main() {
  const check = process.argv.includes("--check");
  const changed = [];
  let total = 0;

  for (const dir of TARGET_DIRS) {
    for await (const file of walk(path.join(ROOT, dir))) {
      const source = await readFile(file, "utf8");
      const { text, joins } = joinLines(source);
      if (!joins) continue;
      total += joins;
      changed.push(`${path.relative(ROOT, file).replace(/\\/g, "/")} (${joins}か所)`);
      if (!check) await writeFile(file, text, "utf8");
    }
  }

  if (!changed.length) {
    console.log("日本語の文が途中で折り返されている箇所はありません。");
    return;
  }

  if (check) {
    console.error(`文の途中で折り返されている箇所が ${total}か所あります:`);
    for (const c of changed) console.error(`  - ${c}`);
    console.error("\n  そのままだと画面で「〜です。 つぎの文」のように空きます。");
    console.error("  node scripts/fix-jp-linebreaks.mjs を実行してください。");
    process.exit(1);
  }

  console.log(`${total}か所を繋ぎました:`);
  for (const c of changed) console.log(`  - ${c}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
