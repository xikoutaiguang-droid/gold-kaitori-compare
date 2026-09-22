import { getMarketStatus } from "@/lib/marketDay";

function jaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[2])}月${Number(m[3])}日` : iso;
}

/**
 * 市場が止まっている間に順位を見ている人への断り書き。
 * 順位そのものを隠すのではなく、いま何を見ているのかを添える。
 */
export default function MarketClosedNotice() {
  const s = getMarketStatus();
  if (!s || !s.stale) return null;

  return (
    <p className="mb-4 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs leading-relaxed text-muted">
      <span className="font-medium text-foreground/80">
        現在、金の取引市場は動いていません（基準となる建値は{jaDate(s.referenceDate)}時点）。
      </span>
      市場が止まっている間、多くの店は価格を据え置きますが、
      週明けの変動に備えてあらかじめ下げる店もあります。そのため順位が平常時と入れ替わることがあります。
      急ぎでなければ、市場が開いてからもう一度ご確認ください。
    </p>
  );
}
