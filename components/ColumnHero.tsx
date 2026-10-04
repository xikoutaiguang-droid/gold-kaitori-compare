import { COLUMNS } from "@/lib/columns";

/**
 * 記事の先頭に置く画像。
 *
 * 共有されたときに出る画像(app/column/*\/opengraph-image.tsx)をそのまま使う。
 * 画像を別に用意すると、見出しを直したときに片方だけ古い文言になるので、
 * 1つの出どころから両方に出す。見出しと同じ文字が入った画像なので、
 * 読み上げには出さない(alt="")。
 *
 * next/image は使わない。あれは URL を /_next/image?url=... に変えるが、
 * 中身がルート(ファイルではない)だと Vercel 側でそのルートに直接振られ、
 * 変換も縮小もされないまま元のPNGが返ってくる。
 * 効いていないのに効いているように見える書き方は置かない。
 * 画像そのものを軽くする方向で対処している(背景を単色にして70KB→50KB)。
 */
export default function ColumnHero({ href }: { href: string }) {
  const entry = COLUMNS.find((c) => c.href === href);
  if (!entry) {
    throw new Error(`components/ColumnHero.tsx: ${href} は lib/columns.ts にありません`);
  }

  return (
    <div className="mb-7 overflow-hidden rounded-2xl border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${href}/opengraph-image`}
        alt=""
        width={1200}
        height={630}
        fetchPriority="high"
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}
