import rawHistory from "@/data/priceHistory.json";
import type { Purity } from "@/lib/types";

export interface PriceHistoryEntry {
  date: string;
  prices: Partial<Record<Purity, number>>;
}

export interface PriceHistory {
  recordingStartedAt: string;
  notes: string;
  entries: PriceHistoryEntry[];
}

export function getPriceHistory(): PriceHistory {
  return rawHistory as PriceHistory;
}
