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
 * 前回の値のほうがずれていた社について(2026-11-24に追加):
 * 上の判定は「前回の値から今回の値への変化」を見るので、前回の値そのものが
 * 他社よりずれていると、正しい値に戻った回が却下される。2026-11-24のロデオドライブがそれで、
 * 11/21に-5.6%(他社は-1〜-4%)と大きめに下げ、11/24に+7.3%で戻ったところを却下された。
 * 11/20→11/24で見ると同社は約+1.2%、他社の中央値は約+1.3%で、今回の値は正しいとみられる。
 * 却下が続くと、他社より約7%低い古い値が比較表に残り続ける(前回値が7日より古くなるまで)。
 * そこで、変化で引っかかった社は、もう一度「今回の値が、他社に対していつもの位置にあるか」を見る。
 * 今日の他社の中央値に対する比(純度ごとの中央値)と、日次の記録の直近28日でのその社のいつもの比の差が
 * MAX_LEVEL_PCT 未満なら書き込む。記録している日次の値(1200件)で試すと、
 * この差の中央値は0.35%、99%点は4.71%。
 * 日次の記録を9/5〜11/24まで1日ずつ流し直すと、変化で止まるのは9件。うち位置のずれは
 * リファスタ 9/24(記録不足で判定不可)・9/27(-12.1%)・9/28(+4.7%)・10/03(-6.7%)が大きく、
 * 残る ロデオドライブ 11/04(0.0%)・11/19(0.9%)・11/24、コメ兵 11/24(0.7%)、
 * ベストライフ 11/04(-0.1%)、大蔵屋 11/02(-2.8%)、ネットオフ 11/04(0.3%)、リファスタ 10/08(-0.3%)は小さい。
 * 冒頭のリファスタ 9/28 を今までどおり止めるため、上限は両者の間の3%にした。
 * どちらの見方でもずれているときだけ止める。
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

/**
 * 変化で引っかかった社に、もう一度だけ見る「他社に対する位置」のずれの上限(%)。
 * 上の説明のとおり、通したい側の最大が2.8%、止めたい側の最小が4.7%。
 */
const MAX_LEVEL_PCT = 3;

/** いつもの位置を決めるのに見る日数と、最低限必要な日数 */
const LEVEL_LOOKBACK_DAYS = 28;
const LEVEL_MIN_DAYS = 5;

/** 今日の他社として数える、公表日の古さの上限(日)。止まっている社を混ぜない */
const LEVEL_MAX_PEER_AGE_DAYS = 3;

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

/**
 * prices の、他社(peers: 価格の配列)の中央値に対する比(%)。純度ごとに出して中央値を取る。
 * 他社が MIN_SAMPLE 社に満たない純度は使わない。比べられなければ null。
 */
function levelPct(prices, peers) {
  const pcts = [];
  for (const [purity, v] of Object.entries(prices ?? {})) {
    if (typeof v !== "number" || v <= 0) continue;
    const others = peers.map((p) => p?.[purity]).filter((x) => typeof x === "number" && x > 0);
    if (others.length < MIN_SAMPLE) continue;
    pcts.push((v / median(others) - 1) * 100);
  }
  return median(pcts);
}

/**
 * 今回の値が、他社に対していつもの位置からどれだけずれているか(%)。決められなければ null。
 * history は companyPriceHistory.json の entries(日付の昇順)。
 */
function levelShift(companies, history, id, now) {
  const target = companies.find((c) => c.id === id);
  const peersNow = companies
    .filter((c) => c.id !== id)
    .filter((c) => {
      const age = ageInDays(c.priceData?.updatedAt, now);
      return age !== null && age <= LEVEL_MAX_PEER_AGE_DAYS;
    })
    .map((c) => c.priceData.prices);
  const current = levelPct(target?.priceData?.prices, peersNow);
  if (current === null) return null;

  const usual = [];
  for (const e of history) {
    const age = ageInDays(e.date, now);
    // 今日の記録には今回の値がもう入っていることがあるので、昨日まで
    if (age === null || age < 1 || age > LEVEL_LOOKBACK_DAYS) continue;
    const mine = e.companies?.[id];
    if (!mine) continue;
    const peers = Object.entries(e.companies).filter(([k]) => k !== id).map(([, v]) => v);
    const pct = levelPct(mine, peers);
    if (pct !== null) usual.push(pct);
  }
  if (usual.length < LEVEL_MIN_DAYS) return null;
  return current - median(usual);
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
 * @param options.history companyPriceHistory.json の entries(日付の昇順)。
 *        変化で引っかかった社が、他社に対していつもの位置にあるかを見るのに使う。
 * @returns { rejected, market, sample } 却下した社の一覧と、何を基準に判定したか
 */
export function rejectImplausible(companies, before, options = {}) {
  const now = options.now ?? new Date();

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
  const recovered = [];
  const history = Array.isArray(options.history) ? options.history : [];

  for (const [id, pct] of moves) {
    // 市場が分かるなら市場との差、分からないなら動いた幅そのものを見る。
    const measured = canCompare ? pct - market : pct;
    const limit = canCompare ? MAX_RESIDUAL_PCT : MAX_UNVERIFIED_PCT;
    if (Math.abs(measured) < limit) continue;

    // 前回の値のほうがずれていただけなら、今回の値は他社に対していつもの位置にある。
    const shift = levelShift(companies, history, id, now);
    if (shift !== null && Math.abs(shift) < MAX_LEVEL_PCT) {
      recovered.push({ id, pct, shift });
      continue;
    }

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
          `前回(${prev.updatedAt})の値を残しています。` +
          levelNote(shift)
        : `${pct.toFixed(1)}%動きました。この回に動いた社が${moves.size}社しか無く` +
          `(${MIN_SAMPLE}社必要)、市場がどう動いたかを決められないため、` +
          `幅そのもので判定しています(${MAX_UNVERIFIED_PCT}%まで)。` +
          `前回(${prev.updatedAt})の値を残しています。` +
          `ページを見て正しければ、1社だけ実行すれば書き込めます。` +
          levelNote(shift),
    });
  }

  return { rejected, recovered, market, sample: moves.size };
}

function levelNote(shift) {
  return shift === null
    ? `(他社に対する位置は、比べられる記録が足りず確かめられませんでした)`
    : `(他社に対する位置も、いつもより${shift.toFixed(1)}%ずれています)`;
}
