/**
 * 取得結果の点検。日次ジョブの最後に走らせ、問題があれば失敗させる。
 *
 * これが無かったせいで何が起きたか:
 * なんぼやの取得元JSONは2025-11-02で更新が止まっていたが、取得スクリプトは
 * [NG] をログに書くだけで、ワークフローは continue-on-error により緑のまま完走し、
 * 10か月前の価格が「今日の価格」として比較表に並び続けた。実際の公表価格より
 * 約2,100円/g低く、19社中17位という誤った順位で表示されていた。
 *
 * ログは誰も読まない。だから読まなくても分かる場所 ―― ワークフローの成否 ――
 * に出す。表示側の防御(lib/companies.ts の鮮度判定)とは別に、ここでは
 * 「取得が壊れていること自体」を検出する。
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data");

/** lib/companies.ts の PRICE_MAX_AGE_DAYS と揃えること */
const MAX_AGE_DAYS = 10;

function ageInDays(iso, today) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return null;
  const d = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Math.round((today - d) / 86400000);
}

async function readJson(name) {
  return JSON.parse(await readFile(path.join(DATA_DIR, name), "utf8"));
}

async function main() {
  const companies = await readJson("companies.json");
  let status = null;
  try {
    status = await readJson("scrapeStatus.json");
  } catch {
    // 初回はまだ無い。取得側の結果が無くても価格の古さは点検できる。
  }

  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const failures = (status?.sources ?? []).filter((s) => !s.ok);

  // 価格を公表している前提の社だけを対象にする。そもそも公表していない社は
  // updatedAt が無く、古いのではなく最初から無い。
  const stale = companies
    .filter((c) => c.priceData?.updatedAt && Object.keys(c.priceData.prices ?? {}).length > 0)
    .map((c) => ({ name: c.name, id: c.id, at: c.priceData.updatedAt, age: ageInDays(c.priceData.updatedAt, today) }))
    .filter((c) => c.age === null || c.age > MAX_AGE_DAYS)
    .sort((a, b) => (b.age ?? 0) - (a.age ?? 0));

  const lines = [];
  lines.push(`取得: 成功 ${status?.ok ?? "?"} / 失敗 ${status?.ng ?? "?"}`);
  if (failures.length) {
    lines.push("", `取得に失敗したソース (${failures.length}件):`);
    for (const f of failures) lines.push(`  - ${f.id}: ${f.error}`);
  }
  if (stale.length) {
    lines.push("", `${MAX_AGE_DAYS}日より古い価格 (${stale.length}社):`);
    for (const c of stale) lines.push(`  - ${c.name} (${c.id}): ${c.at} / ${c.age}日前`);
    lines.push("", "これらはサイト側の鮮度判定で順位から外れています。表示は正しいままですが、");
    lines.push("取得そのものが直っていないので、ソースを確認してください。");
  }
  if (!failures.length && !stale.length) lines.push("", "全ソース正常。古い価格はありません。");

  const report = lines.join("\n");
  console.log(report);

  // GitHub Actions の実行サマリーにも出す。ログを開かなくても見えるように。
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFile } = await import("node:fs/promises");
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `## 価格取得の点検\n\n\`\`\`\n${report}\n\`\`\`\n`, "utf8");
  }

  if (failures.length || stale.length) {
    console.error("\n点検に引っかかりました。上記を確認してください。");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
