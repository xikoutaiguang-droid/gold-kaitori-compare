/**
 * 公開中のサイトが、いまリポジトリにあるものと同じかを確かめる。
 *
 * これが無かったせいで何が起きたか:
 * 2026年10月1日、VercelとGitHubの接続が切れて(Settings → Git に
 * 「Project Link not found」)、pushしてもデプロイが作られない状態が21時間続いた。
 * その間、本番は前日01:08に取得した価格を「今日の価格」として出し続け、
 * 新しく追加した13ページは404を返していた。GitHub Actions は毎日成功していたし、
 * データも正しく更新されていた。壊れていたのは「それが公開されるところ」だけで、
 * どの点検もそこを見ていなかった。
 *
 * 気づいたきっかけは、Search Console にインデックス登録を依頼したときの
 * 「見つかりませんでした(404)」で、完全に偶然だった。
 * 毎日の価格を売りにしているサイトが丸一日古い価格を出していて、
 * 誰も気づかない状態をこれ以上残さない。
 *
 * 見るもの:
 * ・トップページに出ている取得時刻が、リポジトリのデータと離れていないか
 * ・サイトマップに載せている全URLが200を返すか
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = process.env.SITE_URL ?? "https://kin-hikaku.com";

/**
 * 本番の取得時刻がこれ以上遅れていたら、公開の仕組みが止まっているとみなす。
 * 取得は1日3回+追加取得なので、6時間空くのは通常ありえない。
 */
const MAX_LAG_HOURS = 6;

const UA = "GoldCompareBot/0.1 (+https://kin-hikaku.com/privacy)";

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  return { status: res.status, text: res.ok ? await res.text() : "" };
}

/** トップページの「10月1日 22:33（日本時間）」から日時を取り出す */
function parseShownFetchedAt(html, year) {
  const m = html.match(/確認したのは(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  // 表示は日本時間。UTCに直して比較する
  return Date.UTC(year, Number(m[1]) - 1, Number(m[2]), Number(m[3]) - 9, Number(m[4]));
}

async function main() {
  const problems = [];

  const companies = JSON.parse(await readFile(path.join(ROOT, "data", "companies.json"), "utf8"));
  const localFetchedAt = companies
    .map((c) => c.priceData?.fetchedAt)
    .filter(Boolean)
    .sort()
    .pop();

  // ---- 1. 本番が出している取得時刻 ----
  const top = await get(`${SITE}/`);
  if (top.status !== 200) {
    problems.push(`トップページが ${top.status} を返しました`);
  } else {
    const shown = parseShownFetchedAt(top.text, new Date().getUTCFullYear());
    if (shown === null) {
      problems.push("トップページに取得時刻の表示が見つかりません(PriceFreshness が出ていない可能性)");
    } else if (localFetchedAt) {
      const lagHours = (Date.parse(localFetchedAt) - shown) / 3600000;
      const sign = lagHours >= 0 ? "遅れ" : "進み";
      console.log(
        `本番の取得時刻: ${new Date(shown).toISOString()} / リポジトリ: ${localFetchedAt}` +
          ` (${Math.abs(lagHours).toFixed(1)}時間の${sign})`,
      );
      if (lagHours > MAX_LAG_HOURS) {
        problems.push(
          `本番がリポジトリより${lagHours.toFixed(1)}時間古いままです。` +
            `デプロイが作られていない可能性があります(VercelのSettings → Gitの接続を確認してください)。`,
        );
      }
    }
  }

  // ---- 2. サイトマップのURLが全部開けるか ----
  const sm = await get(`${SITE}/sitemap.xml`);
  if (sm.status !== 200) {
    problems.push(`sitemap.xml が ${sm.status} を返しました`);
  } else {
    const urls = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const bad = [];
    for (const u of urls) {
      const res = await fetch(u, { method: "HEAD", headers: { "User-Agent": UA } });
      if (res.status !== 200) bad.push(`${u} -> ${res.status}`);
    }
    console.log(`サイトマップ: ${urls.length}件を確認、${bad.length}件が200以外`);
    if (bad.length) {
      problems.push(`200を返さないURLが${bad.length}件あります:\n    ` + bad.slice(0, 10).join("\n    "));
    }
  }

  if (problems.length) {
    console.error("\n公開中のサイトに問題があります:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log("\n公開中のサイトはリポジトリの内容と一致しています。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
