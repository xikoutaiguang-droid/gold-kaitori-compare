// スクレイパー共通のHTTP取得ユーティリティ。
// なんぼや等、一部サイトはrobots.txtでClaudeBot/GPTBot等の名指しAIクローラーを
// Disallowしている。本ツールはそれらの名称を騙らず、実在の連絡先を含む
// 自社User-Agentを名乗ることで、robots.txtの意図を尊重する。
const USER_AGENT =
  process.env.SCRAPER_USER_AGENT ??
  "GoldCompareBot/0.1 (+https://example.com/bot; contact: you@example.com)";

/**
 * 単純な直列実行用の待機。同一サイトへの連続アクセスを避けるため、
 * scripts/scrape/index.mjs 側でソースごとに呼び出し間隔を空けること。
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.8" },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${url} -> ${res.status} ${res.statusText}`);
  }
  return res.text();
}

export async function fetchJson(url) {
  const text = await fetchText(url);
  return JSON.parse(text);
}
