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

// GitHub Actions等クラウドの共有IPからのアクセスが、サイト側のレート制限/WAFに
// 一時的にはじかれることがある(同一コードでもローカルからは成功することを確認済み)。
// 恒久的なブロックには効かないが、一時的な弾かれには効くことがあるため、
// 短い間隔を空けて数回だけ再試行する。
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 3000;

export async function fetchText(url) {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept-Language": "ja,en;q=0.8",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (!res.ok) {
        throw new Error(`Fetch failed: ${url} -> ${res.status} ${res.statusText}`);
      }
      return await res.text();
    } catch (err) {
      lastError = err;
      if (attempt < RETRY_COUNT) await sleep(RETRY_DELAY_MS);
    }
  }
  throw lastError;
}

export async function fetchJson(url) {
  const text = await fetchText(url);
  return JSON.parse(text);
}
