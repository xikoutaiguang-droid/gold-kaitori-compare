"use client";

import { useMemo, useState } from "react";
import type { Company, Purity, Region } from "@/lib/types";
import { PURITY_LABELS, GOLD_PURITIES, PLATINUM_PURITIES, SILVER_PURITIES } from "@/lib/types";
import { ALL_REGIONS, filterByRegion, getReferenceRate } from "@/lib/companies";
import { getOutboundUrl, hasAffiliateLink, getAffiliateLinks } from "@/lib/outboundLink";
import { trackOutboundClick } from "@/lib/analytics";
import CompanyLogo from "@/components/CompanyLogo";
import PriceBar from "@/components/PriceBar";
import CaveatNote from "@/components/CaveatNote";
import { feeDisclosureFor } from "@/lib/fees";
import { deductionFor, UNDISCLOSED_FEE_COMPANIES } from "@/lib/feeDeductions";
import ReferenceDiff from "@/components/ReferenceDiff";
import PrBadge from "@/components/PrBadge";

const PURITY_OPTIONS: Purity[] = [...GOLD_PURITIES, ...PLATINUM_PURITIES, ...SILVER_PURITIES];

/**
 * 社名を「ブラリバ」と「(ブランドリバリュー)」に分ける。
 *
 * 括弧つきの正式名称は、どの会社か分かるためにあるので消さない。ただし価格の
 * 左に残る幅は375pxの端末で147pxしかなく、15文字を1行に押し込むと価格に重なる
 * (Safariは word-break:keep-all のとき括弧の前でも折らない)。かといって
 * どこでも折らせると3行になる。括弧の中だけ小さく下ろすと、どちらも1行に収まる。
 * 括弧の無い社名はこれまでと同じ見え方になる。
 */
function splitName(name: string): { main: string; sub: string | null } {
  const m = /^(.+?)\s*([(（].+[)）])$/.exec(name);
  return m ? { main: m[1], sub: m[2] } : { main: name, sub: null };
}

export default function CompanyTable({
  companies,
  initialRegion = "全国",
  initialPurity = "k24",
}: {
  companies: Company[];
  initialRegion?: Region | "全国";
  /** 純度別ページから開いたときの初期選択。切り替えは従来どおりできる */
  initialPurity?: Purity;
}) {
  const [purity, setPurity] = useState<Purity>(initialPurity);
  const [region, setRegion] = useState<Region | "全国">(initialRegion);
  // 重さを入れたときだけ、差し引き後の金額を出す。
  // 既定は空。単価を見に来ただけの人の画面を変えないため。
  const [weight, setWeight] = useState<string>("");
  const [method, setMethod] = useState<"storefront" | "shipping">("storefront");

  const availablePurities = useMemo(
    () => PURITY_OPTIONS.filter((p) => companies.some((c) => c.priceData.prices[p] !== undefined)),
    [companies]
  );

  const rows = useMemo(() => {
    const filtered = filterByRegion(companies, region);
    return [...filtered].sort((a, b) => {
      const av = a.priceData.prices[purity];
      const bv = b.priceData.prices[purity];
      if (av === undefined && bv === undefined) return 0;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      return bv - av;
    });
  }, [companies, region, purity]);

  const grams = Number(weight);
  const hasWeight = Number.isFinite(grams) && grams > 0;

  /**
   * 重さが入っているときだけ、その重さでの差し引きを出す。
   *
   * /compare は1gあたりの単価を並べるページなので、本来いくら引かれるかは出せない。
   * 引かれる額は取引額で決まるからで、まねきやの分析料は買取金額の階段制になっている。
   * 重さを入れてもらえば初めて確定するので、入ったときだけ出す。
   */
  const netOf = (c: Company) => {
    const unit = c.priceData.prices[purity];
    if (!hasWeight || unit === undefined) return null;
    const gross = unit * grams;
    const d = deductionFor(c.id, gross, method);
    const known = d && !d.none && d.amount !== null ? d.amount : 0;
    const unknown = (d && !d.none && d.amount === null) || UNDISCLOSED_FEE_COMPANIES.includes(c.id);
    // 差し引きのほうが高くつく重さがある(シルバー1gは328円に対し分析料1,100円)。
    // 「約-772円」と出すのは数字としては合っていても、受け取る額としては嘘になる。
    // そういう重さでは金額を出さず、引かれるぶんのほうが高いことだけ書く。
    const underwater = known >= gross;
    return {
      gross,
      deduction: d,
      net: gross - known,
      unitNet: (gross - known) / grams,
      unknown,
      underwater,
    };
  };

  // 表示単価の1位と、手元に残る額の1位が入れ替わるか。
  // 金額の分からない社は比較から外す。知らないことを根拠に順位を作らない。
  const flipped = useMemo(() => {
    if (!hasWeight) return null;
    const priced = rows
      .map((c) => ({ c, n: netOf(c) }))
      .filter((x): x is { c: Company; n: NonNullable<ReturnType<typeof netOf>> } => x.n !== null);
    // 単価1位の差し引きが公表されていない場合は、この比較そのものが成り立たない。
    // 外して2位を「表示単価では1位」と書くと、並びと食い違う嘘になる。
    const byGross = priced[0];
    if (!byGross || byGross.n.unknown || byGross.n.underwater) return null;
    const ok = priced.filter((x) => !x.n.unknown && !x.n.underwater);
    if (ok.length < 2) return null;
    const byNet = [...ok].sort((a, b) => b.n.net - a.n.net)[0];
    if (byNet.c.id === byGross.c.id) return null;
    return { byGross, byNet };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, hasWeight, grams, method, purity]);

  const maxPrice = Math.max(1, ...rows.map((c) => c.priceData.prices[purity] ?? 0));
  const referenceRate = getReferenceRate();
  const referenceValue = referenceRate.prices[purity];

  return (
    <div>
      {referenceValue !== undefined && (
        <p className="mb-4 rounded-lg bg-accent-soft/60 px-3 py-2 text-xs text-foreground/70">
          参考: {referenceRate.source}の店頭買取価格(地金基準)は{referenceValue.toLocaleString()}円/g
          ({referenceRate.updatedAt}公表)。各社の価格差の目安としてご覧ください。
        </p>
      )}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">純度</label>
          <div className="flex flex-wrap gap-1.5">
            {availablePurities.map((p) => (
              <button
                key={p}
                onClick={() => setPurity(p)}
                className={`min-h-9 rounded-full border px-3.5 py-1.5 text-sm transition active:scale-95 ${
                  purity === p
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border text-foreground/80 hover:bg-accent-soft"
                }`}
              >
                {PURITY_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">対応地域</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region | "全国")}
            className="min-h-9 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm sm:w-auto"
          >
            {ALL_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        {/* 重さは任意。入れたときだけ、各社が公表している差し引きを引いた額を出す。
            単価だけ見に来た人の画面は変えない。 */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            重さ(g・任意)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={weight}
              placeholder="例 10"
              onChange={(e) => setWeight(e.target.value)}
              className="min-h-9 w-24 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
            />
            {hasWeight && (
              <div className="flex rounded-lg border border-border bg-surface p-0.5">
                {([
                  ["storefront", "店頭"],
                  ["shipping", "宅配"],
                ] as const).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMethod(v)}
                    aria-pressed={method === v}
                    className={`min-h-8 rounded-md px-2.5 text-xs font-medium transition ${
                      method === v ? "bg-accent text-accent-foreground" : "text-foreground/70"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasWeight && (
        <p className="mb-4 text-xs leading-relaxed text-muted">
          {PURITY_LABELS[purity]}を{grams}g売った場合の金額を、各行に出しています。
          差し引きを公表している社はその額を引いた「手取り」まで、
          公表していない社は引かれることだけを書いています。順位は公表単価のままです。
        </p>
      )}

      {flipped && (
        <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-50/60 p-4 dark:bg-amber-950/20">
          <p className="text-sm font-semibold">単価の1位と、手取りの1位が違います</p>
          <p className="mt-1.5 text-sm leading-relaxed">
            表示単価では{flipped.byGross.c.name}が1位ですが、各社が公表している差し引きを引くと
            <strong className="mx-1">{flipped.byNet.c.name}</strong>のほうが
            <strong className="mx-1 tabular-nums">
              {Math.round(flipped.byNet.n.net - flipped.byGross.n.net).toLocaleString("ja-JP")}円
            </strong>
            多く残ります。
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {rows.map((c, i) => {
          const value = c.priceData.prices[purity];
          // この純度の価格が無い社で「ほかに何なら対応しているか」を出すために使う
          const otherPurities = Object.keys(c.priceData.prices) as Purity[];
          const links = getAffiliateLinks(c);
          const cardClassName = `rounded-xl border p-3.5 shadow-sm transition ${
            i === 0 && value !== undefined ? "border-accent/40 bg-accent-soft/60" : "border-border bg-surface"
          }`;

          const body = (
            <>
              <div className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-xs text-muted">{i + 1}</span>
                <CompanyLogo id={c.id} name={c.name} size={32} />
                <div className="min-w-0 flex-1">
                  {/* 社名は truncate しない。PRバッジと価格に挟まれて幅が68pxしか残らず、
                      「ブランドオフ」が「ブランド…」になって、どの店か読めなくなっていた。
                      折り返しを許し、バッジは社名の後ろに流す。 */}
                  <div className="flex flex-wrap items-center gap-x-2">
                    <p className="font-medium break-keep [overflow-wrap:anywhere]">
                      {splitName(c.name).main}
                    </p>
                    {hasAffiliateLink(c) && <PrBadge />}
                  </div>
                  {splitName(c.name).sub && (
                    <p className="break-keep text-xs text-muted [overflow-wrap:anywhere]">
                      {splitName(c.name).sub}
                    </p>
                  )}
                  {/* ★評価は名前と同じ行に置くと、PRバッジや長い社名と重なって
                      右側の価格ブロックに食い込む(どちらも shrink-0 のため互いに縮まない)。
                      地域と同じ2行目に下ろして、行全体で折り返せるようにする。 */}
                </div>
                <div className="shrink-0 text-right">
                  {value !== undefined ? (
                    // 田中貴金属比はここに置かない。「田中貴金属比: -3,033円 (-12.5%)」は
                    // 折り返さない長い文字列で、この右カラムを174pxまで広げてしまい、
                    // 左の社名・評価の領域を51pxまで潰して文字をはみ出させていた。
                    // 価格だけを右に置き、比較はカード幅いっぱいの別行に出す。
                    <p className="text-lg font-semibold tabular-nums">{value.toLocaleString()}円</p>
                  ) : otherPurities.length === 0 ? (
                    <p className="text-sm text-muted">公式に価格表示なし</p>
                  ) : (
                    // 「K24(純金)・K22・K20・…・シルバーは対応」も右カラムには置かない。
                    // 12純度ぶん並ぶと490pxの折り返さない1行になり、shrink-0 のこの枠が
                    // そこまで広がってページ全体を610pxにしていた。固定の下部ナビまで
                    // 引き伸ばされて、/price/k21-6 などが横スクロールしていた。
                    // 短い「データ取得中」だけを右に残し、純度の列挙は下の行に下ろす。
                    <p className="text-sm text-muted">データ取得中</p>
                  )}
                </div>
              </div>

              {/* 評価・地域・店舗数は価格の横に置くと幅が足りない。
                  地域が6つある社では一行が価格に重なってはみ出していた。
                  カード幅いっぱいの行に下ろして、普通に折り返させる。 */}
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 pl-8 text-xs text-muted">
                {c.googleReview && (
                  <span className="font-medium text-accent-strong">
                    ★{c.googleReview.avgRating}
                    <span className="ml-0.5 font-normal text-muted">
                      ({c.googleReview.totalReviewCount.toLocaleString()}件)
                    </span>
                  </span>
                )}
                <span className="min-w-0">
                  {c.regions.join("・") || "地域不明"}
                  {c.storeCount ? ` ・ ${c.storeCount}店舗` : ""}
                </span>
                {value === undefined && otherPurities.length > 0 && (
                  <span className="w-full">
                    {otherPurities.map((p) => PURITY_LABELS[p]).join("・")}は対応
                  </span>
                )}
                {value !== undefined && referenceValue !== undefined && (
                  <span className="ml-auto">
                    <ReferenceDiff value={value} referenceValue={referenceValue} />
                  </span>
                )}
              </div>
              {value !== undefined && (
                <div className="mt-2.5 pl-8">
                  <PriceBar value={value} max={maxPrice} />
                </div>
              )}
              {c.priceCaveat && (
                <div className="mt-2 pl-8">
                  <CaveatNote>{c.priceCaveat}</CaveatNote>
                </div>
              )}
              {/* 重さが入っているときは、その重さでの金額を出す。
                  差し引きが分かる社は手取りと実質単価まで、分からない社は
                  引かれることだけ。知らない額を埋めない。 */}
              {(() => {
                const n = netOf(c);
                if (!n) return null;
                const d = n.deduction;
                const deducted = d && !d.none;
                return (
                  <div className="mt-2 pl-8 text-xs leading-relaxed">
                    <span className="text-muted">{grams}gで </span>
                    <span className="tabular-nums">{Math.round(n.gross).toLocaleString("ja-JP")}円</span>
                    {deducted && d.amount !== null && n.underwater && (
                      <span className="text-amber-700 dark:text-amber-400">
                        。{d.rule.label}
                        {d.amount.toLocaleString("ja-JP")}円のほうが高く、この重さでは手元に残りません
                      </span>
                    )}
                    {deducted && d.amount !== null && !n.underwater && (
                      <>
                        <span className="text-muted"> − {d.rule.label}</span>
                        <span className="tabular-nums">{d.amount.toLocaleString("ja-JP")}円</span>
                        <span className="text-muted"> = </span>
                        <strong className="tabular-nums text-accent-strong">
                          約{Math.round(n.net).toLocaleString("ja-JP")}円
                        </strong>
                        <span className="text-muted">
                          （実質{Math.round(n.unitNet).toLocaleString("ja-JP")}円/g）
                        </span>
                      </>
                    )}
                    {deducted && d.amount === null && (
                      <span className="text-amber-700 dark:text-amber-400">
                        {" "}
                        ここから{d.rule.label}が引かれます
                        {d.atLeast ? `（分かっているぶんで${d.atLeast.toLocaleString("ja-JP")}円以上）` : ""}
                      </span>
                    )}
                    {!deducted && n.unknown && (
                      <span className="text-amber-700 dark:text-amber-400">
                        {" "}
                        手数料が引かれますが、金額は公表されていません
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* 単価から別途引くと自社で書いている社は、その旨を並びの中に出す。
                  順位は公表単価で付けているので、同じ順位でも受け取る額は同じではない。
                  priceCaveat に金額まで書けている社(まねきや)はそちらのほうが詳しいので出さない。 */}
              {!c.priceCaveat &&
                feeDisclosureFor(c.id)?.model === "deducted" &&
                (() => {
                  const fee = feeDisclosureFor(c.id)!;
                  return (
                    <div className="mt-2 pl-8">
                      <CaveatNote>
                        {fee.condition ??
                          "この単価から手数料が別途引かれると同社が記載しています(金額は要確認)"}
                      </CaveatNote>
                    </div>
                  );
                })()}
            </>
          );

          return (
            <li key={c.id}>
              {links.length >= 2 ? (
                <div className={cardClassName}>
                  {body}
                  <div className="mt-2.5 flex flex-col gap-2 pl-8 text-xs text-muted sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <span>更新日: {c.priceData.updatedAt ?? "-"}</span>
                    {/* 指で押す前提の大きさにする。テキストリンクのままだと
                        行の高さぶんしか当たり判定がなく、スマホで狙いにくい。
                        min-h-11 は44px相当で、iOSが示す最小タップ領域。 */}
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                      {links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="nofollow sponsored noopener"
                          onClick={() =>
                            trackOutboundClick({ shopId: c.id, shopName: c.name, hasAffiliate: true, source: "compare" })
                          }
                          className="flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface-2/60 px-4 py-2 text-center text-sm font-medium leading-snug text-accent-strong transition active:scale-[0.99] sm:hover:border-accent sm:hover:bg-accent-soft/40"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  href={getOutboundUrl(c)}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  onClick={() =>
                    trackOutboundClick({
                      shopId: c.id,
                      shopName: c.name,
                      hasAffiliate: hasAffiliateLink(c),
                      source: "compare",
                    })
                  }
                  className={`block ${cardClassName} active:scale-[0.99] sm:hover:border-accent/50 sm:hover:shadow-md`}
                >
                  {body}
                  <div className="mt-2.5 flex items-center justify-between gap-2 pl-8 text-xs text-muted">
                    <span>更新日: {c.priceData.updatedAt ?? "-"}</span>
                    {/* カード全体がリンクなので当たり判定は足りているが、
                        押せる場所だと分かるように見た目をボタンに揃える。 */}
                    <span className="flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2/60 px-4 text-sm font-medium text-accent-strong">
                      公式サイト
                    </span>
                  </div>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
