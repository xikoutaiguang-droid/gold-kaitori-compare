import type { Metadata } from "next";
import Link from "next/link";
import {
  getActiveCampaigns,
  getGoldCampaigns,
  getBrandCampaigns,
  CAMPAIGN_MAX_VERIFY_AGE_DAYS,
  type ActiveCampaign,
} from "@/lib/campaigns";
import { getCompanies } from "@/lib/companies";
import { getCompanyById } from "@/lib/companyPages";
import CampaignNotice from "@/components/CampaignNotice";
import CompanyLogo from "@/components/CompanyLogo";

export function generateMetadata(): Metadata {
  const n = getActiveCampaigns().length;
  return {
    title: "買取キャンペーンのまとめ",
    description:
      `金・貴金属の買取店が実施している増額キャンペーンやクーポンのうち、当サイトが各社のページで確認できたものをまとめています。` +
      (n ? `現在${n}社で確認しています。` : "") +
      `全員が対象のものと抽選のものを分けて載せています。`,
    alternates: { canonical: "/campaign" },
  };
}

/** 1件ぶんの表示。金向けとブランド向けで同じ形を使う */
function CampaignItem({ c }: { c: ActiveCampaign }) {
  const company = getCompanyById(c.companyId);
  if (!company) return null;
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <CompanyLogo id={company.id} name={company.name} size={28} />
        <Link href={`/company/${company.id}`} className="font-medium underline underline-offset-2">
          {company.name}
        </Link>
      </div>
      <CampaignNotice campaigns={[c]} />
    </section>
  );
}

export default function CampaignPage() {
  const campaigns = getActiveCampaigns();
  const gold = getGoldCampaigns();
  const brand = getBrandCampaigns();
  const total = getCompanies().length;
  const withCampaign = new Set(campaigns.map((c) => c.companyId)).size;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">買取キャンペーンのまとめ</h1>
      <p className="mb-6 text-base leading-relaxed text-muted">
        買取金額の増額やクーポンは、店ごとの単価の差より大きく手取りを動かすことがあります。
        当サイトが各社のページで確認できたものを、ここにまとめています。
      </p>

      {/* 何を見ているのかを先に書く。一覧は網羅ではない */}
      <div className="mb-8 rounded-2xl border border-border bg-surface-2/60 p-4 text-sm leading-relaxed text-muted sm:p-5">
        <p className="mb-2">
          <span className="font-medium text-foreground/80">
            掲載{total}社のうち、{withCampaign}社で実施を確認しています。
          </span>
          載っていない社が実施していないとは限りません。価格と違って自動では取得できず、
          各社のページを人が見て転記しているためです。
        </p>
        <p>
          各社の注意書きには「予告なく終了する場合がございます」と書かれていることが多く、
          当サイトの確認から{CAMPAIGN_MAX_VERIFY_AGE_DAYS}日を過ぎたものは自動的に表示から外れます。
          申し込む前に、必ずリンク先の各社ページでご確認ください。
        </p>
      </div>

      {campaigns.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
          現在、確認できている実施中のキャンペーンはありません。
          各社が随時入れ替えるため、しばらくしてからまたご覧ください。
        </p>
      ) : (
        <>
          {/* 金・貴金属に効くものを先に出す。当サイトに来る人が売ろうとしているのはこれ */}
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">金・貴金属を売る場合</h2>
          {gold.length === 0 ? (
            <p className="mb-8 rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
              現在、金・貴金属に適用されるものは確認できていません。
            </p>
          ) : (
            <div className="mb-10 flex flex-col gap-6">
              {gold.map((c) => (
                <CampaignItem key={c.id} c={c} />
              ))}
            </div>
          )}

          {brand.length > 0 && (
            <>
              <h2 className="font-serif-jp mb-2 text-lg font-semibold">ブランド品を売る場合</h2>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                こちらはブランド品が対象で、ノーブランドの金やスクラップには適用されないと
                考えられるものです。ブランドのジュエリーや時計は重さではなく品物として
                値が付くため、1gあたりの比較では測れません。該当する品物をお持ちの場合にご覧ください。
              </p>
              <div className="mb-10 flex flex-col gap-6">
                {brand.map((c) => (
                  <CampaignItem key={c.id} c={c} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <section className="mt-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">「増額」と書いてあっても中身は違います</h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          同じようにキャンペーンと呼ばれていても、条件を満たせば全員が受けられるものと、
          抽選で一部の人だけが受けられるものがあります。期待できる金額はまったく違うので、
          上の一覧では種別を分けて表示しています。
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-foreground/80">
          <li>
            <span className="font-medium">条件を満たせば全員</span>
            ：買取金額に対して決まった率や額が上乗せされるもの。上限額が決まっていることが多いので、
            高額の品物では率どおりにならない点に注意してください。
          </li>
          <li>
            <span className="font-medium">クーポンの提示が必要</span>
            ：受付時に提示を求められます。持っていくのを忘れると適用されません。
          </li>
          <li>
            <span className="font-medium">抽選</span>
            ：応募者全員ではなく、当選した人だけが対象です。売る前に見込む金額としては数えられません。
          </li>
        </ul>
      </section>

      <div className="mt-10 flex flex-col gap-2 text-sm">
        <Link href="/compare" className="underline underline-offset-2">
          今日の各社の買取価格を比べる
        </Link>
        <Link href="/column/what-a-gram-means" className="underline underline-offset-2">
          そもそも「1gいくら」が店ごとに同じ意味ではない、という話
        </Link>
      </div>
    </div>
  );
}
