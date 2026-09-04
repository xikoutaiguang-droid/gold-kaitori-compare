import type { Metadata } from "next";
import NearbyFinder from "@/components/NearbyFinder";
import TrustBadges from "@/components/TrustBadges";

export const metadata: Metadata = {
  title: "あなたの近くの買取店を探す",
  description:
    "現在地から近い金・貴金属買取店をGoogleマップの情報をもとに検索します。見つかった店舗はGoogleマップで開いて道順を確認できます。",
  alternates: { canonical: "/nearby" },
};

export default function NearbyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">あなたの近くの買取店</h1>
      <p className="mb-6 text-base text-muted">
        現在地をもとに、比較対象の買取店の中から近い店舗を距離順に表示します。店舗名をタップするとGoogleマップで道順を確認できます。
      </p>
      <TrustBadges
        items={["取得した位置情報は保存されず、この検索のためだけに使われます", "位置情報を許可しなくても他の機能は通常どおり使えます"]}
      />
      <NearbyFinder />
    </div>
  );
}
