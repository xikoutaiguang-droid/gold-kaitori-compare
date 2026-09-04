"use client";

import { useState } from "react";
import type { Purity } from "@/lib/types";
import { PURITY_LABELS, GOLD_PURITIES, PLATINUM_PURITIES, SILVER_PURITIES } from "@/lib/types";
import { PURITY_FINENESS } from "@/lib/units";

const PURITY_OPTIONS: Purity[] = [...GOLD_PURITIES, ...PLATINUM_PURITIES, ...SILVER_PURITIES];

export default function PurityCalculator() {
  const [weight, setWeight] = useState<string>("10");
  const [purity, setPurity] = useState<Purity>("k18");

  const weightNum = Number(weight);
  const isValid = Number.isFinite(weightNum) && weightNum >= 0 && weight.trim() !== "";
  const fineness = PURITY_FINENESS[purity];
  const pureWeight = isValid ? weightNum * fineness : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">重さ(g)</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-28 min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">純度(刻印)</label>
          <select
            value={purity}
            onChange={(e) => setPurity(e.target.value as Purity)}
            className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base"
          >
            {PURITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {PURITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isValid ? (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">0以上の数値を入力してください。</p>
      ) : (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent-soft/60 p-4">
          <p className="text-sm text-muted">
            {PURITY_LABELS[purity]}(品位{(fineness * 100).toFixed(1)}%) {weightNum.toLocaleString()}g に含まれる純金属量
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            約{pureWeight.toLocaleString(undefined, { maximumFractionDigits: 3 })}g
          </p>
        </div>
      )}

      <p className="mt-3 text-xs text-muted">
        品位はK18・Pt900のような刻印に基づく公表値です。実際の含有量は個体差により多少前後することがあります。
      </p>
    </div>
  );
}
