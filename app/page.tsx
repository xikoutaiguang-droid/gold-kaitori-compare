import Link from "next/link";
import type { ReactNode } from "react";
import { getCompanies } from "@/lib/companies";
import RankingCard from "@/components/RankingCard";
import TrustBadges from "@/components/TrustBadges";
import OperatorMessage from "@/components/OperatorMessage";

export default function Home() {
  const companies = getCompanies();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <p className="mb-2 text-sm font-medium tracking-wide text-accent-strong">金・貴金属買取 相場比較サイト</p>
      <h1 className="font-serif-jp mb-3 text-2xl font-semibold leading-snug sm:text-3xl">
        金・プラチナ 買取相場 一括比較
      </h1>
      <p className="mb-4 max-w-2xl text-base leading-relaxed text-muted">
        主要な買取店・貴金属専門店が公表している買取参考価格を1つのサイトで比較できます。
        重さを入力しての概算計算や、あなたが重視するポイントに合わせたおすすめ店の診断も可能です。
      </p>
      <TrustBadges />
      <OperatorMessage />

      <div className="mb-8 grid gap-4 sm:mb-10 sm:grid-cols-2">
        <RankingCard companies={companies} purity="k24" limit={5} />
        <RankingCard companies={companies} purity="k18" limit={5} />
        <RankingCard companies={companies} purity="pt850" limit={3} />
        <RankingCard companies={companies} purity="ag" limit={3} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <NavCard
          href="/compare"
          title="相場比較"
          desc="純度・地域別に各社の価格を一覧比較"
          icon={<CompareIcon />}
        />
        <NavCard
          href="/simulator"
          title="シミュレーター"
          desc="重さを入れて概算買取額を計算"
          icon={<CalcIcon />}
        />
        <NavCard
          href="/finder"
          title="お店診断"
          desc="重視するポイントからおすすめ店を診断"
          icon={<FinderIcon />}
        />
        <NavCard
          href="/nearby"
          title="近くの買取店"
          desc="現在地から近い店舗を距離順に表示"
          icon={<NearbyIcon />}
        />
        <NavCard
          href="/trend"
          title="今が売り時？"
          desc="見始めてからの価格推移をグラフで確認"
          icon={<TrendIcon />}
        />
      </div>
    </div>
  );
}

function NavCard({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-surface p-4 shadow-sm transition active:scale-[0.98] sm:p-5 sm:hover:border-accent/40 sm:hover:shadow-md"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
        {icon}
      </div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{desc}</p>
    </Link>
  );
}

function CompareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" strokeLinecap="round" />
    </svg>
  );
}

function FinderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function NearbyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-6.05-7-11a7 7 0 0 1 14 0c0 4.95-7 11-7 11Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 16l5-5 4 4 7-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
