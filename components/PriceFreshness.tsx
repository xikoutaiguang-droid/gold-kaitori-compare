import Link from "next/link";
import { formatFetchedAt, formatPriceDay, priceDateSummary } from "@/lib/companies";

/**
 * 並べている価格がいつのものかを1行で出す。
 *
 * 各社の公表日は揃わない(週末を挟むと前営業日のまま据え置く店がある)ので、
 * 代表の1日だけを書かず、日付ごとの社数をそのまま出す。
 * あわせて当サイトが取りに行った時刻も出す。公表日が昨日でも、今日確認して
 * 変わっていなかったのか、まだ今日は見ていないのかで意味が違う。
 */
export default function PriceFreshness({ className = "" }: { className?: string }) {
  const s = priceDateSummary();
  if (!s.byDate.length) return null;

  const fetched = formatFetchedAt(s.fetchedAt ?? undefined);

  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      <span className="font-medium text-foreground/80">
        価格の更新日：
        {s.byDate.map((d, i) => (
          <span key={d.date}>
            {i > 0 && "／"}
            {formatPriceDay(d.date)}
            {s.byDate.length > 1 && ` ${d.count}社`}
          </span>
        ))}
      </span>
      {s.byDate.length > 1 && "（市場が動かない日は、前の営業日の価格を据え置く店があります）"}
      {fetched && `。当サイトが各社の公式サイトを確認したのは${fetched}（日本時間）です。`}
      <Link href="/about" className="ml-1 underline underline-offset-2 hover:no-underline">
        集め方
      </Link>
    </p>
  );
}
