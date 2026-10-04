/**
 * 人が手で入れた値が、長いあいだ確かめられずに残っていないかを見る。
 *
 * なぜ要るか:
 * 2026年10月4日に全体を点検したとき、いちばん誤りが多かったのは
 * 対応地域(3社)と店舗数(1社)だった。どちらも人が転記した値で、
 * 相手が変えても、こちらが読み直さないかぎり誤ったまま出続ける。
 *
 * 機械で正しさを判定しようとしたが、できなかった。店舗一覧のURLが社ごとに違い、
 * トップページで判定すると15社中12社を誤検知した。鳴り続ける警報は読まれなくなる。
 *
 * そこで「合っているか」ではなく「いつ確かめたか」を見る。
 * 正しさは保証できないが、確かめないまま何か月も経つことは防げる。
 * 誤りが出続けた原因は、間違えたことではなく、見直す機会が無かったことなので。
 *
 * 確かめ方(手順):
 *   対応地域 … その社の店舗一覧ページを開き、都道府県を数える
 *   店舗数   … 「◯店舗」と書いてある箇所を探す
 *   確かめたら data/companies.json の handCheckedAt に当日の日付を入れる
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** これを過ぎたら読み直す(日) */
const MAX_AGE_DAYS = 60;
/** これを過ぎたらジョブを落とす(日) */
const BLOCK_AGE_DAYS = 90;

function ageInDays(iso, today) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return null;
  return Math.round((today - Date.UTC(+m[1], +m[2] - 1, +m[3])) / 86_400_000);
}

async function main() {
  const companies = JSON.parse(await readFile(path.join(ROOT, "data", "companies.json"), "utf8"));
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const rows = [];
  for (const c of companies) {
    const checked = c.handCheckedAt ?? {};

    // 「全国」1つだけを名乗る社は、地域を数え直す対象にならない。
    // 店舗数を公表していない社も同じ。確かめようがないものを催促しない。
    const needsRegions = !(c.regions?.length === 1 && c.regions[0] === "全国");
    const needsStoreCount = typeof c.storeCount === "number" && c.storeCount > 0;

    if (needsRegions) rows.push({ name: c.name, field: "対応地域", at: checked.regions ?? null });
    if (needsStoreCount) rows.push({ name: c.name, field: "店舗数", at: checked.storeCount ?? null });
  }

  const aged = rows
    .map((r) => ({ ...r, age: r.at ? ageInDays(r.at, today) : null }))
    .filter((r) => r.age === null || r.age > MAX_AGE_DAYS)
    .sort((a, b) => (b.age ?? 9999) - (a.age ?? 9999));

  console.log(`手で入れた値 ${rows.length}件のうち、${MAX_AGE_DAYS}日より新しいのは ${rows.length - aged.length}件`);

  if (!aged.length) {
    console.log("すべて最近確かめられています。");
    return;
  }

  const blocking = aged.filter((r) => r.age === null || r.age > BLOCK_AGE_DAYS);
  console.log(`\n読み直しが必要なもの (${aged.length}件):`);
  for (const r of aged) {
    const when = r.at ? `${r.at} (${r.age}日前)` : "一度も記録なし";
    console.log(`  - ${r.name} の${r.field}: ${when}`);
  }
  console.log("\n  その社の店舗一覧を開いて数え直し、data/companies.json の");
  console.log("  handCheckedAt に当日の日付を入れてください。");

  if (blocking.length) {
    console.error(`\n${BLOCK_AGE_DAYS}日を超えて確かめられていないものが ${blocking.length}件あります。`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
