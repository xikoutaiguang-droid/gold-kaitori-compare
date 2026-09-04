import type { Metadata } from "next";
import { getCompanies } from "@/lib/companies";
import DiagnosisForm from "@/components/DiagnosisForm";
import TrustBadges from "@/components/TrustBadges";

export const metadata: Metadata = {
  title: "買取店診断｜重視するポイントで選ぶ金・貴金属買取店",
  description:
    "「大手に任せたい」「とにかく高価買取」「安心して売りたい」など、あなたが重視するポイントを選ぶだけで、条件に合う金・貴金属買取店をおすすめ順に診断します。価格比較だけでは分からない、自分に合った買取店の選び方がわかります。",
  alternates: { canonical: "/finder" },
};

const points = [
  {
    title: "価格だけでなく「選び方」から探せる",
    body: "多くの比較サイトは価格の一覧だけですが、このツールは「大手の安心感」「とにかく高値」「信頼度」など、人によって違う重視ポイントから逆引きで買取店を探せます。",
  },
  {
    title: "複数条件を組み合わせられる",
    body: "「高価買取」と「安心」のように複数の条件を同時に選ぶと、両方のバランスが良い会社を優先して表示します。",
  },
];

export default function FinderPage() {
  const companies = getCompanies();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">あなたに合う買取店診断</h1>
      <p className="mb-6 text-base text-muted">
        売る時に何を重視するかを選ぶと、条件に合う買取店をおすすめ順で表示します。
      </p>
      <TrustBadges
        items={["選んだ内容は保存・送信されず、その場で結果を計算するだけです", "会員登録なしで診断結果を見られます"]}
      />
      <DiagnosisForm companies={companies} />

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-4 text-lg font-semibold">この診断でできること</h2>
        <div className="flex flex-col gap-5">
          {points.map((p) => (
            <div key={p.title}>
              <p className="font-medium">{p.title}</p>
              <p className="mt-1 text-sm text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
