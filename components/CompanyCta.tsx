"use client";

import PrBadge from "@/components/PrBadge";
import { trackOutboundClick } from "@/lib/analytics";
import { getOutboundUrl, hasAffiliateLink } from "@/lib/outboundLink";
import type { Company } from "@/lib/types";

/**
 * 会社ページの上部に置く、公式サイトへの導線。
 *
 * これまで公式への出口はページの下だけにあった。実測すると、全長3,359pxの
 * コメ兵のページで2,502px(75%スクロールした先)。今日の価格を見に来た人は
 * その手前で離れる。価格のすぐ下に置く。
 *
 * 提携の有無で見た目を変えるのは PR の表示だけ。提携している社だけを目立たせると、
 * 順位とは別の基準で店を推していることになる。
 */
export default function CompanyCta({ company, source }: { company: Company; source: string }) {
  const isAffiliate = hasAffiliateLink(company);

  return (
    <a
      href={getOutboundUrl(company)}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      onClick={() =>
        trackOutboundClick({
          shopId: company.id,
          shopName: company.name,
          hasAffiliate: isAffiliate,
          source,
        })
      }
      className="mb-6 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-sm font-medium transition active:scale-[0.99] sm:hover:border-accent sm:hover:bg-accent-soft"
    >
      <span className="break-keep [overflow-wrap:anywhere]">
        {company.name}の公式サイトで今日の価格を見る
      </span>
      {isAffiliate && <PrBadge />}
    </a>
  );
}
