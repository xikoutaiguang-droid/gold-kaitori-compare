/**
 * 載せている引用が、いまも出典の原文に在るかを確かめる。
 *
 * なぜ要るか:
 * 2026年10月4日、公開中の引用44件を手で照合したら1件だけ食い違っていた。
 * 買取エリートの価格ページには10月1日まで
 * 「金・プラチナの買取手数料・査定料￥０なので安心してご利用いただけます」とあり、
 * それを根拠に「引かれるものはない」と載せていた。ところが3日後にはその一文が消え、
 * 「※買取相場価格に手数料は含まれておりません」に変わっていた。内容が逆である。
 *
 * 当サイトはこの判定をシミュレーターの手取り計算にも使っていたので、
 * 「この社のほうが多く残る」という説明そのものが間違っていた。
 * 各社は予告なく書き換えるし、こちらは気づけない。見つけたのは偶然だった。
 *
 * やること:
 * lib/fees.ts と lib/services.ts が持っている引用を、それぞれの sourceUrl から
 * 取り直した本文と突き合わせる。見つからなければ、そこを読み直す合図になる。
 *
 * 一致しなくても必ずしも間違いではない(JSで描画していて取れない社がある)ので、
 * このスクリプトはジョブを落とさない。落とすと「取れないだけ」で毎回赤くなり、
 * 本当の食い違いが埋もれる。報告だけして、人が読む。
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA = "GoldCompareBot/0.1 (+https://kin-hikaku.com/privacy)";

/** 全角と半角、空白の違いは「書き換えられた」とは言えないので畳む */
function fold(s) {
  return s.normalize("NFKC").replace(/\s+/g, "");
}

function toText(html) {
  const stripped = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&yen;/g, "¥")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');
  return fold(stripped);
}

/**
 * TypeScriptのソースから { quote, sourceUrl } の組を拾う。構文解析はしない。
 *
 * 最初は「quoteの後に出てくる最初のsourceUrl」で組んでいたが、それだと
 * services.ts でずれる。あちらは sourceUrl が引用より前にあるので、
 * ネクサスの引用が次の社(銀座屋)のURLと組になっていた。
 * companyId でレコードに割ってから、その中だけで組む。
 */
function extractPairs(src) {
  const pairs = [];
  // companyId は各社の記録、sourceId は法令・官公庁の記録。どちらも
  // 「ここから次の識別子までが1件」という区切り方は同じ。
  const blocks = src.split(/\b(?:companyId|sourceId):\s*"/).slice(1);
  const unquote = (s) =>
    s
      .trim()
      .replace(/"\s*\+\s*"/g, "")
      .replace(/^"|"$/g, "")
      .replace(/\\"/g, '"');

  for (const raw of blocks) {
    const id = raw.slice(0, raw.indexOf('"'));

    // contrast は自分の sourceUrl を持つ。先に切り出して、残りと混ぜない。
    // 混ぜていたせいで、なんぼやとギャラリーレアの contrast を
    // 別ページのURLに対して照合してしまい、食い違いに見えていた。
    let rest = raw;
    const contrast = /contrast:\s*\{([\s\S]*?)\}/.exec(raw);
    if (contrast) {
      const cq = /quote:\s*((?:\s*"(?:[^"\\]|\\.)*"\s*\+?)+)/.exec(contrast[1]);
      const cu = /sourceUrl:\s*"([^"]+)"/.exec(contrast[1]);
      if (cq && cu) pairs.push({ quote: unquote(cq[1]), sourceUrl: cu[1], id: `${id}(対比)` });
      rest = raw.replace(contrast[0], "");
    }

    // 法令検索のページは本文をJavaScriptで描くので、取っても引用は入っていない。
    // そういう出典は verifyUrl に条単位の法令APIを持たせてあるので、そちらを見る。
    const verify = /verifyUrl:\s*`([^`]+)`|verifyUrl:\s*"([^"]+)"/.exec(rest);
    const url = /sourceUrl:\s*"([^"]+)"/.exec(rest);
    if (!verify && !url) continue;
    const target = verify ? (verify[1] ?? verify[2]) : url[1];
    const re = /quote:\s*((?:\s*"(?:[^"\\]|\\.)*"\s*\+?)+)/g;
    let m;
    while ((m = re.exec(rest)) !== null) {
      const quote = unquote(m[1]);
      if (quote.length >= 8) pairs.push({ quote, sourceUrl: target, id });
    }
  }
  return pairs;
}

/**
 * URLを変数やテンプレートリテラルで組んでいる行を見つける。
 *
 * この読み取りは構文解析をしないので、sourceUrl が文字列でないレコードは
 * 黙って照合対象から外れる。外れたことは出力に出ないため、
 * 「全部一致しました」と言いながら実は見ていない、という状態になりうる。
 * 実際 lib/pawnLaw.ts を足したとき、6件が照合されないまま緑になっていた。
 */
function unscannableLines(src, file) {
  const out = [];
  src.split(/\r?\n/).forEach((line, i) => {
    const t = line.trim();
    // 型宣言(sourceUrl: string)、コメント、別のオブジェクトから詰め替えている行
    // (sourceUrl: rec.sourceUrl)は、引用の出典ではないので数えない。
    // 鳴りっぱなしの警告は読まれなくなるので、拾うのは本当に照合から外れる書き方だけ。
    if (t.startsWith("*") || t.startsWith("//")) return;
    const m = /(?:sourceUrl|verifyUrl)\??:\s*(.+)$/.exec(t);
    if (!m) return;
    const value = m[1].trim();
    if (value.startsWith('"') || /^string\b/.test(value) || /^\w+\.\w+/.test(value)) return;
    out.push(`${file}:${i + 1} ${t}`);
  });
  return out;
}

async function main() {
  const files = ["lib/fees.ts", "lib/services.ts", "lib/taxLaw.ts", "lib/pawnLaw.ts"];
  const pairs = [];
  const unscannable = [];
  for (const f of files) {
    const src = await readFile(path.join(ROOT, f), "utf8");
    unscannable.push(...unscannableLines(src, f));
    pairs.push(...extractPairs(src).map((p) => ({ ...p, from: f })));
  }

  // 同じURLは1回だけ取りに行く
  const byUrl = new Map();
  for (const p of pairs) {
    if (!byUrl.has(p.sourceUrl)) byUrl.set(p.sourceUrl, []);
    byUrl.get(p.sourceUrl).push(p);
  }

  console.log(`引用 ${pairs.length}件 / 出典 ${byUrl.size}件を照合します`);
  if (unscannable.length) {
    console.log(`
URLが文字列で書かれていないため照合できない行 (${unscannable.length}件):`);
    for (const u of unscannable) console.log(`  - ${u}`);
    console.log("  URLは変数で組まずに、1件ずつそのまま書いてください。");
  }
  const missing = [];
  const unreachable = [];

  for (const [url, list] of byUrl) {
    let text = null;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
      if (res.ok) text = toText(await res.text());
      else unreachable.push(`${url} -> ${res.status}`);
    } catch (err) {
      unreachable.push(`${url} -> ${err?.cause?.code ?? err.message}`);
    }
    if (text === null) continue;
    for (const p of list) {
      if (!text.includes(fold(p.quote))) missing.push(p);
    }
    await new Promise((r) => setTimeout(r, 1200)); // 相手に連続で当てない
  }

  if (unreachable.length) {
    console.log(`\n取りに行けなかった出典 (${unreachable.length}件):`);
    for (const u of unreachable) console.log(`  - ${u}`);
  }
  if (missing.length) {
    console.log(`\n原文に見つからなかった引用 (${missing.length}件):`);
    for (const m of missing) {
      console.log(`  - [${m.from}] ${m.id} / ${m.sourceUrl}`);
      console.log(`      「${m.quote.slice(0, 70)}${m.quote.length > 70 ? "…" : ""}」`);
    }
    console.log("\n  ページがJSで描画されていて取れないだけの場合もあります。");
    console.log("  実際に書き換えられていたら、lib/fees.ts の model ごと見直してください");
    console.log("  (2026-10-04の買取エリートは free → deducted に変わりました)。");
  } else {
    console.log("\nすべての引用が、いまも出典の原文に在ります。");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
