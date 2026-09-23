import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCompanies } from "@/lib/companies";
import RankingCard from "@/components/RankingCard";
import TrustBadges from "@/components/TrustBadges";
import MarketClosedNotice from "@/components/MarketClosedNotice";
import WeeklyChange from "@/components/WeeklyChange";
import OperatorMessage from "@/components/OperatorMessage";
import RegionLinks from "@/components/RegionLinks";

/**
 * トップページの検索結果での見え方。
 *
 * 以前は layout の既定「金買取相場比較｜金・貴金属買取の相場比較とシミュレーター」を
 * そのまま使っていたが、Googleは頭の「金買取相場比較」しか表示していなかった。
 * サイト名と後半で「相場比較」が重複していて、後半を捨てられていたため。
 * そこでテンプレート(｜サイト名)を使わず absolute で指定する。検索結果には
 * すぐ上にドメイン名が出るので、限られた文字数をサイト名に使う理由がない。
 *
 * 説明文はスマホだと60字強で切られる。このサイトにしかない「順位と中央値との差」を
 * その中に収めたいので、他社の店名の羅列をやめて先頭に持ってきている。
 *
 * 社数は実データから数える。固定値にすると掲載社が増減したときに嘘になる。
 */
/**
 * 説明文の冒頭に出す買取店。知名度が高く、社名で検索されうる先を選んでいる。
 * 名前は固定で書かず、掲載データから引く。掲載から外れた社を説明文だけが
 * 名乗り続けることがないようにするため。
 */
const FEATURED_IDS = ["otakaraya", "kaitori-daikichi", "komehyo", "nanboya", "jewel-cafe"];

export function generateMetadata(): Metadata {
  const companies = getCompanies();
  const priced = companies.filter((c) => c.priceData.prices.k24 !== undefined).length;
  const featured = FEATURED_IDS.map((id) => companies.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c) && c!.priceData.prices.k24 !== undefined)
    .map((c) => c.name);

  const title = `金・プラチナ買取 今日の${priced}社の価格と順位`;
  const description =
    (featured.length ? `${featured.join("・")}など` : "") +
    `${priced}社の今日の買取価格を1gあたりで比較。` +
    `各社が何位か、中央値と何円違うかまで分かります。重さを入れるだけの概算計算つき。`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    // openGraph をここで指定すると、レイアウトで設定した og:image や siteName ごと
    // 置き換わって画像が消える(Next.js は openGraph を項目ごとには混ぜない)。
    // 指定しなければ、上の title / description から og:title / og:description が作られる。
  };
}

export default function Home() {
  const companies = getCompanies();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <div className="relative mb-8 overflow-hidden rounded-2xl sm:mb-10">
        <Image
          src="/hero-gold.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        <div className="relative px-5 py-10 sm:px-10 sm:py-14">
          <p className="mb-2 text-sm font-medium tracking-wide text-accent-soft">金・貴金属買取 相場比較サイト</p>
          <h1 className="font-serif-jp mb-3 text-2xl font-semibold leading-snug text-white sm:text-3xl">
            金・プラチナ 買取相場 一括比較
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/90">
            主要な買取店・貴金属専門店が公表している買取参考価格を1つのサイトで比較できます。
            重さを入力しての概算計算や、あなたが重視するポイントに合わせたおすすめ店の診断も可能です。
          </p>
        </div>
      </div>
      <TrustBadges />

      {/* 価格を先に出す。検索から来る人が求めているのは今日の数字で、
          誰が運営しているかはその後で足りる。あいさつはランキングの下に置く。 */}
      <MarketClosedNotice />

      <div className="mb-8 grid gap-4 sm:mb-10 sm:grid-cols-2">
        <RankingCard companies={companies} purity="k24" limit={5} />
        <RankingCard companies={companies} purity="k18" limit={5} />
        <RankingCard companies={companies} purity="pt850" limit={3} />
        <RankingCard companies={companies} purity="ag" limit={3} />
      </div>

      {/* 価格の直後に置く。順位より前に出すと、検索から来た人が求めている
          今日の数字が下がる。2日前にそれを測って直したばかり。 */}
      <WeeklyChange />

      <OperatorMessage />

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
        <NavCard
          href="/tools"
          title="計算ツール"
          desc="g・匁・オンス換算や純度別の含有量計算"
          icon={<ToolsIcon />}
        />
        <NavCard
          href="/column"
          title="コラム"
          desc="見分け方・査定のコツ・相場の仕組みなど"
          icon={<ColumnIcon />}
        />
      </div>

      {/* 地域ページへの入口。トップからの1本が、この9ページにとっては
          サイト内でいちばん強いリンクになる。 */}
      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-1 text-lg font-semibold">地域から探す</h2>
        <p className="mb-3 text-sm text-muted">
          その地域に店舗を出している会社だけを、同じ並びで比べられます。
        </p>
        <RegionLinks />
      </section>
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

function ToolsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v18M7 7h10M4 7l3 6a3 3 0 0 0 6 0l-3-6M14 7l3 6a3 3 0 0 0 6 0l-3-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ColumnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3h12a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2-3-2V4a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
    </svg>
  );
}
