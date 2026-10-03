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
 * 市場の動きを決められないときについて:
 * 以前は「今回の取得で日付が変わった社」が5社に満たないと、何も判定せずに
 * 素通りさせていた。深夜や早朝など、まだ数社しか価格を更新していない時間帯の
 * 実行では、ガードが事実上効いていなかった(2026年10月3日の01時台の実行で、
 * リファスタが-7.1%動いたのに素通りした。値自体は正しかったが、
 * 判定されないまま通ったことに変わりはない)。
 * 比べる相手がいないときは、市場との差ではなく、動いた幅そのものを見る。
 * 記録している30日ぶんで実測すると、1日あけの|変化率|は355件中、中央値0.59%、
 * 99%点3.29%、6%以上はあの誤取得1件だけ。2日あけ(331件)・3日あけ(322件)でも
 * 99%点は4.36%・4.77%で、6%以上は既知の誤取得しか無い。
 * 日数で緩める必要は無かったので、一律6%にしている。
 *
 * 本当にその社が基準を変えた場合は、ここが邪魔になる。そのときは
 *   node scripts/scrape/index.mjs <会社ID>
 * と1社だけ実行すれば書き込める。以前はこれが「1社だけだと標本が足りない」
 * という副作用で成立していたが、上のとおり標本不足でも判定するようにしたので、
 * 意図した抜け道であることを singleSource 引数で明示するように変えた。
 */

/**
 * その社だけの動きと市場の動きの差が、これ以上なら書き込まない(%)。
 *
 * 当初は6%にしていたが、記録している30日ぶんで残差そのものを測り直したところ
 * (367件: 中央値0.03%、90%点1.38%、99%点3.02%)、正当な動きの最大は
 * 2026-09-11の大蔵屋 -4.20% で、次が rodeodrive の ±3.8% 前後だった。
 * 一方いちばん大きいのは例のリファスタ 2026-09-28 の +15.17%。
 * しきい値を5%にしても止まるのはその1件だけで、6%から下げても
 * 巻き込みは増えない。実際、2026-10-03のリファスタは残差5.89%で、
 * 6%だとぎりぎり通り抜けていた(値自体は正しかったが、判定としては素通り)。
 * 正当な最大4.20%との間に余裕を取りつつ、そこを拾える5%にする。
 */
const MAX_RESIDUAL_PCT = 5;

/** 市場の動きを決めるのに最低限必要な社数。少ないと中央値が当てにならない */
const MIN_SAMPLE = 5;

/** 前回の値がこれより古いと、1日あたりの動きとして比べられない(日) */
const MAX_PREV_AGE_DAYS = 7;

/**
 * 市場の動きを決められなかったときに、それでも書き込んでよい振れ幅(%)。
 *
 * こちらは残差ではなく動いた幅そのものなので、同じ5%にはできない。
 * 1〜3日あけの1045件で測ると、4%では31件・11社が引っかかって実用にならず、
 * 5%で8件、6%で6件(rodeodrive と refasta)、8%で4件(refasta のみ)。
 * 比べる相手がいない以上こちらは粗い網にしかならないので、正当な値を
 * 巻き込みにくい6%にしておく。止めても前回の値が残るだけで、ページを見て
 * 正しければ1社だけ実行すれば書き込める。
 */
const MAX_UNVERIFIED_PCT = 6;

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
 * @param options.singleSource 1社だけを指定して実行したとき true。
 *        人が意図して上書きしに来た場合なので、判定しない(上の抜け道)。
 * @returns { rejected, market, sample } 却下した社の一覧と、何を基準に判定したか
 */
export function rejectImplausible(companies, before, options = {}) {
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

  // 1社だけ指定して実行したときは、人が意図して上書きしに来ている。
  if (options.singleSource) return { rejected: [], market: null, sample: moves.size };

  // 今回いっしょに動いた社が足りないと、市場がどう動いたかを決められない。
  // 決められないことと、調べなくてよいことは別なので、基準を切り替えて続ける。
  const canCompare = moves.size >= MIN_SAMPLE;
  const market = canCompare ? median([...moves.values()]) : null;
  const rejected = [];

  for (const [id, pct] of moves) {
    // 市場が分かるなら市場との差、分からないなら動いた幅そのものを見る。
    const measured = canCompare ? pct - market : pct;
    const limit = canCompare ? MAX_RESIDUAL_PCT : MAX_UNVERIFIED_PCT;
    if (Math.abs(measured) < limit) continue;

    const c = companies.find((x) => x.id === id);
    const prev = before.get(id);
    c.priceData.prices = prev.prices;
    c.priceData.updatedAt = prev.updatedAt;
    // fetchedAt は戻さない。取りには行っているので、いつ見たかは残す。

    rejected.push({
      id,
      reason: canCompare
        ? `この社だけ${pct.toFixed(1)}%動きました(同じ日の他社は${market.toFixed(1)}%)。` +
          `差が${Math.abs(measured).toFixed(1)}%あり、別の表を拾った可能性があるため書き込みませんでした。` +
          `前回(${prev.updatedAt})の値を残しています。`
        : `${pct.toFixed(1)}%動きました。この回に動いた社が${moves.size}社しか無く` +
          `(${MIN_SAMPLE}社必要)、市場がどう動いたかを決められないため、` +
          `幅そのもので判定しています(${MAX_UNVERIFIED_PCT}%まで)。` +
          `前回(${prev.updatedAt})の値を残しています。` +
          `ページを見て正しければ、1社だけ実行すれば書き込めます。`,
    });
  }

  return { rejected, market, sample: moves.size };
}
