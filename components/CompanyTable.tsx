"use client";

import { useMemo, useState } from "react";
import type { Company, Purity, Region } from "@/lib/types";
import { PURITY_LABELS, GOLD_PURITIES, PLATINUM_PURITIES, SILVER_PURITIES } from "@/lib/types";
import { ALL_REGIONS, filterByRegion, getReferenceRate } from "@/lib/companies";
import { getOutboundUrl, hasAffiliateLink } from "@/lib/outboundLink";
import CompanyLogo from "@/components/CompanyLogo";
import PriceBar from "@/components/PriceBar";
import CaveatNote from "@/components/CaveatNote";
import ReferenceDiff from "@/components/ReferenceDiff";
import PrBadge from "@/components/PrBadge";

const PURITY_OPTIONS: Purity[] = [...GOLD_PURITIES, ...PLATINUM_PURITIES, ...SILVER_PURITIES];

export default function CompanyTable({
  companies,
  initialRegion = "全国",
}: {
  companies: Company[];
  initialRegion?: Region | "全国";
}) {
  const [purity, setPurity] = useState<Purity>("k24");
  const [region, setRegion] = useState<Region | "全国">(initialRegion);

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
      </div>

      <ul className="flex flex-col gap-2.5">
        {rows.map((c, i) => {
          const value = c.priceData.prices[purity];
          return (
            <li key={c.id}>
              <a
                href={getOutboundUrl(c)}
                target="_blank"
                rel="nofollow sponsored noopener"
                className={`block rounded-xl border p-3.5 shadow-sm transition active:scale-[0.99] sm:hover:border-accent/50 sm:hover:shadow-md ${
                  i === 0 && value !== undefined
                    ? "border-accent/40 bg-accent-soft/60"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-center text-xs text-muted">{i + 1}</span>
                  <CompanyLogo id={c.id} name={c.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <p className="truncate font-medium">{c.name}</p>
                      {hasAffiliateLink(c) && <PrBadge />}
                      {c.googleReview && (
                        <span className="shrink-0 text-xs font-medium text-accent-strong">
                          ★{c.googleReview.avgRating}
                          <span className="ml-0.5 font-normal text-muted">
                            ({c.googleReview.totalReviewCount.toLocaleString()}件)
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {c.regions.join("・") || "地域不明"}
                      {c.storeCount ? ` ・ ${c.storeCount}店舗` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {value !== undefined ? (
                      <>
                        <p className="text-lg font-semibold tabular-nums">{value.toLocaleString()}円</p>
                        {referenceValue !== undefined && (
                          <ReferenceDiff value={value} referenceValue={referenceValue} />
                        )}
                      </>
                    ) : (
                      (() => {
                        const otherPurities = Object.keys(c.priceData.prices) as Purity[];
                        if (otherPurities.length === 0) {
                          return <p className="text-sm text-muted">公式に価格表示なし</p>;
                        }
                        return (
                          <>
                            <p className="text-sm text-muted">データ取得中</p>
                            <p className="text-[11px] text-muted">
                              {otherPurities.map((p) => PURITY_LABELS[p]).join("・")}は対応
                            </p>
                          </>
                        );
                      })()
                    )}
                  </div>
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
                <div className="mt-2.5 flex items-center justify-between pl-8 text-xs text-muted">
                  <span>更新日: {c.priceData.updatedAt ?? "-"}</span>
                  <span className="font-medium text-accent-strong">公式サイトへ →</span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
