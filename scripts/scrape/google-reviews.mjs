// Google Places API (New) を使って、各社の代表店舗をサンプリングし
// 評価(rating)・レビュー件数を集計してdata/companies.jsonに書き込む。
//
// 事前準備:
//   1. Google Cloudでプロジェクトを作成し「Places API (New)」を有効化
//   2. APIキーを発行(利用制限としてPlaces APIのみに絞ることを推奨)
//   3. プロジェクトルートに .env.local を作成し以下を記載:
//        GOOGLE_PLACES_API_KEY=あなたのキー
//
// 実行: node scripts/scrape/google-reviews.mjs [会社ID]
//
// 費用について: Text Search Pro $32/1000件、Place Details Pro $17/1000件(共に月5,000件まで無料)。
// このスクリプトは1社あたり最大5クエリ程度に抑えており、18社合計でも無料枠に収まる設計。
// フルの店舗数を集計しているわけではない(サンプリング)ため、参考値として扱うこと。

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCompanies, saveCompanies } from "./lib/store.mjs";
import { sleep } from "./lib/fetchHtml.mjs";
import { rootDomain } from "./lib/domain.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "../../.env.local");
  try {
    const text = readFileSync(envPath, "utf-8");
    for (const line of text.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    // .env.localが無くても環境変数側で設定されていれば問題ない
  }
}

loadEnvLocal();
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// 会社の対応地域から、サンプリングに使う代表都市を決める(多くても5都市)。
const REGION_TO_CITIES = {
  全国: ["東京", "大阪", "名古屋", "福岡", "札幌"],
  北海道: ["札幌"],
  東北: ["仙台"],
  関東: ["東京", "横浜"],
  中部: ["名古屋"],
  東海: ["名古屋", "静岡"],
  近畿: ["大阪", "京都"],
  中国: ["広島"],
  四国: ["高松"],
  "九州・沖縄": ["福岡"],
};

// websiteUriによるドメイン一致チェックをすり抜けた既知の誤マッチ。
// (Googleマップの店舗情報側でwebsiteが誤って設定されているケース。例: 銀座屋の検索で
//  「田中貴金属 名古屋店」が公式サイトドメイン一致として通ってしまった)
// 見つかり次第、会社ID: 除外したい店舗名の一部 の形で追記する。
const KNOWN_FALSE_POSITIVES = {
  ginzaya: ["田中貴金属"],
};

function isKnownFalsePositive(companyId, label) {
  const patterns = KNOWN_FALSE_POSITIVES[companyId] ?? [];
  return patterns.some((p) => label.includes(p));
}

function pickCities(company) {
  const cities = new Set();
  for (const region of company.regions) {
    for (const city of REGION_TO_CITIES[region] ?? []) cities.add(city);
  }
  if (cities.size === 0) return [null]; // 地域不明・1店舗のみの会社は会社名だけで検索
  return [...cities].slice(0, 5);
}

async function textSearch(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "ja" }),
  });
  if (!res.ok) throw new Error(`Text Search failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  // 上位1件だけだと同名の無関係店舗を拾うことがあるため、上位3件を候補として返し、
  // 後段でwebsiteUriによる公式ドメイン照合を行う。
  return json.places?.slice(0, 3) ?? [];
}

async function placeDetails(placeId) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "displayName,rating,userRatingCount,websiteUri",
    },
  });
  if (!res.ok) throw new Error(`Place Details failed (${res.status}): ${await res.text()}`);
  return res.json();
}

/**
 * 「会社名+都市名」だけのText Searchでは、同名の無関係な店舗(飲食店・別会社等)を
 * 誤って拾うことがある(実際に大黒屋→ジンギスカン店、銀座屋→パン屋等が混入した)。
 * Place Detailsで取得した公式サイトURLのドメインが、会社の公式ドメインと一致する場合のみ採用する。
 *
 * 注意: 単純な「末尾2ラベル」でのドメイン比較は co.jp のような日本の複合TLDで
 * 誤判定を起こす(ginzaya.co.jp と ito-ya.co.jp が両方 "co.jp" に潰れて一致してしまう
 * バグが実際に発生した)。rootDomain()はlib/domain.mjsでこれを補正している。
 */
function isVerifiedMatch(company, websiteUri) {
  if (!websiteUri) return false;
  try {
    const detailDomain = rootDomain(new URL(websiteUri).hostname);
    const officialDomain = rootDomain(new URL(company.officialUrl).hostname);
    return detailDomain === officialDomain;
  } catch {
    return false;
  }
}

async function sampleCompany(company) {
  const cities = pickCities(company);
  const candidates = new Map(); // placeId -> displayName(候補、まだ未検証)

  for (const city of cities) {
    const query = city ? `${company.name} ${city}` : company.name;
    try {
      const places = await textSearch(query);
      for (const place of places) {
        if (place?.id && !candidates.has(place.id)) {
          candidates.set(place.id, place.displayName?.text ?? company.name);
        }
      }
    } catch (err) {
      console.error(`  [検索NG] ${query}: ${err.message}`);
    }
    await sleep(200);
  }

  if (candidates.size === 0) return null;

  let ratingSum = 0;
  let reviewSum = 0;
  const sampledStores = [];
  const rejected = [];

  for (const [placeId, label] of candidates) {
    try {
      const detail = await placeDetails(placeId);
      if (!isVerifiedMatch(company, detail.websiteUri) || isKnownFalsePositive(company.id, label)) {
        rejected.push(label);
        continue;
      }
      if (typeof detail.rating === "number" && typeof detail.userRatingCount === "number") {
        ratingSum += detail.rating * detail.userRatingCount;
        reviewSum += detail.userRatingCount;
        sampledStores.push(label);
      }
    } catch (err) {
      console.error(`  [詳細取得NG] ${label}: ${err.message}`);
    }
    await sleep(200);
  }

  if (rejected.length > 0) {
    console.log(`  [除外] 公式ドメイン不一致のため除外: ${rejected.join("、")}`);
  }

  if (reviewSum === 0) return null;

  return {
    avgRating: Math.round((ratingSum / reviewSum) * 100) / 100,
    totalReviewCount: reviewSum,
    sampleSize: sampledStores.length,
    sampledAt: new Date().toISOString().slice(0, 10),
    sampledStores,
  };
}

async function main() {
  if (!API_KEY) {
    console.error(
      "GOOGLE_PLACES_API_KEYが設定されていません。.env.local に GOOGLE_PLACES_API_KEY=... を記載してください。"
    );
    process.exit(1);
  }

  const only = process.argv[2];
  const companies = await loadCompanies();
  const targets = only ? companies.filter((c) => c.id === only) : companies;

  if (only && targets.length === 0) {
    console.error(`不明な会社ID: ${only}`);
    process.exit(1);
  }

  for (const company of targets) {
    console.log(`[調査中] ${company.name}`);
    const result = await sampleCompany(company);
    if (result) {
      company.googleReview = result;
      console.log(
        `  [OK] 平均${result.avgRating} (${result.sampleSize}店舗・計${result.totalReviewCount}件のレビュー): ${result.sampledStores.join("、")}`
      );
    } else {
      console.log("  [スキップ] 該当店舗が見つかりませんでした");
    }
  }

  await saveCompanies(companies);
  console.log("\ndata/companies.jsonを更新しました。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
