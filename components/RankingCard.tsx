import type { Company, Purity } from "@/lib/types";
import { PURITY_LABELS } from "@/lib/types";
import { getOutboundUrl, hasAffiliateLink } from "@/lib/outboundLink";
import CompanyLogo from "@/components/CompanyLogo";
import PriceBar from "@/components/PriceBar";
import PrBadge from "@/components/PrBadge";

export default function RankingCard({
  companies,
  purity,
  limit = 5,
}: {
  companies: Company[];
  purity: Purity;
  limit?: number;
}) {
  const ranked = companies
    .filter((c) => c.priceData.prices[purity] !== undefined)
    .sort((a, b) => (b.priceData.prices[purity] ?? 0) - (a.priceData.prices[purity] ?? 0))
    .slice(0, limit);

  const maxPrice = Math.max(1, ...ranked.map((c) => c.priceData.prices[purity] ?? 0));

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <p className="whitespace-nowrap text-xl font-bold text-foreground">{PURITY_LABELS[purity]}</p>
        <p className="mt-0.5 whitespace-nowrap text-xs text-muted">
          本日の買取価格ランキング TOP{ranked.length}
        </p>
      </div>
      {ranked.length === 0 ? (
        <p className="text-sm text-muted">データを準備中です。</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ranked.map((c, i) => {
            const value = c.priceData.prices[purity]!;
            return (
              <li key={c.id}>
                <a
                  href={getOutboundUrl(c)}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="-mx-1 flex items-center gap-3 rounded-lg px-1 py-0.5 transition sm:hover:bg-accent-soft"
                >
                  <span className="w-4 shrink-0 text-center text-xs text-muted">{i + 1}</span>
                  <CompanyLogo id={c.id} name={c.name} size={26} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.name}
                      {hasAffiliateLink(c) && (
                        <span className="ml-1.5 align-middle">
                          <PrBadge />
                        </span>
                      )}
                    </p>
                    <div className="mt-1.5">
                      <PriceBar value={value} max={maxPrice} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold leading-none tabular-nums text-accent-strong sm:text-xl">
                      {value.toLocaleString()}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">円/g</p>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
