import Link from "next/link";

/**
 * 売り方(店頭・出張・宅配)を行き来するための並び。
 *
 * もともと「サービスごとのタブにしては」という話から始まったもので、
 * 宅配の記事ができて3つそろったので置く。1つでも中身が無いうちは、
 * 押せない見出しを並べることになるので作らなかった。
 *
 * タブに見えるが実体は3つの別ページへのリンク。1ページの中で切り替えると
 * 検索結果には1つしか出ないが、「金 出張買取」「金 宅配買取」はそれぞれ
 * 別に検索されている。
 */
const METHODS = [
  { href: "/nearby", label: "店頭", note: "近くの店を探す" },
  { href: "/column/visit-purchase", label: "出張", note: "家まで来てもらう" },
  { href: "/column/mail-in-purchase", label: "宅配", note: "送って売る" },
];

export default function MethodTabs({ current }: { current: string }) {
  return (
    <nav className="mb-6 flex gap-2" aria-label="売り方から選ぶ">
      {METHODS.map((m) => {
        const active = m.href === current;
        return (
          <Link
            key={m.href}
            href={m.href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 rounded-xl border px-3 py-2 text-center transition ${
              active
                ? "border-accent bg-accent-soft/60 font-semibold"
                : "border-border text-foreground/80 hover:border-accent/40 hover:bg-accent-soft/30"
            }`}
          >
            <span className="block text-sm">{m.label}</span>
            <span className="mt-0.5 block text-[11px] text-muted">{m.note}</span>
          </Link>
        );
      })}
    </nav>
  );
}
