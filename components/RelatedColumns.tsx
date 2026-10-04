import Link from "next/link";
import { relatedColumns, type ColumnContext } from "@/lib/relatedColumns";

/**
 * 価格を見ているページから、その続きになるコラムへの導線。
 *
 * 記事末尾の OtherColumns は全記事を並べるが、こちらは4本だけにする。
 * 価格ページの一番下に20本並べても、読む人は選べない。
 */
export default function RelatedColumns({
  context,
  heading = "あわせて読む",
}: {
  context: ColumnContext;
  heading?: string;
}) {
  const columns = relatedColumns(context);
  if (!columns.length) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="font-serif-jp mb-3 text-lg font-semibold">{heading}</h2>
      <ul className="flex flex-col gap-3">
        {columns.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block rounded-lg border border-border bg-surface p-3 transition hover:border-accent/40 hover:bg-accent-soft/30"
            >
              <span className="block text-sm font-medium">{c.title}</span>
              <span className="mt-0.5 block text-xs text-muted">{c.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
