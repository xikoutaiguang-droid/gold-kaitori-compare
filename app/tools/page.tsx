import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "金・貴金属の計算ツール一覧",
  description: "g・匁・オンスの単位換算、純度別の純金属含有量計算など、金・貴金属を扱うときに役立つ無料ツール集。",
  alternates: { canonical: "/tools" },
};

const tools = [
  {
    href: "/tools/weight-converter",
    title: "g・匁・オンス換算",
    desc: "グラム・匁(もんめ)・トロイオンス・kgを相互に変換",
    icon: <ScaleIcon />,
  },
  {
    href: "/tools/purity-calculator",
    title: "純度別 純金属含有量計算",
    desc: "K18・Pt900などの純度から、実際の純金属の重さを計算",
    icon: <DropletIcon />,
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">計算ツール一覧</h1>
      <p className="mb-8 text-base text-muted">
        金・貴金属を扱うときに役立つ、単位換算や含有量計算のツールです。会員登録不要・入力内容はサーバーに送信されません。
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl border border-border bg-surface p-4 shadow-sm transition active:scale-[0.98] sm:p-5 sm:hover:border-accent/40 sm:hover:shadow-md"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
              {t.icon}
            </div>
            <p className="font-semibold">{t.title}</p>
            <p className="mt-1 text-sm text-muted">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ScaleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v18M7 7h10M4 7l3 6a3 3 0 0 0 6 0l-3-6M14 7l3 6a3 3 0 0 0 6 0l-3-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
