"use client";

import { useMemo, useState } from "react";
import type { Company, Purity } from "@/lib/types";
import { PURITY_LABELS, GOLD_PURITIES, PLATINUM_PURITIES, SILVER_PURITIES } from "@/lib/types";
import { getOutboundUrl, hasAffiliateLink } from "@/lib/outboundLink";
import CompanyLogo from "@/components/CompanyLogo";
import PriceBar from "@/components/PriceBar";
import CaveatNote from "@/components/CaveatNote";
import ShareResult from "@/components/ShareResult";
import PrBadge from "@/components/PrBadge";

const PURITY_OPTIONS: Purity[] = [...GOLD_PURITIES, ...PLATINUM_PURITIES, ...SILVER_PURITIES];

export default function SimulatorForm({ companies }: { companies: Company[] }) {
  const [weight, setWeight] = useState<string>("10");
  const [stoneWeight, setStoneWeight] = useState<string>("");
  const [purity, setPurity] = useState<Purity>("k18");

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
      .map((c) => ({
        company: c,
        amount: (c.priceData.prices[purity] as number) * (validWeight ? goldWeight : 0),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [companies, purity, goldWeight, validWeight]);

  const maxAmount = Math.max(1, ...results.map((r) => r.amount));

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

      <ul className="flex flex-col gap-2.5">
        {results.map(({ company, amount }, i) => (
          <li key={company.id}>
            <a
              href={getOutboundUrl(company)}
              target="_blank"
              rel="nofollow sponsored noopener"
              className={`block rounded-xl border p-3.5 shadow-sm transition active:scale-[0.99] sm:hover:border-accent/50 sm:hover:shadow-md ${
                i === 0 && validWeight ? "border-accent/40 bg-accent-soft/60" : "border-border bg-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-xs text-muted">{i + 1}</span>
                <CompanyLogo id={company.id} name={company.name} size={32} />
                <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate font-medium">
                  <span className="truncate">{company.name}</span>
                  {hasAffiliateLink(company) && <PrBadge />}
                </span>
                <span className="shrink-0 text-lg font-semibold tabular-nums">
                  {validWeight ? `約${Math.round(amount).toLocaleString()}円` : "-"}
                </span>
              </div>
              {validWeight && (
                <div className="mt-2.5 pl-8">
                  <PriceBar value={amount} max={maxAmount} />
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
