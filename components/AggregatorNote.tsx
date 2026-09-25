"use client";

import { availableAggregators } from "@/lib/aggregators";
import { trackOutboundClick } from "@/lib/analytics";

/**
 * 計算結果のあとに置く、一括査定への導線。
 *
 * 順位そのものには混ぜない。上に出した順位は公表単価だけで決めたもので、
 * ここは「掲載していない店にも聞きたい場合の別の手段」として並べる。
 * 提携が未承認のあいだは AGGREGATORS の url が空なので、何も描画しない。
 *
 * @param unlistedCount 価格を公表していないため順位に入れられなかった社数
 */
export default function AggregatorNote({
  unlistedCount,
  source,
}: {
  unlistedCount: number;
  source: string;
}) {
  const items = availableAggregators();
  if (!items.length) return null;

  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-semibold">掲載していない店にも聞きたいとき</h3>
        <span className="inline-flex shrink-0 items-center rounded border border-border px-1 py-0.5 text-[10px] font-medium text-muted">
          PR
        </span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-foreground/80">
        上の順位は、各社が公式サイトで公表している1gあたりの単価だけで決めています。
        {unlistedCount > 0 && (
          <>当サイトの掲載社でも{unlistedCount}社は単価を公表しておらず、順位に入れられていません。</>
        )}
        近所の店や、当サイトが追っていない店の金額は分かりません。まとめて聞きたい場合はこちらがあります。
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((a) => (
          <li key={a.id}>
            <a
              href={a.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() =>
                trackOutboundClick({ shopId: a.id, shopName: a.name, hasAffiliate: true, source })
              }
              className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-accent/40 hover:bg-accent-soft/30"
            >
              <span>
                {a.name}で一括査定を申し込む
                <span className="mt-0.5 block text-xs font-normal text-muted">{a.summary}</span>
              </span>
              <span aria-hidden className="text-muted">
                ›
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        当サイトは一括査定の結果を測っていないため、上の順位より高くなるとも安くなるとも言えません。
        広告として掲載しており、申し込みがあると当サイトに報酬が入ります。
        {items.map((a) => a.operator).join("・")}が提供するサービスで、査定や契約は各社と直接行っていただきます。
      </p>
    </section>
  );
}
