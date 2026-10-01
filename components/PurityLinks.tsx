import Link from "next/link";
import { PURITY_PAGES } from "@/lib/purityPages";

/**
 * 純度別ページへのリンク。
 *
 * /compare の純度セレクタはクライアント側の切り替えなので、検索結果には
 * 「K18の価格ページ」として出ない。検索されているのは純度を含む言い方
 * (Search Console の上位にも「24金相場 1g 今日 コメ兵」が入っている)なので、
 * 純度ごとに入口を作って、そこへ行けるようにする。
 *
 * @param exclude 今いるページのslug。自分自身へのリンクは出さない
 */
export default function PurityLinks({ exclude }: { exclude?: string }) {
  const pages = PURITY_PAGES.filter((p) => p.slug !== exclude);
  return (
    <div className="flex flex-wrap gap-2">
      {pages.map((p) => (
        <Link
          key={p.slug}
          href={`/price/${p.slug}`}
          className="rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground/80 transition hover:border-accent/40 hover:bg-accent-soft"
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
