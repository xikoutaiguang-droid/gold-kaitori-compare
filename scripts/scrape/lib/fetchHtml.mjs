// スクレイパー共通のHTTP取得ユーティリティ。
//
// 名乗る連絡先は実在していなければ意味がない。既定値が example.com と
// you@example.com のままで、環境変数も設定されていなかったため、
// 「実在の連絡先を名乗る」という下の方針が実態として守られていなかった。
// 当サイトの問い合わせフォームがあるページを指すようにしてある。
// なんぼや等、一部サイトはrobots.txtでClaudeBot/GPTBot等の名指しAIクローラーを
// Disallowしている。本ツールはそれらの名称を騙らず、実在の連絡先を含む
// 自社User-Agentを名乗ることで、robots.txtの意図を尊重する。
const USER_AGENT =
  process.env.SCRAPER_USER_AGENT ??
  "GoldCompareBot/0.1 (+https://kin-hikaku.com/privacy)";

/**
 * 単純な直列実行用の待機。同一サイトへの連続アクセスを避けるため、
 * scripts/scrape/index.mjs 側でソースごとに呼び出し間隔を空けること。
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 再試行の間隔。
//
// 以前は「3秒あけて2回」だった。合計6秒の中に3回を詰め込むので、不通が
// 数十秒続く種類のものだと3回とも同じ穴に落ちる。実際リファスタは
// 手元のPCの定期実行で5回中3回落ちていた(同じ時間帯に手で実行すると通る)。
// 間隔を広げながら、最後の試行までに1分ほど粘るようにする。
const BACKOFF_MS = [1_500, 4_000, 10_000, 25_000];
// 1回あたりの打ち切り時間。リファスタのトップページは558KB・約3.4秒かかるので、
// 短くしすぎると正常な応答を自分で切ってしまう。余裕をみて30秒。
const TIMEOUT_MS = Number(process.env.SCRAPER_TIMEOUT_MS ?? 30_000);
// 相手が429/503でRetry-Afterを返してきたときに、そこまでは待つ上限。
const MAX_RETRY_AFTER_MS = 60_000;

/** 再試行しても結果が変わらない応答か。4xxは基本的に待っても変わらない。 */
function worthRetrying(status) {
  if (status === 408 || status === 425 || status === 429) return true;
  return status >= 500;
}

/**
 * 失敗の中身を言葉にする。
 *
 * Node の fetch は接続断もTLS失敗もDNS失敗も、等しく TypeError: fetch failed
 * として投げる。本当の理由は err.cause.code に入っているのに、これまでは
 * err.message だけを記録していた。おかげで data/scrapeStatus.json にも
 * ログにも "fetch failed" としか残らず、31回連続の失敗を前にしても
 * 遮断なのか回線の不調なのか判断できなかった。
 */
function describe(err) {
  const code = err?.cause?.code ?? err?.cause?.name ?? err?.code;
  const detail = err?.cause?.message;
  if (code && detail && detail !== err.message) return `${err.message} (${code}: ${detail})`;
  if (code) return `${err.message} (${code})`;
  return err?.message ?? String(err);
}

function retryAfterMs(res) {
  const raw = res.headers.get("retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
  const at = Date.parse(raw);
  if (Number.isFinite(at)) return Math.min(Math.max(at - Date.now(), 0), MAX_RETRY_AFTER_MS);
  return null;
}

export async function fetchText(url) {
  const tried = [];

  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    let wait = BACKOFF_MS[attempt];

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept-Language": "ja,en;q=0.8",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        // 応答が返ってこないまま掴まれ続けると、後続の社の取得まで道連れになる。
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (res.ok) return await res.text();

      tried.push(`${res.status} ${res.statusText}`);
      if (!worthRetrying(res.status)) break;
      wait = retryAfterMs(res) ?? wait;
    } catch (err) {
      tried.push(describe(err));
    }

    if (wait === undefined) break;
    await sleep(wait);
  }

  // 何回試して、毎回どうだったかまで残す。同じ理由がn回並んでいれば遮断、
  // 理由がばらついていれば回線側、と後から読んで判断できる。
  const err = new Error(`${url} を ${tried.length}回試して取得できませんでした: ${tried.join(" / ")}`);
  err.attempts = tried;
  throw err;
}

export async function fetchJson(url) {
  const text = await fetchText(url);
  return JSON.parse(text);
}
