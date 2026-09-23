import Link from "next/link";
import { COLUMNS } from "@/lib/columns";

/**
 * 記事の末尾に置く、他のコラムへの導線。
 *
 * 読み終えた人に次の1本を出す。あわせて、各記事への内部リンクが
 * 一覧ページからの1本だけという状態を解消する。
 *
 * @param current 今開いている記事のパス。自分自身は出さない
 */
export default function OtherColumns({ current }: { current: string }) {
  const others = COLUMNS.filter((c) => c.href !== current);
  if (!others.length) return null;
  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="font-serif-jp mb-3 text-lg font-semibold">ほかのコラム</h2>
      <ul className="flex flex-col gap-3">
        {others.map((c) => (
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
