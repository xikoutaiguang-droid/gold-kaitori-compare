/**
 * 取得できた値が、その社だけ不自然な動き方をしていないかを見る。
 *
 * きっかけ:
 * リファスタは2026年9月28日に、掲載している全純度が一斉に+13.7%動いた。
 * 同じ日の他社(市場)の動きは中央値で-1.45%。相場がそう動いたのではなく、
 * ページ上の別の表を拾っていた疑いが強い。そのまま載せると、K18の順位が
 * 1位になったり中位に落ちたりして、読む人に見せる順位が毎日入れ替わる。
 *
 * 判定の作り方:
 * 1社の中で純度ごとに変化率を出し、その中央値をその社の動きとする。
 * 同じ日の全社の中央値を市場の動きとして、差(残差)を見る。
 * 記録している25日ぶんの履歴で試したところ、残差6%以上は上のリファスタ1件だけで、
 * 他は一度も引っかからなかった。日々の変化率は中央値0.57%、99%点でも5.41%。
 *
 * 引っかかったら書き込まない。前回の値を残す。
 * 古い値は「いつのものか」を表示できるが、嘘の値は何も表示できない。
 *
 * 本当にその社が基準を変えた場合は、ここが邪魔になる。そのときは
 *   node scripts/scrape/index.mjs <会社ID>
 * と1社だけ実行すれば書き込める。1社だけでは市場の動きを決められないので、
 * この判定は自動的に飛ばされる(MIN_SAMPLE)。意図した抜け道として残している。
 */

/** その社だけの動きと市場の動きの差が、これ以上なら書き込まない(%) */
const MAX_RESIDUAL_PCT = 6;

/** 市場の動きを決めるのに最低限必要な社数。少ないと中央値が当てにならない */
const MIN_SAMPLE = 5;

/** 前回の値がこれより古いと、1日あたりの動きとして比べられない(日) */
const MAX_PREV_AGE_DAYS = 7;

function median(values) {
  if (!values.length) return null;
  const a = [...values].sort((x, y) => x - y);
  return a[(a.length - 1) >> 1];
}

function ageInDays(iso, now) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return null;
  const d = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const t = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((t - d) / 86400000);
}

/** その社の純度ごとの変化率の中央値。比べられる純度が無ければ null */
function changePct(before, after) {
  const pcts = [];
  for (const [purity, now] of Object.entries(after ?? {})) {
    const prev = before?.[purity];
    if (typeof prev !== "number" || prev <= 0 || typeof now !== "number") continue;
    pcts.push(((now - prev) / prev) * 100);
  }
  return median(pcts);
}

/**
 * 怪しい更新を元に戻す。companies を直接書き換える。
 *
 * @param companies 取得結果を適用済みの配列
 * @param before 取得前の値 Map<id, {prices, updatedAt}>
 * @returns 却下した社の一覧
 */
export function rejectImplausible(companies, before) {
  const now = new Date();

  const moves = new Map();
  for (const c of companies) {
    const prev = before.get(c.id);
    if (!prev) continue;
    // 今回の取得で動いていない社は、市場の動きを決める材料にも判定対象にもしない
    if (prev.updatedAt === c.priceData?.updatedAt) continue;
    const age = ageInDays(prev.updatedAt, now);
    if (age === null || age > MAX_PREV_AGE_DAYS) continue;
    const pct = changePct(prev.prices, c.priceData?.prices);
    if (pct === null) continue;
    moves.set(c.id, pct);
  }

  if (moves.size < MIN_SAMPLE) return [];

  const market = median([...moves.values()]);
  const rejected = [];

  for (const [id, pct] of moves) {
    const residual = pct - market;
    if (Math.abs(residual) < MAX_RESIDUAL_PCT) continue;

    const c = companies.find((x) => x.id === id);
    const prev = before.get(id);
    c.priceData.prices = prev.prices;
    c.priceData.updatedAt = prev.updatedAt;
    // fetchedAt は戻さない。取りには行っているので、いつ見たかは残す。

    rejected.push({
      id,
      reason:
        `この社だけ${pct.toFixed(1)}%動きました(同じ日の他社は${market.toFixed(1)}%)。` +
        `差が${Math.abs(residual).toFixed(1)}%あり、別の表を拾った可能性があるため書き込みませんでした。` +
        `前回(${prev.updatedAt})の値を残しています。`,
    });
  }

  return rejected;
}
