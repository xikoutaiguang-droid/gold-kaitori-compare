/**
 * OGP画像用のフォントを作り直す。
 *
 * なぜ要るか:
 * 画像(lib/ogImage.tsx)に日本語を描くので、フォントを同梱している。元のフォントは
 * 4.6MBあるので丸ごとは置けず、いま使っている文字だけに絞った220KBを置いている。
 * 絞ったフォントに無い文字は、エラーにならず豆腐(□)で描かれる。
 *
 * 記事を1本足すたびに新しい漢字が増えるので、そのたびに作り直すことになる。
 * 前はこの手順が scripts/check-og-font.mjs のコメントに文章で書いてあるだけで、
 * 元のフォントの入手先も、coverage.json の作り方も残っていなかった。手で思い出す
 * ものにしておくと、次に足りない文字が出たときに同じ調べ直しをする。だから実行できる形にした。
 *
 * 使い方:
 *   1. 元のフォント(Noto Sans JP Bold、SIL OFL)を落とす。リポジトリには置かない。
 *      curl -L -o NotoSansJP-Bold.otf \
 *        https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/SubsetOTF/JP/NotoSansJP-Bold.otf
 *   2. node scripts/build-og-font.mjs <落としたotfのパス>
 *   3. node scripts/check-og-font.mjs で足りない文字が無いことを確かめる
 *
 * 必要なもの: python と fontTools (pip install fonttools)
 *
 * 何を収録するか:
 * ・lib/columns.ts の記事タイトルに出てくる文字(= 画像に描かれる文字)
 * ・画像に固定で描いている文字列
 * ・英数字・記号・ひらがな・カタカナ・全角記号の範囲。ここは「次の記事で
 *   新しいかなが出て豆腐になる」のを防ぐために、使っていなくても丸ごと入れる。
 *   漢字だけは数が多すぎるので、使っているものに限る。
 */
import { readFile, writeFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets", "fonts", "NotoSansJP-og.otf");
const COVERAGE = path.join(ROOT, "assets", "fonts", "coverage.json");

/** 画像に固定で描いている文字列。lib/ogImage.tsx と揃えること */
const FIXED = ["金買取相場比較", "kin-hikaku.com ／ コラム"];

/**
 * 文字数が少ない範囲は、使っていなくても丸ごと入れる。
 * scripts/check-og-font.mjs のコメントにあった並びをそのまま持ってきている。
 */
const KEEP_RANGES = [
  "U+0020-007E",
  "U+00A0-00FF",
  "U+2010-2027",
  "U+3000-303F",
  "U+3040-309F",
  "U+30A0-30FF",
  "U+FF01-FF60",
  "U+FFE0-FFE6",
];

function die(message) {
  console.error(message);
  process.exit(1);
}

async function main() {
  const src = process.argv[2];
  if (!src) {
    die(
      "元のフォントのパスを渡してください。\n" +
        "  curl -L -o NotoSansJP-Bold.otf \\\n" +
        "    https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/SubsetOTF/JP/NotoSansJP-Bold.otf\n" +
        "  node scripts/build-og-font.mjs NotoSansJP-Bold.otf",
    );
  }
  try {
    await stat(src);
  } catch {
    die(`${src} が読めません。`);
  }

  const columns = await readFile(path.join(ROOT, "lib", "columns.ts"), "utf8");
  const titles = [...columns.matchAll(/title: "([^"]+)"/g)].map((m) => m[1]);
  if (!titles.length) die("lib/columns.ts からタイトルを拾えませんでした。");

  const text = [...titles, ...FIXED].join("");
  const textFile = path.join(os.tmpdir(), `og-font-text-${process.pid}.txt`);
  await writeFile(textFile, text, "utf8");

  console.log(`記事タイトル ${titles.length}件 + 固定の文字列から、${new Set(text).size}種類の文字を収録します`);

  const args = [
    "-m",
    "fontTools.subset",
    src,
    `--text-file=${textFile}`,
    `--unicodes=${KEEP_RANGES.join(",")}`,
    `--output-file=${OUT}`,
    "--layout-features=*",
    "--no-hinting",
    "--desubroutinize",
  ];
  const py = spawnSync("python", args, { encoding: "utf8" });
  if (py.error) die(`python を実行できませんでした: ${py.error.message}`);
  if (py.status !== 0) {
    die(`fontTools.subset が失敗しました:\n${py.stdout ?? ""}${py.stderr ?? ""}`);
  }

  // できたフォントが実際に持っている文字から coverage.json を作る。
  // 指定した範囲ではなく結果から作るのは、元のフォントに無い文字は
  // 指定しても入らないため。指定のほうを写すと、入っていない文字を
  // 「入っている」と記録してしまう。
  const read = spawnSync(
    "python",
    [
      "-c",
      [
        "import sys, json",
        "from fontTools.ttLib import TTFont",
        "cps = sorted(TTFont(sys.argv[1]).getBestCmap())",
        "ranges = []",
        "for cp in cps:",
        "    if ranges and cp == ranges[-1][1] + 1: ranges[-1][1] = cp",
        "    else: ranges.append([cp, cp])",
        "json.dump(ranges, sys.stdout)",
      ].join("\n"),
      OUT,
    ],
    { encoding: "utf8" },
  );
  if (read.status !== 0) die(`収録範囲を読み出せませんでした:\n${read.stderr ?? ""}`);

  const ranges = JSON.parse(read.stdout);
  await writeFile(
    COVERAGE,
    `${JSON.stringify({
      note:
        "assets/fonts/NotoSansJP-og.otf が持っている文字の範囲(コードポイント)。" +
        "scripts/check-og-font.mjs が参照する。手で編集しない。" +
        "作り直しは scripts/build-og-font.mjs で行う。",
      ranges,
    })}\n`,
    "utf8",
  );

  const size = (await stat(OUT)).size;
  const count = ranges.reduce((n, [lo, hi]) => n + (hi - lo + 1), 0);
  console.log(
    `assets/fonts/NotoSansJP-og.otf を作り直しました (${Math.round(size / 1024)}KB / ${count}文字)`,
  );
  console.log("node scripts/check-og-font.mjs で確かめてください。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
