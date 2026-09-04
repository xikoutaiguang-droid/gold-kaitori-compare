"use client";

import { useMemo, useState } from "react";
import type { Company, Purity } from "@/lib/types";
import { PURITY_LABELS } from "@/lib/types";
import { DIAGNOSIS_CRITERIA, diagnose, type CriteriaId } from "@/lib/companies";
import { getOutboundUrl, hasAffiliateLink } from "@/lib/outboundLink";
import CompanyLogo from "@/components/CompanyLogo";
import ReliabilityBadge from "@/components/ReliabilityBadge";
import CaveatNote from "@/components/CaveatNote";
import PrBadge from "@/components/PrBadge";

const PURITY_OPTIONS: Purity[] = ["k24", "k18"];

export default function DiagnosisForm({ companies }: { companies: Company[] }) {
  const [selected, setSelected] = useState<CriteriaId[]>([]);
  const [purity, setPurity] = useState<Purity>("k18");

  const toggle = (id: CriteriaId) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const results = useMemo(() => diagnose(companies, selected, purity), [companies, selected, purity]);

  return (
    <div>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">重視するポイントを選んでください(複数選択可)</label>
        <div className="flex flex-col gap-2">
          {DIAGNOSIS_CRITERIA.map((c) => (
            <label
              key={c.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                selected.includes(c.id) ? "border-accent bg-accent-soft" : "border-border bg-surface"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={() => toggle(c.id)}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="block font-medium">{c.label}</span>
                <span className="block text-muted">{c.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-xs font-medium text-muted">
          「高価買取」を選んだ場合に比較する純度
        </label>
        <select
          value={purity}
          onChange={(e) => setPurity(e.target.value as Purity)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        >
          {PURITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PURITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      <h2 className="font-serif-jp mb-3 text-lg font-semibold">
        {selected.length === 0 ? "全社一覧" : "おすすめ順"}
      </h2>
      <ul className="flex flex-col gap-3">
        {results.slice(0, 10).map(({ company }, i) => (
          <CompanyCard key={company.id} company={company} rank={i + 1} purity={purity} />
        ))}
      </ul>
    </div>
  );
}

function CompanyCard({ company, rank, purity }: { company: Company; rank: number; purity: Purity }) {
  const price = company.priceData.prices[purity];
  return (
    <li>
      <a
        href={getOutboundUrl(company)}
        target="_blank"
        rel="nofollow sponsored noopener"
        className={`block rounded-xl border p-4 shadow-sm transition active:scale-[0.99] sm:hover:border-accent/50 sm:hover:shadow-md ${
          rank === 1 ? "border-accent/40 bg-accent-soft/60" : "border-border bg-surface"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 w-5 shrink-0 text-center text-xs text-muted">#{rank}</span>
          <CompanyLogo id={company.id} name={company.name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {company.name}
              {hasAffiliateLink(company) && (
                <span className="ml-1.5 align-middle">
                  <PrBadge />
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-muted">{company.trustNotes}</p>
            <p className="mt-1 text-xs text-muted">
              対応地域: {company.regions.join("・") || "不明"} / 信頼度目安: {company.trustScore}/5
            </p>
            {company.googleReview && (
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                <span>
                  口コミ★{company.googleReview.avgRating}(サンプル{company.googleReview.sampleSize}店舗・
                  {company.googleReview.totalReviewCount.toLocaleString()}件)
                </span>
                <ReliabilityBadge googleReview={company.googleReview} />
              </p>
            )}
            {company.priceCaveat && (
              <div className="mt-1">
                <CaveatNote>{company.priceCaveat}</CaveatNote>
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-muted">{PURITY_LABELS[purity]}</div>
            <div className="text-lg font-semibold tabular-nums">
              {price !== undefined ? `${price.toLocaleString()}円` : "取得中"}
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <span className="text-sm font-medium text-accent-strong">公式サイトへ →</span>
        </div>
      </a>
    </li>
  );
}
