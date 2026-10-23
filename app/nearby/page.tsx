import type { Metadata } from "next";
import Link from "next/link";
import NearbyFinder from "@/components/NearbyFinder";
import MethodTabs from "@/components/MethodTabs";
import TrustBadges from "@/components/TrustBadges";
import { getCompanies, filterByRegion } from "@/lib/companies";
import RemoteBuyers from "@/components/RemoteBuyers";
import { remoteBuyers } from "@/lib/services";
import { PURITY_LABELS } from "@/lib/types";
import { REGION_PAGES } from "@/lib/regionPages";
import { measureSpread, getMeasuredOn } from "@/lib/spread";

export const metadata: Metadata = {
  title: "あなたの近くの買取店を探す",
  description:
    "現在地から近い金・貴金属買取店をGoogleマップの情報をもとに検索します。見つかった店舗はGoogleマップで開いて道順を確認できます。" +
    "位置情報を使わずに、地域ごとの対応社数から探すこともできます。",
  alternates: { canonical: "/nearby" },
};

export default function NearbyPage() {
  const remote = remoteBuyers("k24");
  const companies = getCompanies();
  const total = companies.length;
  // 位置情報を許可しない人にも、押す前から読めるものを出す。
  // 地域ごとの対応社数は既にデータから出せるので、検索の結果を待つ必要がない。
  const byRegion = REGION_PAGES.map((r) => ({
    ...r,
    count: filterByRegion(companies, r.region).length,
  }));
  const k24 = measureSpread("k24");
  const measuredOn = getMeasuredOn();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">あなたの近くの買取店</h1>
      <p className="mb-6 text-base text-muted">
        現在地をもとに、比較対象の買取店の中から近い店舗を距離順に表示します。店舗名をタップするとGoogleマップで道順を確認できます。
      </p>
      <MethodTabs current="/nearby" />
      <TrustBadges
        items={["取得した位置情報は保存されず、この検索のためだけに使われます", "位置情報を許可しなくても他の機能は通常どおり使えます"]}
      />
      <NearbyFinder />

      {/* 検索してからでないと何も出ないページだった。位置情報を許可しない人には
          ボタン1つしか無く、HTMLも460字しかなかった(サイト内で最も薄い)。
          出張・宅配の一覧はサーバー側に既にあるのだから、検索の前から出しておく。 */}
      <RemoteBuyers
        options={remote}
        purityLabel={PURITY_LABELS.k24}
        source="nearby_static"
        heading="店舗へ行かずに売れる店"
        lead={
          <>
            自宅まで来てもらう「出張」か、送って査定してもらう「宅配」に対応していると、各社の公式サイトで確認できた{remote.length}社です。
            {remote.length === total
              ? "当サイトの掲載店はすべて、どちらかの方法に対応していました。"
              : `当サイトの掲載${total}社のうち、この方法を確認できたのがこの${remote.length}社です。`}
          </>
        }
      />

      {/* ---- 位置情報を使わずに探す ---- */}
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">地域から探す</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          位置情報を許可しなくても、お住まいの地域に対応している社は分かります。掲載{total}
          社それぞれの対応地域から数えたものです。全国対応の社はどの地域にも含めています。
        </p>
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {byRegion.map((r) => (
            <Link
              key={r.slug}
              href={`/compare/${r.slug}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm transition active:scale-[0.98] sm:hover:border-accent/40"
            >
              <span className="font-medium">{r.label}</span>
              <span className="tabular-nums text-muted">{r.count}社</span>
            </Link>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-muted">
          この数は「対応していると各社が公表している地域」から数えたもので、お住まいの市区町村に店舗があることを意味するものではありません。実際に行ける店舗があるかは、上の検索か各社の店舗一覧でご確認ください。
        </p>
      </section>

      {/* ---- 近さと価格は別の話 ---- */}
      {k24 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">
            近い店を選ぶことと、高く売ることは別です
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">
            このページは距離順に並べますが、距離は価格を示していません。
            {measuredOn ? `${measuredOn}時点で` : "直近で"}K24（純金）の価格を公表していた
            {k24.count}社のうち、最も高いのは1gあたり{k24.high.price.toLocaleString("ja-JP")}円（
            {k24.high.name}）、最も低いのは{k24.low.price.toLocaleString("ja-JP")}円（{k24.low.name}
            ）でした。差は1gで{k24.range.toLocaleString("ja-JP")}円、10gのネックレス1本なら
            {(k24.range * 10).toLocaleString("ja-JP")}円の違いになります。
          </p>
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">
            交通費や時間をかけてでも遠い店に行くべきか、近くで済ませるかは、売る量によって答えが変わります。量が少なければ差額より移動のほうが大きくなることもあります。持ち込む前に
            <Link href="/simulator" className="underline underline-offset-2 hover:text-accent">
              シミュレーター
            </Link>
            でおおよその金額を出しておくと、わざわざ行く価値があるかを判断できます。
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            店ごとの差がどこから生まれるかは
            <Link
              href="/column/price-gap"
              className="underline underline-offset-2 hover:text-accent"
            >
              「同じ日に、同じ金を、各社はいくらで買うのか」
            </Link>
            に、まわる前にしておくことは
            <Link
              href="/column/multiple-quotes"
              className="underline underline-offset-2 hover:text-accent"
            >
              「金買取の相見積もり ― 売る前にできる5つの準備」
            </Link>
            にまとめています。
          </p>
        </section>
      )}
    </div>
  );
}
