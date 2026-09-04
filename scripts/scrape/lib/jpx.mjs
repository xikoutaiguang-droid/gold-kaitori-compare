// 大阪取引所(OSE)が毎営業日公表する「先物・オプション清算値段等」CSVから、
// 金標準先物の清算値段を取得する。
// https://www.jpx.co.jp/markets/derivatives/settlement-price/index.html
//
// このCSVは無料公開されており、会員登録やAPIキーは不要。Shift-JISエンコードのため
// Node標準のTextDecoder("shift_jis")でデコードする(Node公式ビルドはfull-icu同梱のため追加依存不要)。
//
// 取得するのは2種類:
//  - spot:    FUT_GLDD(限日先物)。固定の受渡期日を持たず、現物(スポット)に近い値動きをする。
//  - nearest: FUT_GLD_YYMMDD(標準先物)のうち、残存日数が最も少ない=直近限月の契約。
// この2つの差から「市場が織り込んでいる限月日までの変化率」を算出でき、同じ取引所・同じ
// 商品基準どうしの比較になるため、当サイトが集計する店頭買取価格(小口・宝飾品基準)と
// 直接比較するより公平な「予想の答え合わせ」ができる。

const INDEX_URL = "https://www.jpx.co.jp/markets/derivatives/settlement-price/index.html";
const USER_AGENT =
  process.env.SCRAPER_USER_AGENT ??
  "GoldCompareBot/0.1 (+https://example.com/bot; contact: you@example.com)";

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${url} -> ${res.status} ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function findTodaysCsvUrl() {
  const html = await fetchBuffer(INDEX_URL).then((buf) => new TextDecoder("utf-8").decode(buf));
  const match = html.match(/href="([^"]+\/rb\d{8}\.csv)"/);
  if (!match) {
    throw new Error("JPX清算値段ページからCSVリンクが見つかりませんでした(ページ構造が変わった可能性)");
  }
  return new URL(match[1], INDEX_URL).toString();
}

export async function fetchGoldFuturesSettlement() {
  const csvUrl = await findTodaysCsvUrl();
  const buf = await fetchBuffer(csvUrl);
  const text = new TextDecoder("shift_jis").decode(buf);

  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const header = lines.find((line) => line.startsWith("銘柄コード"));
  if (!header) {
    throw new Error("JPX CSVのヘッダー行が見つかりませんでした(フォーマットが変わった可能性)");
  }
  const cols = header.split(",");
  const idx = {
    name: cols.indexOf("銘柄名称"),
    putCal: cols.indexOf("PUT/CAL"),
    settlement: cols.indexOf("清算価格"),
    daysLeft: cols.indexOf("残日数"),
    underlying: cols.indexOf("原資産名称"),
  };

  let nearest = null;
  let spot = null;

  for (const line of lines) {
    const fields = line.split(",");
    const name = fields[idx.name];
    if (!name) continue;
    if (fields[idx.putCal]) continue; // オプションは除外(先物のみ)
    if (fields[idx.underlying] !== "金") continue;

    const settlement = Number(fields[idx.settlement]);
    if (!Number.isFinite(settlement)) continue;

    if (name === "FUT_GLDD") {
      spot = settlement;
      continue;
    }

    if (!name.startsWith("FUT_GLD_")) continue; // ミニ先物(GLDM)等は除外
    const daysLeft = Number(fields[idx.daysLeft]);
    if (!Number.isFinite(daysLeft) || daysLeft <= 0) continue;

    if (!nearest || daysLeft < nearest.daysLeft) {
      nearest = { name, daysLeft, settlement };
    }
  }

  if (!nearest) {
    throw new Error("JPX CSVから金標準先物の行を1件も取得できませんでした(銘柄コード体系が変わった可能性)");
  }
  if (spot === null) {
    throw new Error("JPX CSVから金限日先物(FUT_GLDD)の行が取得できませんでした");
  }

  const dateMatch = nearest.name.match(/FUT_GLD_(\d{2})(\d{2})(\d{2})$/);
  if (!dateMatch) {
    throw new Error(`銘柄名称から限月日を読み取れませんでした: ${nearest.name}`);
  }
  const [, yy, mm, dd] = dateMatch;
  const targetDate = `20${yy}-${mm}-${dd}`;

  return {
    spotPrice: spot,
    nearestContract: nearest.name,
    nearestTargetDate: targetDate,
    nearestPrice: nearest.settlement,
  };
}
