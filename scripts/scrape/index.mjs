import { loadCompanies, saveCompanies, applyPriceUpdate } from "./lib/store.mjs";
import { sleep } from "./lib/fetchHtml.mjs";
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

const DELAY_MS = 1500; // 同一運用者からの連続アクセスを避けるための最低限のインターバル

async function main() {
  const only = process.argv[2]; // 例: `node index.mjs otakaraya` で1社だけ実行
  const targets = only ? SOURCES.filter((s) => s.id === only) : SOURCES;

  if (only && targets.length === 0) {
    console.error(`不明な会社ID: ${only}`);
    process.exit(1);
  }

  const companies = await loadCompanies();
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
      console.error(`[NG] ${source.id}: ${err.message}`);
      status.push({ id: source.id, ok: false, error: String(err.message) });
      ngCount++;
    }
    await sleep(DELAY_MS);
  }

  await saveCompanies(companies);

  // 失敗をログに出すだけでは足りなかった。ワークフローは continue-on-error で緑のまま進み、
  // 古い価格が残ったことに誰も気づかない。実際になんぼやは10か月そのままだった。
  // 結果をファイルに残してコミットに載せ、差分として目に入るようにする。
  // 1社だけ実行したときは全体の記録を壊さないよう書き出さない。
  if (!only) {
    await writeStatus({ ranAt: new Date().toISOString(), ok: okCount, ng: ngCount, sources: status });
  }

  console.log(`\n完了: 成功${okCount}件 / 失敗${ngCount}件。data/companies.jsonを更新しました。`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
