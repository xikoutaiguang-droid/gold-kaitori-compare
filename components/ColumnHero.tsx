import Image from "next/image";
import { COLUMNS } from "@/lib/columns";

/**
 * 記事の先頭に置く画像。
 *
 * 共有されたときに出る画像(app/column/*\/opengraph-image.tsx)をそのまま使う。
 * 画像を別に用意すると、見出しを直したときに片方だけ古い文言になるので、
 * 1つの出どころから両方に出す。見出しと同じ文字が入った画像なので、
 * 読み上げには出さない(alt="")。
 */
export default function ColumnHero({ href }: { href: string }) {
  const entry = COLUMNS.find((c) => c.href === href);
  if (!entry) {
    throw new Error(`components/ColumnHero.tsx: ${href} は lib/columns.ts にありません`);
  }

  return (
    <div className="mb-7 overflow-hidden rounded-2xl border border-border">
      <Image
        src={`${href}/opengraph-image`}
        alt=""
        width={1200}
        height={630}
        priority
        sizes="(max-width: 768px) 100vw, 672px"
        className="h-auto w-full"
      />
    </div>
  );
}
