import type { Metadata } from "next";
import NearbyFinder from "@/components/NearbyFinder";
import MethodTabs from "@/components/MethodTabs";
import TrustBadges from "@/components/TrustBadges";
import { getCompanies } from "@/lib/companies";
import RemoteBuyers from "@/components/RemoteBuyers";
import { remoteBuyers } from "@/lib/services";
import { PURITY_LABELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "あなたの近くの買取店を探す",
  description:
    "現在地から近い金・貴金属買取店をGoogleマップの情報をもとに検索します。見つかった店舗はGoogleマップで開いて道順を確認できます。",
  alternates: { canonical: "/nearby" },
};

export default function NearbyPage() {
  const remote = remoteBuyers("k24");
  const total = getCompanies().length;

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
    </div>
  );
}
