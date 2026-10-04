/**
 * いま公開されているのが、どのコミットから作られたビルドなのかを返す。
 *
 * なぜ要るか:
 * 2026年10月1日と10月4日の2回、pushしたのに Vercel がデプロイを作らなかった。
 * 10月4日は1コミットだけ取りこぼし、前後のコミットは40秒以内にデプロイされていた。
 *
 * scripts/check-production.mjs はこれを見逃した。あのスクリプトは
 * 「本番のサイトマップに載っているURLが200を返すか」を見ているが、
 * 本番が古いままだと古いサイトマップが返ってくるので、
 * 古いページだけを数えて「全部200」と判定してしまう。
 * 新しく足したページが存在しないことを、本番自身に聞いても分からない。
 *
 * コミットのSHAを本番に出しておけば、手元のHEADと突き合わせるだけで
 * 「公開されているものが古い」と一発で分かる。
 *
 * VERCEL_GIT_COMMIT_SHA はビルド時にVercelが入れる。手元で動かしたときは
 * 入っていないので null を返す(手元のビルドと本番を混同しないため)。
 */
const BUILD = {
  commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  ref: process.env.VERCEL_GIT_COMMIT_REF ?? null,
  builtAt: new Date().toISOString(),
};

export const dynamic = "force-static";

export async function GET() {
  return new Response(JSON.stringify(BUILD, null, 2) + "\n", {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // 古いものを掴むと判定そのものが嘘になるので、ここだけは毎回取りに行かせる
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
