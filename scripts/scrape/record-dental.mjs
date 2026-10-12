/**
 * 歯科用の金合金(いわゆる金パラ)とパラジウムの買取価格を記録する。
 *
 * なぜ要るか:
 * 「金歯は売れるのか」という記事で、保険診療の材料価格(厚生労働省の告示)と
 * 実際の買取価格を並べている。材料価格は告示なので動かないが、買取価格は毎日動く。
 * 記事の本文に数字を書くと、翌日から嘘になる。だから当サイトの他の価格と同じく、
 * 毎日取り直して data/ に置き、記事側は読むだけにする。
 *
 * 出どころ:
 * リファスタ(kinkaimasu.jp)が、トップページの相場表に歯科材の1gあたりの買取価格と
 * パラジウムの買取価格を公表している。掲載25社のうち、歯科材の単価を数字で
 * 出しているのはここだけだった(他社は「ASK」「要問合せ」)。
 *
 * パラジウムも records に入れる。金パラは名前のとおり金とパラジウムを含むので、
 * 「金の分」だけでは中身の価値を測れない。インゴット建ての行(IG表記)は
 * 宝飾品の買取とは基準が違うので除き、CIBJO基準の行を採る。
 *
 * 取れなかったら書き換えない。古い値を残して、取得できなかったことだけを残す。
 * 空で上書きすると、記事のほうが「公表している社は無い」という別の意味になる。
 *
 * 実行: node scripts/scrape/record-dental.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import { fetchText } from "./lib/fetchHtml.mjs";
import { todayJst } from "./lib/date.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../../data/dentalAlloy.json");

const URL = "https://kinkaimasu.jp/";

function yen(text) {
  const n = Number(String(text).replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function main() {
  const html = await fetchText(URL);
  const $ = cheerio.load(html);

  let dental = null;
  let palladium = null;

  $("tr[hinmoku-price-data]").each((_, el) => {
    const row = $(el);
    const th = row.find("th").first().text().trim();
    const detail = row.find("td.market-detail").first().text().replace(/\s+/g, "");
    const price = yen(row.find("td.market-price").first().text());
    if (price === null) return;

    // インゴットは宝飾品(スクラップ)の買取とは別の基準なので採らない
    if (detail.includes("IG") || detail.includes("インゴット")) return;

    if (th === "歯科材" && dental === null) {
      dental = { label: th, detail, pricePerGram: price };
      return;
    }
    // パラジウムは純度1000の行を1つだけ。金パラのPd20%分を見るのに使う
    if (/^Pd1000/.test(th) && palladium === null) {
      palladium = { label: th, detail, pricePerGram: price };
    }
  });

  if (!dental) {
    throw new Error("record-dental: 歯科材の行が見つかりませんでした(ページ構造が変わった可能性)");
  }

  const dateMatch = html.match(/(\d{4})\/(\d{2})\/(\d{2})\s*\d{2}:\d{2}更新/);
  const updatedAt = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : todayJst();

  const next = {
    companyId: "refasta",
    companyName: "リファスタ",
    sourceUrl: URL,
    updatedAt,
    recordedAt: todayJst(),
    dental,
    palladium,
  };

  let prev = null;
  try {
    prev = JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    // 初回。比較するものが無いだけ
  }

  await writeFile(OUT, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  const before = prev?.dental?.pricePerGram;
  console.log(
    `歯科材 ${next.dental.pricePerGram.toLocaleString("ja-JP")}円/g` +
      (before && before !== next.dental.pricePerGram ? ` (前回 ${before.toLocaleString("ja-JP")}円)` : "") +
      (next.palladium ? ` / ${next.palladium.label} ${next.palladium.pricePerGram.toLocaleString("ja-JP")}円/g` : " / パラジウムは取れませんでした") +
      ` (${next.updatedAt}時点)`,
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
