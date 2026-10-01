import { NextResponse } from "next/server";

/**
 * Vercel Cron から叩かれて、GitHub Actions の取得ジョブを起動するだけのルート。
 *
 * なぜ必要か:
 * GitHub のスケジュール実行は保証されていない。このリポジトリでは実測で
 * 1日3回の通常実行が毎回およそ6時間20分遅れて走り(11:23 JST の回が 17:40 JST)、
 * 1時間おきに置いた追加取得は11枠のうち2枠しか発火していなかった。
 * 10月1日は13時の時点で1回も走らず、サイトには12時間前の取得が出ていた。
 *
 * Vercel の Cron は無料枠でも時刻が守られる(±59分)。ただし1つのcronは
 * 1日1回までなので、時刻の違うエントリを複数置いて回数を稼ぐ。
 * 取得そのものは GitHub 側で動かす。データをリポジトリにコミットする必要があり、
 * それは Vercel の関数からはできないため。
 *
 * 環境変数が未設定のあいだは何もしない。設定し忘れてもサイト本体には影響しない。
 *
 * 時刻は vercel.json にUTCで書く。日本時間との対応:
 *   0 1  -> 10時   (田中貴金属の建値が9:30公表。各社が動くのはこの後)
 *   0 3  -> 12時
 *   0 5  -> 14時   (コメ兵は14時ごろに動かす)
 *   0 7  -> 16時
 *   0 9  -> 18時
 *   0 11 -> 20時   (ジュエルカフェは19:45の更新を確認している)
 * Hobbyプランは1つのcronにつき1日1回までなので、時刻の違うエントリを並べている。
 * 実行は指定した時刻の0〜59分後のどこかになる(Hobbyの精度)。
 */
export const runtime = "nodejs";

const OWNER = "xikoutaiguang-droid";
const REPO = "gold-kaitori-compare";

/**
 * 起動するワークフロー。
 * 通常実行(全25社)ではなく追加取得のほうを呼ぶ。こちらは「まだ今日の日付に
 * なっていない社」だけを取りに行くので、朝いちばんの回は実質全社、
 * 日中の回は残っている数社だけ、と自動的に必要な分しか取らない。
 */
const WORKFLOW = "catch-up-refresh.yml";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const token = process.env.GITHUB_DISPATCH_TOKEN;

  if (!secret || !token) {
    return NextResponse.json({ ok: false, reason: "未設定" }, { status: 503 });
  }

  // Vercel Cron は CRON_SECRET を Bearer で送ってくる。外から叩かれても動かさない。
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    },
  );

  // GitHub の応答本文はそのまま返さない。権限まわりの情報が混ざりうるため。
  if (!res.ok) {
    return NextResponse.json({ ok: false, status: res.status }, { status: 502 });
  }

  return NextResponse.json({ ok: true, workflow: WORKFLOW });
}
