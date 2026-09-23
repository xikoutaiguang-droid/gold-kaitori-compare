import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";

export const metadata: Metadata = {
  title: "査定額を上げるコツ｜売る前にできる準備まとめ",
  description:
    "金・貴金属の査定額は、ちょっとした準備で変わることがあります。相見積もりの重要性や、査定に出す前にできる準備をやさしくまとめました。",
  alternates: { canonical: "/column/multiple-quotes" },
};

const tips = [
  {
    title: "必ず複数の店で見積もりを取る",
    body: "同じ品物でも、査定額は店によって差があります。1軒目の金額をその場で受け入れず、まず何社かの見積もりを比べてみてください。「他社ではこの金額でした」と伝えると、最初に提示された金額から上乗せの提案が出てくることも少なくありません。すべての店で必ず上がるとは限りませんが、比較する価値は十分にあります。",
  },
  {
    title: "品物をきれいにしておく",
    body: "査定前に、柔らかい布で軽く汚れを拭き取っておくと、査定士が状態を確認しやすくなります。無理に自分で磨き直したり洗剤を使ったりする必要はなく、表面のほこりや皮脂汚れを落とす程度で十分です。",
  },
  {
    title: "付属品があれば一緒に持っていく",
    body: "箱・鑑定書・保証書などが残っていれば、査定の際に一緒に持参してください。ブランド品や宝石付きのジュエリーでは、付属品の有無で評価が変わることがあります。",
  },
  {
    title: "相場が上向きのタイミングを選ぶ",
    body: "金の買取価格は日々変動します。急ぎでなければ、相場の推移を見てから売るタイミングを考えるのも一つの方法です。",
  },
  {
    title: "まとめて査定に出す",
    body: "指輪1点だけより、複数点をまとめて持ち込んだ方が、査定士にとって1点あたりの対応コストが下がる分、色を付けてもらえることがあります。不要な貴金属が複数あるなら、まとめて査定に出すことも検討してみてください。",
  },
];

export default function MultipleQuotesColumnPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd("/column/multiple-quotes", metadata), columnBreadcrumb("/column/multiple-quotes", metadata)]} />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">査定額を上げるコツ</h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        金・貴金属の査定額は、売る側のちょっとした準備で変わることがあります。特別なテクニックではなく、
        誰でもできる基本的なポイントをまとめました。
      </p>

      <div className="flex flex-col gap-5 sm:gap-6">
        {tips.map((tip, i) => (
          <div key={tip.title} className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-strong">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{tip.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{tip.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/60 p-4 text-sm leading-relaxed text-foreground/80 sm:p-5">
        相見積もりは、電話や来店をしなくても、このサイトの
        <Link href="/compare" className="mx-1 font-semibold text-accent-strong hover:underline">
          買取相場比較
        </Link>
        や
        <Link href="/simulator" className="mx-1 font-semibold text-accent-strong hover:underline">
          買取額シミュレーター
        </Link>
        で各社の相場を一度に確認するところから始められます。
      </div>

      <p className="mt-8 text-sm">
        <Link href="/column" className="text-accent-strong hover:underline">
          ← コラム一覧に戻る
        </Link>
      </p>
      <OtherColumns current="/column/multiple-quotes" />
    </div>
  );
}
