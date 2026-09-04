"use client";

import { useEffect, useState } from "react";
import type { PriceHistory } from "@/lib/priceHistory";
import type { Purity } from "@/lib/types";
import { PURITY_LABELS } from "@/lib/types";
import TrendChart from "@/components/TrendChart";

const STORAGE_KEY = "gold-kaitori-compare:first-visit-date";
const PURITY_TABS: Purity[] = ["k24", "k18", "pt850", "ag"];

export default function PersonalTrend({ history }: { history: PriceHistory }) {
  const [firstVisitDate, setFirstVisitDate] = useState<string | null>(null);
  const [purity, setPurity] = useState<Purity>("k18");

  useEffect(() => {
    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        stored = new Date().toISOString().slice(0, 10);
        localStorage.setItem(STORAGE_KEY, stored);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorageはSSR時に読めないため初回マウント後に反映する
      setFirstVisitDate(stored);
    } catch {
      // localStorageが使えない場合は「今日から」扱いにする
      setFirstVisitDate(new Date().toISOString().slice(0, 10));
    }
  }, []);

  if (!firstVisitDate) return null;

  const availablePurities = PURITY_TABS.filter((p) => history.entries.some((e) => e.prices[p] !== undefined));

  const points = history.entries
    .filter((e) => e.date >= firstVisitDate)
    .map((e) => ({ date: e.date, value: e.prices[purity] }))
    .filter((p): p is { date: string; value: number } => p.value !== undefined);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-foreground">あなたが見始めてからの推移</p>
          <p className="text-xs text-muted">初回アクセス日: {firstVisitDate}(このブラウザに記録)</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {availablePurities.map((p) => (
            <button
              key={p}
              onClick={() => setPurity(p)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
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
      <TrendChart points={points} unit={purity === "ag" ? "円/g" : "円/g"} />
      <p className="mt-3 text-xs text-muted">
        {history.notes} 記録開始日: {history.recordingStartedAt}
      </p>
    </div>
  );
}
