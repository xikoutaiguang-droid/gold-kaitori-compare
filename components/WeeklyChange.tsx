import Link from "next/link";
import { getPriceHistory } from "@/lib/priceHistory";

/**
 * 「今が売り時か」を知りたい人が本当に欲しいのは予想ではなく事実なので、
 * 1週間前との差だけを1行で出す。問いかけの形にはしない。
 *
 * 前日比にしないのは、土日祝は市場が動かず数字が出ないため。
 * 実際この連休では前日比+1円で、出しても何も伝わらない。
 *
 * 記録は2026-09-04開始なので、7日前の記録が無いうちは何も出さない。
 */
const DAYS = 7;

function jaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[2])}月${Number(m[3])}日` : iso;
}

export default function WeeklyChange() {
  const { entries } = getPriceHistory();
  if (entries.length <= DAYS) return null;

  const latest = entries[entries.length - 1];
  const past = entries[entries.length - 1 - DAYS];
  const now = latest.prices.k24;
  const then = past.prices.k24;
  if (now === undefined || then === undefined) return null;

  const diff = now - then;
  if (diff === 0) return null;

  return (
    <p className="mb-8 text-sm leading-relaxed text-muted sm:mb-10">
      掲載社のK24平均は、1週間前（{jaDate(past.date)}）より{" "}
      <span
        className={`font-semibold tabular-nums ${
          diff > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/80"
        }`}
      >
        {diff > 0 ? "+" : ""}
        {diff.toLocaleString("ja-JP")}円/g
      </span>
      です。
      <Link href="/trend" className="ml-1 underline underline-offset-2">
        推移を見る
      </Link>
    </p>
  );
}
