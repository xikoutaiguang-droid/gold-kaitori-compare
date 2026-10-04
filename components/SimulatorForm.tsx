"use client";

import { useMemo, useState } from "react";
import type { Company, Purity } from "@/lib/types";
import { PURITY_LABELS, GOLD_PURITIES, PLATINUM_PURITIES, SILVER_PURITIES } from "@/lib/types";
import { getOutboundUrl, hasAffiliateLink } from "@/lib/outboundLink";
import { trackOutboundClick } from "@/lib/analytics";
import CompanyLogo from "@/components/CompanyLogo";
import PriceBar from "@/components/PriceBar";
import CaveatNote from "@/components/CaveatNote";
import ShareResult from "@/components/ShareResult";
import PrBadge from "@/components/PrBadge";
import { deductionFor, UNDISCLOSED_FEE_COMPANIES } from "@/lib/feeDeductions";

const PURITY_OPTIONS: Purity[] = [...GOLD_PURITIES, ...PLATINUM_PURITIES, ...SILVER_PURITIES];

export default function SimulatorForm({ companies }: { companies: Company[] }) {
  const [weight, setWeight] = useState<string>("10");
  const [stoneWeight, setStoneWeight] = useState<string>("");
  const [purity, setPurity] = useState<Purity>("k18");
  // 差し引きは持ち込み方で変わる。リファスタとネクサスは宅配のときだけ引かれ、
  // まねきやの分析料は店頭でもかかる。既定は店頭(引かれるものが少ないほう)。
  const [method, setMethod] = useState<"storefront" | "shipping">("storefront");

  const availablePurities = useMemo(
    () => PURITY_OPTIONS.filter((p) => companies.some((c) => c.priceData.prices[p] !== undefined)),
    [companies]
  );

  const weightNum = Number(weight);
  const stoneWeightNum = Number(stoneWeight) || 0;
  const goldWeight = Math.max(0, weightNum - stoneWeightNum);
  const validWeight = Number.isFinite(weightNum) && weightNum > 0 && goldWeight > 0;

  const results = useMemo(() => {
    return [...companies]
      .filter((c) => c.priceData.prices[purity] !== undefined)
      .map((c) => {
        const amount = (c.priceData.prices[purity] as number) * (validWeight ? goldWeight : 0);
        const d = deductionFor(c.id, amount, method);
        // 引かれる額が分かっている社だけ、手取りを出す。
        // 未公表の社に勝手な数字を置くと、順位が作り話になる。
        const known = d && !d.none && d.amount !== null ? d.amount : 0;
        return {
          company: c,
          amount,
          deduction: d,
          net: amount - known,
          // 金額が出せない社。順位の比較からは外して、注記だけ出す
          uncertain:
            (d && !d.none && d.amount === null) || UNDISCLOSED_FEE_COMPANIES.includes(c.id),
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [companies, purity, goldWeight, validWeight, method]);

  const maxAmount = Math.max(1, ...results.map((r) => r.amount));

  // 表示単価の1位と、手取りの1位が入れ替わるかどうか。
  // 入れ替わるときだけ上に出す。常に出すと注意書きとして読み飛ばされる。
  const flipped = useMemo(() => {
    if (!validWeight) return null;
    const comparable = results.filter((r) => !r.uncertain);
    if (comparable.length < 2) return null;
    const byGross = comparable[0];
    const byNet = [...comparable].sort((a, b) => b.net - a.net)[0];
    if (byNet.company.id === byGross.company.id) return null;
    return { byGross, byNet };
  }, [results, validWeight]);

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-5 flex flex-wrap items-end gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">重さ(g)</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-24 min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">石の重さ(g・任意)</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={stoneWeight}
            onChange={(e) => setStoneWeight(e.target.value)}
            className="w-28 min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">純度</label>
          <select
            value={purity}
            onChange={(e) => setPurity(e.target.value as Purity)}
            className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base"
          >
            {availablePurities.map((p) => (
              <option key={p} value={p}>
                {PURITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">持ち込み方</label>
          <div className="flex rounded-lg border border-border bg-surface p-0.5">
            {([
              ["storefront", "店頭"],
              ["shipping", "宅配"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMethod(value)}
                aria-pressed={method === value}
                className={`min-h-10 rounded-md px-3.5 text-sm font-medium transition ${
                  method === value
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:bg-accent-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {stoneWeightNum > 0 && (
        <div className="mb-4">
          <CaveatNote>
            ダイヤなどの石が付いている場合、多くの買取店は地金の重量から石の重量を差し引いて査定します。正確な石の重量が分からない場合、この計算はあくまで概算になります。
          </CaveatNote>
        </div>
      )}

      {!validWeight && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          重さ(石の重さを差し引いた地金部分)を正の数にしてください。
        </p>
      )}

      {validWeight && results.length > 0 && (
        <div className="mb-4">
          <ShareResult
            contextLabel={`${PURITY_LABELS[purity]} ${goldWeight}g`}
            results={results.slice(0, 3).map((r) => ({ name: r.company.name, amount: Math.round(r.amount) }))}
          />
        </div>
      )}

      {flipped && (
        <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-50/60 p-4 dark:bg-amber-950/20">
          <p className="text-sm font-semibold">単価の1位と、手取りの1位が違います</p>
          <p className="mt-1.5 text-sm leading-relaxed">
            表示単価では{flipped.byGross.company.name}が1位ですが、各社が公表している差し引きを引くと
            <strong className="mx-1">{flipped.byNet.company.name}</strong>
            のほうが
            <strong className="mx-1 tabular-nums">
              {Math.round(flipped.byNet.net - flipped.byGross.net).toLocaleString()}円
            </strong>
            多く残ります。
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {results.map(({ company, amount, deduction, net, uncertain }, i) => (
          <li key={company.id}>
            <a
              href={getOutboundUrl(company)}
              target="_blank"
              rel="nofollow sponsored noopener"
              onClick={() =>
                trackOutboundClick({
                  shopId: company.id,
                  shopName: company.name,
                  hasAffiliate: hasAffiliateLink(company),
                  source: "simulator",
                })
              }
              className={`block rounded-xl border p-3.5 shadow-sm transition active:scale-[0.99] sm:hover:border-accent/50 sm:hover:shadow-md ${
                i === 0 && validWeight ? "border-accent/40 bg-accent-soft/60" : "border-border bg-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-xs text-muted">{i + 1}</span>
                <CompanyLogo id={company.id} name={company.name} size={32} />
                {/* 社名を truncate すると、PRバッジと金額に挟まれて
                    「ブラリバ(ブランドリバリュー)」が半分で切れる。折り返させる。 */}
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 font-medium">
                  <span className="break-keep [overflow-wrap:anywhere]">{company.name}</span>
                  {hasAffiliateLink(company) && <PrBadge />}
                </span>
                <span className="shrink-0 text-lg font-semibold tabular-nums">
                  {validWeight ? `約${Math.round(amount).toLocaleString()}円` : "-"}
                </span>
              </div>
              {validWeight && (
                <div className="mt-2.5 pl-8">
                  <PriceBar value={amount} max={maxAmount} />
                  {deduction && !deduction.none && (
                    <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                      {deduction.amount !== null ? (
                        <>
                          ここから{deduction.rule.label}
                          <strong className="mx-0.5 tabular-nums">
                            {deduction.amount.toLocaleString()}円
                          </strong>
                          {deduction.rule.taxExcluded && "(税抜)"}
                          {deduction.rule.per === "item" && "が商品1点ごとに"}引かれ、
                          <strong className="mx-0.5 tabular-nums">
                            約{Math.round(net).toLocaleString()}円
                          </strong>
                          になります。
                        </>
                      ) : (
                        <>
                          ここから{deduction.rule.label}が引かれます
                          {deduction.atLeast ? (
                            <>（分かっているぶんだけで{deduction.atLeast.toLocaleString()}円以上）</>
                          ) : null}
                          。
                        </>
                      )}
                      {deduction.note && <span className="block text-muted">{deduction.note}</span>}
                    </p>
                  )}
                  {!deduction && uncertain && (
                    <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                      この社は「買取相場価格に手数料は含まれておりません」と書いていますが、
                      金額は公表されていません。
                    </p>
                  )}
                </div>
              )}
            </a>
          </li>
        ))}
      </ul>
      {results.length === 0 && (
        <p className="py-6 text-sm text-muted">この純度の価格データがまだありません。他の純度を選んでください。</p>
      )}
    </div>
  );
}
