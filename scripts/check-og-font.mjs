/**
 * 記事タイトルの文字が、OGP画像のフォントに入っているかを調べる。
 *
 * なぜ要るか:
 * OGP画像(lib/ogImage.tsx)は日本語を描くためにフォントを同梱しているが、
 * 4.6MBを丸ごと置くわけにいかないので、いま使っている文字だけに絞ってある。
 * 絞ったフォントに無い文字は、エラーにならず豆腐(□)として描かれる。
 * 共有されて初めて気づく類の崩れ方なので、文字のほうを先に確かめる。
 *
 * 足りない文字が出たら、assets/fonts/ のフォントを作り直す:
 *   python -m fontTools.subset NotoSansJP-Bold.otf --text-file=タイトル一覧 \
 *     --unicodes="U+0020-007E,U+00A0-00FF,U+2010-2027,U+3000-303F,U+3040-309F,U+30A0-30FF,U+FF01-FF60,U+FFE0-FFE6" \
 *     --output-file=NotoSansJP-og.otf --layout-features="*" --no-hinting --desubroutinize
 * 収録範囲(coverage.json)も一緒に書き出すこと。
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const coverage = JSON.parse(
    await readFile(path.join(ROOT, "assets", "fonts", "coverage.json"), "utf8"),
  );
  const ranges = coverage.ranges;
  const covered = (cp) => ranges.some(([lo, hi]) => cp >= lo && cp <= hi);

  const src = await readFile(path.join(ROOT, "lib", "columns.ts"), "utf8");
  const titles = [...src.matchAll(/title: "([^"]+)"/g)].map((m) => m[1]);
  // 画像にはサイト名と固定の文字も描いている
  const fixed = ["金買取相場比較", "kin-hikaku.com ／ コラム"];

  const missing = new Map();
  for (const text of [...titles, ...fixed]) {
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if (!covered(cp)) {
        if (!missing.has(ch)) missing.set(ch, []);
        missing.get(ch).push(text);
      }
    }
  }

  console.log(`記事タイトル ${titles.length}件の文字を、OGP画像のフォントと照合しました`);

  if (!missing.size) {
    console.log("すべての文字が収録されています。");
    return;
  }

  console.error(`\nフォントに入っていない文字が ${missing.size}種類あります:`);
  for (const [ch, where] of missing) {
    console.error(`  - 「${ch}」(U+${ch.codePointAt(0).toString(16).toUpperCase()}) 「${where[0]}」`);
  }
  console.error("\n  このままだとOGP画像で豆腐(□)になります。");
  console.error("  scripts/check-og-font.mjs の手順でフォントを作り直してください。");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
