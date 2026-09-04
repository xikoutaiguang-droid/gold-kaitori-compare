import Link from "next/link";

const DEFAULT_ITEMS = ["会員登録・個人情報の入力なしで使えます", "特定の買取店の運営ではない独立した比較サイトです"];

export default function TrustBadges({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  return (
    <div className="mb-8 rounded-2xl border border-accent/30 bg-accent-soft/60 p-4 sm:mb-10 sm:p-5">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((text) => (
          <div key={text} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <CheckIcon />
            </span>
            <span className="text-base font-medium text-foreground">{text}</span>
          </div>
        ))}
      </div>
      <Link
        href="/about"
        className="mt-3 inline-block text-sm font-semibold text-accent-strong hover:underline"
      >
        運営方針・データの集め方を見る →
      </Link>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
