import type { FuturesOutlookEntry, ResolvedOutlook } from "@/lib/futuresOutlook";

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export default function FuturesOutlook({
  latest,
  resolved,
}: {
  latest: FuturesOutlookEntry | null;
  resolved: ResolvedOutlook[];
}) {
  if (!latest) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-border bg-surface p-4 text-center text-sm text-muted">
        先物データはまだ記録がありません。明日以降、ここに表示されます。
      </div>
    );
  }

  const impliedDiff = latest.nearestPrice - latest.spotPrice;
  const impliedPct = (impliedDiff / latest.spotPrice) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <p className="text-sm text-muted">大阪取引所 金先物(スポット相当)・{formatDate(latest.date)}時点</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{latest.spotPrice.toLocaleString()}円/g</p>

        <div className="mt-4 rounded-xl bg-accent-soft/60 p-3">
          <p className="text-sm text-muted">
            {formatDate(latest.nearestTargetDate)}限月の先物が織り込む予想価格
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-xl font-semibold tabular-nums">{latest.nearestPrice.toLocaleString()}円/g</p>
            <span
              className={`text-sm font-medium tabular-nums ${
                impliedDiff >= 0 ? "text-accent-strong" : "text-foreground/70"
              }`}
            >
              ({impliedDiff >= 0 ? "+" : ""}
              {impliedDiff.toLocaleString()}円 / {impliedDiff >= 0 ? "+" : ""}
              {impliedPct.toFixed(1)}%)
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          先物価格は市場参加者が織り込んでいる将来の受渡価格の目安であり、当サイト独自の予想ではありません。
          必ずその通りになるわけではなく、投資助言でもありません。
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <p className="mb-3 font-semibold">予想と実際の答え合わせ</p>
        {resolved.length === 0 ? (
          <p className="text-sm text-muted">
            まだ限月日を迎えた予想がありません。データが貯まり次第、ここに答え合わせの記録が表示されます。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="pb-2 pr-3 font-medium">限月日</th>
                  <th className="pb-2 pr-3 font-medium">予想(先物価格)</th>
                  <th className="pb-2 pr-3 font-medium">実際(その日の価格)</th>
                  <th className="pb-2 font-medium">差</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map((r) => (
                  <tr key={r.targetDate} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3 tabular-nums">{r.targetDate}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.predictedPrice.toLocaleString()}円</td>
                    <td className="py-2 pr-3 tabular-nums">{r.actualPrice.toLocaleString()}円</td>
                    <td
                      className={`py-2 tabular-nums font-medium ${
                        r.diff >= 0 ? "text-accent-strong" : "text-foreground/70"
                      }`}
                    >
                      {r.diff >= 0 ? "+" : ""}
                      {r.diff.toLocaleString()}円 ({r.diff >= 0 ? "+" : ""}
                      {r.diffPct.toFixed(1)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
