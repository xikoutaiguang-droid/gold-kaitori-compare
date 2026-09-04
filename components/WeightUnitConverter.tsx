"use client";

import { useMemo, useState } from "react";
import { WEIGHT_UNIT_TO_GRAM, WEIGHT_UNIT_LABELS, type WeightUnit } from "@/lib/units";

const UNITS = Object.keys(WEIGHT_UNIT_TO_GRAM) as WeightUnit[];

export default function WeightUnitConverter() {
  const [value, setValue] = useState<string>("10");
  const [unit, setUnit] = useState<WeightUnit>("momme");

  const valueNum = Number(value);
  const isValid = Number.isFinite(valueNum) && valueNum >= 0 && value.trim() !== "";
  const grams = isValid ? valueNum * WEIGHT_UNIT_TO_GRAM[unit] : 0;

  const results = useMemo(
    () =>
      UNITS.map((u) => ({
        unit: u,
        value: grams / WEIGHT_UNIT_TO_GRAM[u],
      })),
    [grams]
  );

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">数値</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.001"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-32 min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">単位</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as WeightUnit)}
            className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {WEIGHT_UNIT_LABELS[u]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isValid ? (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">0以上の数値を入力してください。</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2.5">
          {results.map((r) => (
            <li
              key={r.unit}
              className={`flex items-center justify-between rounded-xl border p-3.5 ${
                r.unit === unit ? "border-accent/40 bg-accent-soft/60" : "border-border bg-surface"
              }`}
            >
              <span className="text-sm text-muted">{WEIGHT_UNIT_LABELS[r.unit]}</span>
              <span className="text-lg font-semibold tabular-nums">
                {r.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
