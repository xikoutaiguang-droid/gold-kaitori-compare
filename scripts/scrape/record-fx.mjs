/**
 * ドル円の為替相場を日次で記録する。
 *
 * なぜ要るか:
 * 国内の金価格は「ドル建ての金価格 × ドル円」で決まる。だから円建ての値が上がっても、
 * 金そのものが上がったのか、円が安くなっただけなのかは、価格だけ見ても分からない。
 * 為替を並べて記録しておけば、その日の動きのうち為替で説明できる分を後から出せる。
 *
 * 出どころ:
 * 欧州中央銀行(ECB)が毎営業日に公表している外国為替参照相場。api.frankfurter.dev が
 * そのまま配信している(無料・申込不要)。中央銀行の公表値なので、どの業者の建値でもない。
 *
 * 注意:
 * ECBの参照相場は中央ヨーロッパ時間の午後に決まる。日本の取引所の清算値が決まる時刻とは
 * ずれているので、同じ日付でも時点は一致しない。この点はページ側にも書いてある。
 *
 * 実行: node scripts/scrape/record-fx.mjs
 * 初回や記録が飛んでいるときは、足りない日付をまとめて取りに行く。
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FX_PATH = path.resolve(__dirname, "../../data/fxRate.json");
const OUTLOOK_PATH = path.resolve(__dirname, "../../data/futuresOutlook.json");

const UA = "GoldCompareBot/0.1 (+https://kin-hikaku.com/privacy)";
const API = "https://api.frankfurter.dev/v1";

const EMPTY = {
  source: "欧州中央銀行(ECB) 外国為替参照相場",
  sourceUrl:
    "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
  via: "api.frankfurter.dev",
  notes:
    "ECBが毎営業日に公表する参照相場(1ドルあたりの円)。中央ヨーロッパ時間の午後に決まるため、" +
    "日本の取引所の清算値が決まる時刻とは一致しない。土日祝は公表されない。",
  entries: [],
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function loadJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

/** 取りに行く範囲の開始日。先物の記録がある最初の日から揃えておくと、後で突き合わせられる */
async function earliestNeeded() {
  const outlook = await loadJson(OUTLOOK_PATH, { entries: [] });
  const first = outlook.entries[0]?.date;
  return first ?? todayIso();
}

async function fetchRange(from, to) {
  const url = `${API}/${from}..${to}?base=USD&symbols=JPY`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`為替の取得に失敗しました: ${res.status} ${url}`);
  const json = await res.json();
  return Object.entries(json.rates ?? {})
    .map(([date, r]) => ({ date, usdJpy: r.JPY }))
    .filter((e) => typeof e.usdJpy === "number")
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

async function main() {
  const fx = await loadJson(FX_PATH, EMPTY);
  const have = new Set(fx.entries.map((e) => e.date));

  const from = fx.entries.length ? fx.entries[fx.entries.length - 1].date : await earliestNeeded();
  const fetched = await fetchRange(from, todayIso());

  let added = 0;
  for (const e of fetched) {
    if (have.has(e.date)) {
      // 同じ日の値が後から改訂されることはないが、取り直して違えば新しいほうを残す
      const existing = fx.entries.find((x) => x.date === e.date);
      if (existing && existing.usdJpy !== e.usdJpy) existing.usdJpy = e.usdJpy;
      continue;
    }
    fx.entries.push(e);
    added += 1;
  }

  fx.entries.sort((a, b) => (a.date < b.date ? -1 : 1));
  // 出典の表記は毎回最新の定義で上書きする(文言を直したときに古い説明が残らないように)
  const out = { ...EMPTY, entries: fx.entries };

  await writeFile(FX_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
  const last = fx.entries[fx.entries.length - 1];
  console.log(
    `為替: ${added}件追加、記録は${fx.entries.length}件 (${fx.entries[0]?.date}〜${last?.date})。` +
      `最新 1ドル=${last?.usdJpy}円`,
  );

  // ECBは土日祝に公表しない。何日も空くのは休みのせいか、取得が壊れているせいか区別がつかないので、
  // 直近の記録が1週間より古ければ知らせる(落としはしない。相手の休場日に落ちても意味がない)。
  if (last) {
    const age = Math.round((Date.parse(todayIso()) - Date.parse(last.date)) / 86_400_000);
    if (age > 7) console.warn(`  ⚠ 最新の為替が${age}日前です。取得が止まっていないか確認してください。`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
