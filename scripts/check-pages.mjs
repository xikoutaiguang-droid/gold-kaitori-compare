/**
 * 公開中の全ページを1枚ずつ取って、壊れていないかを調べる。
 *
 * なぜ要るか:
 * 2026年10月4日、人に言われて初めて全ページを手で点検した。その1回で9件の
 * 誤りが見つかった(引用4件、店舗数1件、対応地域3件、口コミ1件)。
 * つまりそれまでは、誰かが気づくまで出続ける状態だった。
 * 手でやるから間が空く。機械にできるぶんは毎日やらせる。
 *
 * ここで見るのは「ページとして壊れているか」だけ。
 * 書いてある中身が本当かどうかは scripts/verify-quotes.mjs の担当で、
 * 対応地域や店舗数のように機械判定が当てにならないものは入れていない
 * (店舗一覧のURLが社ごとに違い、試作では15社中12社を誤検知した)。
 *
 * 落とすもの(公開しているページとして明らかにおかしい):
 *   ・200を返さないURL
 *   ・undefined / NaN / [object Object] がそのまま出ている
 *   ・h1が無い、または複数ある
 *   ・title が無い、他ページと重複している
 *   ・canonical が無い
 *   ・alt の無い画像
 *   ・リンク先が404の内部リンク
 *
 * 落とさないもの(報告だけ):
 *   ・構造化データが無いページ
 *   ・description が短いページ
 */
import { fileURLToPath } from "node:url";
import path from "node:path";

const SITE = process.env.SITE_URL ?? "https://kin-hikaku.com";
const UA = "GoldCompareBot/0.1 (+https://kin-hikaku.com/privacy)";
void fileURLToPath;
void path;

/** 壊れた値がそのまま文字として出ていないか */
const BROKEN = ["undefined", "NaN", "[object Object]", "Infinity円", "null円"];

async function get(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    return { status: res.status, html: res.ok ? await res.text() : "" };
  } catch (err) {
    return { status: 0, html: "", error: err?.cause?.code ?? err.message };
  }
}

function textOf(html) {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

async function main() {
  const sm = await get(`${SITE}/sitemap.xml`);
  if (sm.status !== 200) {
    console.error(`sitemap.xml が ${sm.status} を返しました`);
    process.exit(1);
  }
  const urls = [...sm.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`${urls.length}ページを調べます`);

  const fatal = [];
  const notes = [];
  const titles = new Map();
  const internalLinks = new Set();

  for (const url of urls) {
    const { status, html, error } = await get(url);
    const where = url.replace(SITE, "") || "/";
    if (status !== 200) {
      fatal.push(`${where} が ${status}${error ? ` (${error})` : ""} を返しました`);
      continue;
    }
    const body = textOf(html);

    for (const bad of BROKEN) {
      if (body.includes(bad)) fatal.push(`${where} に「${bad}」がそのまま出ています`);
    }

    const h1 = html.match(/<h1[\s>]/g)?.length ?? 0;
    if (h1 === 0) fatal.push(`${where} に h1 がありません`);
    else if (h1 > 1) fatal.push(`${where} に h1 が${h1}個あります`);

    const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "";
    if (!title) fatal.push(`${where} に title がありません`);
    else if (titles.has(title)) fatal.push(`${where} の title が ${titles.get(title)} と同じです`);
    else titles.set(title, where);

    if (!/rel="canonical"/.test(html)) fatal.push(`${where} に canonical がありません`);

    const imgsWithoutAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/g) ?? []).length;
    if (imgsWithoutAlt) fatal.push(`${where} に alt の無い画像が${imgsWithoutAlt}枚あります`);

    if (!html.includes("application/ld+json")) notes.push(`${where} に構造化データがありません`);
    const desc = html.match(/name="description"\s+content="([^"]*)"/)?.[1] ?? "";
    if (desc.length < 40) notes.push(`${where} の description が短すぎます(${desc.length}字)`);

    for (const href of html.matchAll(/href="(\/[^"#?]*)"/g)) internalLinks.add(href[1]);
  }

  // 内部リンクの行き先。ページ本体と同じ数だけ取りに行くので最後にまとめて。
  console.log(`内部リンク ${internalLinks.size}件の行き先を確認します`);
  for (const p of internalLinks) {
    const res = await fetch(`${SITE}${p}`, { method: "HEAD", headers: { "User-Agent": UA } }).catch(() => null);
    if (!res || res.status !== 200) fatal.push(`内部リンク ${p} が ${res?.status ?? "接続失敗"} を返しました`);
  }

  if (notes.length) {
    console.log(`\n気になるところ (${notes.length}件・これでは落としません):`);
    for (const n of notes.slice(0, 20)) console.log(`  - ${n}`);
  }
  if (fatal.length) {
    console.error(`\n公開中のページに問題があります (${fatal.length}件):`);
    for (const f of fatal) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`\n${urls.length}ページとも、ページとして壊れているところはありませんでした。`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
