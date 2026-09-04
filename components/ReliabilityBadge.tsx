import { RELIABILITY_LABELS, reviewReliability, type ReliabilityTier } from "@/lib/companies";
import type { Company } from "@/lib/types";

const TIER_STYLE: Record<ReliabilityTier, string> = {
  high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function ReliabilityBadge({ googleReview }: { googleReview: NonNullable<Company["googleReview"]> }) {
  const tier = reviewReliability(googleReview);
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TIER_STYLE[tier]}`}>
      {RELIABILITY_LABELS[tier]}
    </span>
  );
}
