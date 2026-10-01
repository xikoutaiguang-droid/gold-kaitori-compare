import { loadCompanies, saveCompanies, applyPriceUpdate } from "./lib/store.mjs";
import { rejectImplausible } from "./lib/plausibility.mjs";
import { sleep } from "./lib/fetchHtml.mjs";
import { todayJst } from "./lib/date.mjs";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** 取得結果の記録先。data/ 配下に置くことで日次コミットの差分に必ず現れる */
const STATUS_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "data",
  "scrapeStatus.json",
);

async function writeStatus(status) {
  await writeFile(STATUS_PATH, JSON.stringify(status, null, 2) + String.fromCharCode(10), "utf8");
}

import * as otakaraya from "./sources/otakaraya.mjs";
import * as komehyo from "./sources/komehyo.mjs";
import * as daikichi from "./sources/daikichi.mjs";
import * as edaikoku from "./sources/edaikoku.mjs";
import * as nanboya from "./sources/nanboya.mjs";
import * as jewelcafe from "./sources/jewelcafe.mjs";
import * as kaitorielite from "./sources/kaitorielite.mjs";
import * as kingram from "./sources/kingram.mjs";
import * as bestlife from "./sources/bestlife.mjs";
import * as brandrevalue from "./sources/brandrevalue.mjs";
import * as gemsigma from "./sources/gemsigma.mjs";
import * as galleryrare from "./sources/galleryrare.mjs";
import * as manekiya from "./sources/manekiya.mjs";
import * as takayama78 from "./sources/takayama78.mjs";
import * as goldmrs from "./sources/goldmrs.mjs";
import * as nexus13 from "./sources/nexus13.mjs";
import * as ginzaya from "./sources/ginzaya.mjs";
import * as okuraya from "./sources/okuraya.mjs";
import * as brandoff from "./sources/brandoff.mjs";
import * as fukuchan from "./sources/fukuchan.mjs";
import * as shichifuku from "./sources/shichifuku.mjs";
import * as urucoco from "./sources/urucoco.mjs";
import * as rodeodrive from "./sources/rodeodrive.mjs";
import * as refasta from "./sources/refasta.mjs";
import * as netoff from "./sources/netoff.mjs";

const SOURCES = [
  otakaraya,
  komehyo,
  daikichi,
  edaikoku,
  nanboya,
  jewelcafe,
  kaitorielite,
  kingram,
  bestlife,
  brandrevalue,
  gemsigma,
  galleryrare,
  manekiya,
  takayama78,
  goldmrs,
  nexus13,
  ginzaya,
  okuraya,
  brandoff,
  fukuchan,
  shichifuku,
  urucoco,
  rodeodrive,
  refasta,
  netoff,
];

/** --stale で対象が0件のときは、取得も書き込みもせずに終える */
function staleEmpty(staleOnly, targets) {
  if (!staleOnly || targets.length > 0) return false;
  console.log(`全社が${todayJst()}の価格を出しています。取りに行く先はありません。`);
  return true;
}

const DELAY_MS = 1500; // 同一運用者からの連続アクセスを避けるための最低限のインターバル

/**
 * 日付が今日でない社だけを選ぶ(--stale)。
 *
 * 全社を1時間おきに取りに行くと、1日600件を超える取得になる。1店舗しかない社も
 * 混ざっているので、それは相手のサイトに対して過剰。実際に遅れているのは
 * 「まだ今日の値を出していない社」だけなので、そこだけ追いかける。
 * 追いかける対象は日中のうちに減っていき、全社が更新された時点で0件になる。
 *
 * 価格を公表していない社(scrapeMethod: "pending")は対象外。何度取りに行っても
 * 数値が存在しない。
 *
 * 更新が MAX_CHASE_DAYS より前で止まっている社も追わない。毎日は更新しない社や
 * 取得が壊れている社を1時間おきに叩いても、今日の値は出てこない。そちらは
 * 1日3回の通常実行と check-freshness の担当。
 */
const MAX_CHASE_DAYS = 5;

function daysSince(iso, todayIso) {
  const a = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  const b = /^(\d{4})-(\d{2})-(\d{2})$/.exec(todayIso);
  if (!a || !b) return null;
  const d1 = Date.UTC(Number(a[1]), Number(a[2]) - 1, Number(a[3]));
  const d2 = Date.UTC(Number(b[1]), Number(b[2]) - 1, Number(b[3]));
  return Math.round((d2 - d1) / 86400000);
}

function staleTargets(companies) {
  const today = todayJst();
  const lagging = new Set(
    companies
      .filter((c) => c.scrapeMethod !== "pending")
      .filter((c) => Object.keys(c.priceData?.prices ?? {}).length > 0)
      .filter((c) => c.priceData?.updatedAt !== today)
      .filter((c) => {
        const age = daysSince(c.priceData?.updatedAt, today);
        return age !== null && age <= MAX_CHASE_DAYS;
      })
      .map((c) => c.id),
  );
  return SOURCES.filter((s) => lagging.has(s.id));
}

async function main() {
  const arg = process.argv[2]; // 例: `node index.mjs otakaraya` で1社だけ実行
  const staleOnly = arg === "--stale";
  const only = staleOnly ? undefined : arg;

  const companies = await loadCompanies();
  // 更新前の値を控えておく。取得後に「その社だけ市場と違う動き方をしていないか」を見るため。
  const before = new Map(
    companies.map((c) => [c.id, { prices: { ...(c.priceData?.prices ?? {}) }, updatedAt: c.priceData?.updatedAt }]),
  );

  const targets = staleOnly
    ? staleTargets(companies)
    : only
      ? SOURCES.filter((s) => s.id === only)
      : SOURCES;

  if (only && targets.length === 0) {
    console.error(`不明な会社ID: ${only}`);
    process.exit(1);
  }

  if (staleEmpty(staleOnly, targets)) return;
  let okCount = 0;
  let ngCount = 0;
  const status = [];

  for (const source of targets) {
    try {
      const result = await source.scrape();
      applyPriceUpdate(companies, source.id, result.prices, result.updatedAt);
      console.log(`[OK] ${source.id}: ${Object.keys(result.prices).length}件取得 (${result.updatedAt})`);
      if (result.warning) console.warn(`  ⚠ ${result.warning}`);
      status.push({
        id: source.id,
        ok: true,
        priceCount: Object.keys(result.prices).length,
        updatedAt: result.updatedAt ?? null,
        warning: result.warning ?? null,
      });
      okCount++;
    } catch (err) {
      // 会社側が数値を公開していないケースは「失敗」ではない。混ぜると点検が常に赤くなる。
      const skipped = err?.notImplemented === true;
      console.error(`[${skipped ? "--" : "NG"}] ${source.id}: ${err.message}`);
      status.push({ id: source.id, ok: false, skipped, error: String(err.message) });
      if (!skipped) ngCount++;
    }
    await sleep(DELAY_MS);
  }

  // 取得できた値が、その社だけ market と違う動き方をしていないかを見る。
  // 例: リファスタは9月28日に全純度が一斉に+13.7%動いた(市場は-1.45%)。
  // ページ上の別の表を拾っていた疑いが強く、そのまま載せると順位が入れ替わる。
  // 怪しい値は書き込まず、前回の値を残す。古い値のほうが、嘘の値よりましなので。
  const rejected = rejectImplausible(companies, before);
  for (const r of rejected) {
    console.error(`[却下] ${r.id}: ${r.reason}`);
    const row = status.find((s) => s.id === r.id);
    if (row) {
      row.rejected = true;
      row.rejectReason = r.reason;
    }
  }

  await saveCompanies(companies);

  // 失敗をログに出すだけでは足りなかった。ワークフローは continue-on-error で緑のまま進み、
  // 古い価格が残ったことに誰も気づかない。実際になんぼやは10か月そのままだった。
  // 結果をファイルに残してコミットに載せ、差分として目に入るようにする。
  // 1社だけ・遅れている社だけを実行したときは、全体の記録を壊さないよう書き出さない。
  if (!only && !staleOnly) {
    await writeStatus({ ranAt: new Date().toISOString(), ok: okCount, ng: ngCount, sources: status });
  }

  console.log(`\n完了: 成功${okCount}件 / 失敗${ngCount}件。data/companies.jsonを更新しました。`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
