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

/** lib/campaigns.ts の CAMPAIGN_MAX_VERIFY_AGE_DAYS と揃えること */
const CAMPAIGN_MAX_VERIFY_AGE_DAYS = 14;

/** 終了がこの日数以内に迫ったキャンペーンは、切れる前に確認を促す */
const CAMPAIGN_ENDING_SOON_DAYS = 3;

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

  // 会社が価格を公開していないため実装していないソースは失敗ではない。
  // これを混ぜると点検が常に赤くなり、本当の失敗が埋もれる。
  const skipped = (status?.sources ?? []).filter((s) => !s.ok && s.skipped);
  const failures = (status?.sources ?? []).filter((s) => !s.ok && !s.skipped);

  // 価格を公表している前提の社だけを対象にする。そもそも公表していない社は
  // updatedAt が無く、古いのではなく最初から無い。
  const stale = companies
    .filter((c) => c.priceData?.updatedAt && Object.keys(c.priceData.prices ?? {}).length > 0)
    .map((c) => ({ name: c.name, id: c.id, at: c.priceData.updatedAt, age: ageInDays(c.priceData.updatedAt, today) }))
    .filter((c) => c.age === null || c.age > MAX_AGE_DAYS)
    .sort((a, b) => (b.age ?? 0) - (a.age ?? 0));

  const staleIds = new Set(stale.map((c) => c.id));
  // 取得に失敗しても、前回の値がまだ新しいなら実害は出ていない。一時的な不通は珍しくないので、
  // それで毎回落とすとやはり点検が見られなくなる。古い値が実際に表示されている場合だけ落とす。
  const blockingFailures = failures.filter((f) => staleIds.has(f.id));
  const transientFailures = failures.filter((f) => !staleIds.has(f.id));

  const lines = [];
  lines.push(
    `取得: 成功 ${status?.ok ?? "?"} / 失敗 ${failures.length} / 対象外 ${skipped.length}` +
      (skipped.length ? `(価格を公表していない会社)` : ""),
  );
  if (blockingFailures.length) {
    lines.push("", `取得に失敗し、表示中の価格も古くなっているソース (${blockingFailures.length}件):`);
    for (const f of blockingFailures) lines.push(`  - ${f.id}: ${f.error}`);
  }
  if (transientFailures.length) {
    lines.push("", `取得に失敗したが、前回の値がまだ新しいソース (${transientFailures.length}件):`);
    for (const f of transientFailures) lines.push(`  - ${f.id}: ${f.error}`);
    lines.push("  一時的な不通の可能性があります。続くようならソースを確認してください。");
  }
  if (stale.length) {
    lines.push("", `${MAX_AGE_DAYS}日より古い価格 (${stale.length}社):`);
    for (const c of stale) lines.push(`  - ${c.name} (${c.id}): ${c.at} / ${c.age}日前`);
    lines.push("", "これらはサイト側の鮮度判定で順位から外れています。表示は正しいままですが、");
    lines.push("取得そのものが直っていないので、ソースを確認してください。");
  }
  // キャンペーンは自動取得ではなく人の転記なので、放っておくと確認が途絶える。
  // 表示側は古くなれば勝手に消えるが、消えたことに気づかないと載せ直されない。
  let campaigns = { campaigns: [] };
  try {
    campaigns = await readJson("campaigns.json");
  } catch {
    // まだ無い場合は点検対象なし
  }
  const campaignIssues = [];
  const knownIds = new Set(companies.map((c) => c.id));
  for (const c of campaigns.campaigns ?? []) {
    // 会社IDを打ち間違えると、エラーも出ないまま単に表示されなくなる。
    // 「キャンペーンが無い」のと見分けが付かないので、ここで拾う。
    if (!knownIds.has(c.companyId)) {
      campaignIssues.push(`  - ${c.id}: companyId "${c.companyId}" は companies.json に存在しません。表示されません。`);
      continue;
    }
    const left = ageInDays(c.endsAt, today);
    const verifiedAge = ageInDays(c.verifiedAt, today);
    if (left === null || verifiedAge === null) {
      campaignIssues.push(`  - ${c.id}: 日付を読めません (endsAt=${c.endsAt} verifiedAt=${c.verifiedAt})`);
    } else if (left > 0) {
      campaignIssues.push(`  - ${c.id}: 終了済み (${c.endsAt} / ${left}日前)。data/campaigns.json から削除するか、後継の内容に更新してください。`);
    } else if (verifiedAge > CAMPAIGN_MAX_VERIFY_AGE_DAYS) {
      campaignIssues.push(`  - ${c.id}: 最終確認から${verifiedAge}日。表示から外れています。${c.sourceUrl} を見て verifiedAt を更新してください。`);
    } else if (-left <= CAMPAIGN_ENDING_SOON_DAYS) {
      campaignIssues.push(`  - ${c.id}: あと${-left}日で終了。後継のキャンペーンが出ていないか確認してください。`);
    }
  }
  if (campaignIssues.length) {
    lines.push("", `キャンペーンの要確認 (${campaignIssues.length}件):`);
    lines.push(...campaignIssues);
  }

  if (!failures.length && !stale.length && !campaignIssues.length) {
    lines.push("", "全ソース正常。古い価格もキャンペーンの確認漏れもありません。");
  }

  const report = lines.join("\n");
  console.log(report);

  // GitHub Actions の実行サマリーにも出す。ログを開かなくても見えるように。
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFile } = await import("node:fs/promises");
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `## 価格取得の点検\n\n\`\`\`\n${report}\n\`\`\`\n`, "utf8");
  }

  if (blockingFailures.length || stale.length || campaignIssues.length) {
    console.error("\n点検に引っかかりました。上記を確認してください。");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
