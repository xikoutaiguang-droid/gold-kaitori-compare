/**
 * ドル円を日次で記録する。
 *
 * なぜ要るか:
 * 国内の金価格は「ドル建ての金価格 × ドル円」で決まる。だから円建ての値が上がっても、
 * 金そのものが上がったのか、円が安くなっただけなのかは、価格だけ見ても分からない。
 * 為替を並べて記録しておけば、その日の動きのうち為替で説明できる分を後から出せる。
 *
 * 出どころ:
 * 欧州中央銀行(ECB)が毎営業日に公表している外国為替参照相場のXMLを直接読む。
 *
 * 大事な点が1つある。**ECBはドル円を公表していない。** 公表しているのは
 * 「1ユーロが何ドルか」「1ユーロが何円か」で、ドル円はそこから
 *
 *   ドル円 = (1ユーロあたりの円) ÷ (1ユーロあたりのドル)
 *
 * と計算した値になる。中央銀行が出した数字そのものではないので、ページ側にもそう書く。
 *
 * はじめは api.frankfurter.dev という中継サービスから取っていたが、2つの理由でやめた。
 * ひとつは小数2桁に丸められていたこと(為替の動きが小さい日ほど、丸めが結果に効く)。
 * もうひとつは、ページに「出典はECB」と書いているのに、実際には別のサービスを
 * 経由していたこと。出典として名乗るところから直接取る。
 *
 * 注意:
 * ECBの参照相場は中央ヨーロッパ時間の午後に決まる。日本の取引所の清算値が決まる時刻とは
 * ずれているので、同じ日付でも時点は一致しない。この点もページに書いてある。
 *
 * 実行: node scripts/scrape/record-fx.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FX_PATH = path.resolve(__dirname, "../../data/fxRate.json");

const UA = "GoldCompareBot/0.1 (+https://kin-hikaku.com/privacy)";
/** 直近90日ぶん。1日1回の実行なら、数日止まっても取りこぼさない */
const ECB_XML = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";

const META = {
  source: "欧州中央銀行(ECB) 外国為替参照相場",
  sourceUrl:
    "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
  notes:
    "ECBが毎営業日に公表するユーロ基準の参照相場から、(1ユーロあたりの円)÷(1ユーロあたりのドル)で" +
    "計算したドル円。ECBがドル円そのものを公表しているわけではない。" +
    "参照相場は中央ヨーロッパ時間の午後に決まるため、日本の取引所の清算値が決まる時刻とは一致しない。" +
    "土日祝は公表されない。",
};

/**
 * ECBのXMLから、日付ごとの通貨レートを取り出す。
 * XMLパーサは入れない(この1ファイルのためだけに依存を増やさない)。形は単純で、
 * <Cube time='YYYY-MM-DD'> の中に <Cube currency='USD' rate='1.08'/> が並ぶだけ。
 */
function parseEcb(xml) {
  const out = [];
  const dayRe = /<Cube\s+time=['"]([\d-]+)['"]\s*>([\s\S]*?)<\/Cube>/g;
  let day;
  while ((day = dayRe.exec(xml)) !== null) {
    const rates = {};
    const rateRe = /currency=['"](\w+)['"]\s+rate=['"]([\d.]+)['"]/g;
    let r;
    while ((r = rateRe.exec(day[2])) !== null) rates[r[1]] = Number(r[2]);
    if (rates.USD > 0 && rates.JPY > 0) {
      // 小数4桁。ECBの元の値は5〜6桁あるが、ドル円に直すとそれ以上は意味がない
      out.push({ date: day[1], usdJpy: Number((rates.JPY / rates.USD).toFixed(4)) });
    }
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}

async function main() {
  const res = await fetch(ECB_XML, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`為替の取得に失敗しました: ${res.status} ${ECB_XML}`);
  const fetched = parseEcb(await res.text());
  if (!fetched.length) {
    throw new Error("ECBのXMLからレートを取り出せませんでした(書式が変わった可能性)");
  }

  let existing = [];
  try {
    existing = JSON.parse(await readFile(FX_PATH, "utf8")).entries ?? [];
  } catch {
    // まだ無いだけ
  }

  // 取り直した値を正とする。中継サービス経由だった頃の2桁の値が残っていても、
  // ここで本来の精度に置き換わる。
  const byDate = new Map(existing.map((e) => [e.date, e]));
  let added = 0;
  let corrected = 0;
  for (const e of fetched) {
    const before = byDate.get(e.date);
    if (!before) added += 1;
    else if (before.usdJpy !== e.usdJpy) corrected += 1;
    byDate.set(e.date, e);
  }

  const entries = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
  await writeFile(FX_PATH, JSON.stringify({ ...META, entries }, null, 2) + "\n", "utf8");

  const last = entries[entries.length - 1];
  console.log(
    `為替: ${added}件追加・${corrected}件訂正、記録は${entries.length}件 ` +
      `(${entries[0]?.date}〜${last?.date})。最新 1ドル=${last?.usdJpy}円`,
  );

  // ECBは土日祝に公表しない。何日も空くのは休みのせいか取得が壊れたせいか区別がつかないので、
  // 1週間を超えたときだけ知らせる(落としはしない。相手の休場日に落ちても意味がない)。
  const age = Math.round((Date.now() - Date.parse(last.date)) / 86_400_000);
  if (age > 7) console.warn(`  ⚠ 最新の為替が${age}日前です。取得が止まっていないか確認してください。`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
