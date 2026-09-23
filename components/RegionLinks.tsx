import Link from "next/link";
import { REGION_PAGES } from "@/lib/regionPages";

/**
 * 地域ページへのリンク。
 *
 * 「自分の地域の店だけ見たい」は実際によくある入口なのに、9つの地域ページへは
 * /compare の下部から1本ずつしかリンクが無く、関東・近畿・北海道・四国は
 * Google にインデックスすらされていなかった(検出はされているがクロールされない)。
 * 読む人の導線としても、クロールの入口としても、1本では細すぎる。
 *
 * @param exclude 今いる地域ページのslug。自分自身へのリンクは出さない
 */
export default function RegionLinks({ exclude }: { exclude?: string }) {
  const regions = REGION_PAGES.filter((r) => r.slug !== exclude);
  return (
    <div className="flex flex-wrap gap-2">
      {regions.map((r) => (
        <Link
          key={r.slug}
          href={`/compare/${r.slug}`}
          className="rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground/80 transition hover:border-accent/40 hover:bg-accent-soft"
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}
