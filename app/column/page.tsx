import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "金・貴金属買取コラム",
  description: "金・貴金属を売る前に知っておきたいことを、やさしい言葉でまとめたコラム一覧。見分け方・査定のコツ・相場の仕組み・遺品整理の心構えなど。",
  alternates: { canonical: "/column" },
};

const columns = [
  {
    href: "/column/karat-and-price",
    title: "K18は「金75%」。では値段も75%になるのか",
    desc: "刻印が示す含有率と、実際に払われている金額を各社の公表価格から比べました",
  },
  {
    href: "/column/what-a-gram-means",
    title: "「1gいくら」は、店ごとに同じ意味ではない",
    desc: "各社の注意書きまで読むと、同じ単価が指しているものが揃っていませんでした",
  },
  {
    href: "/column/price-gap",
    title: "同じ日に、同じ金を、各社はいくらで買うのか",
    desc: "当サイトが集めた各社の公表価格を実際に測り、得と損の大きさを比べました",
  },
  {
    href: "/column/plating-check",
    title: "メッキと金の簡単な見分け方",
    desc: "磁石を使った自宅でできる簡易チェックと、その限界について",
  },
  {
    href: "/column/multiple-quotes",
    title: "査定額を上げるコツ",
    desc: "相見積もりをはじめ、売る前にできる準備をまとめました",
  },
  {
    href: "/column/price-factors",
    title: "金相場はなぜ変動するのか",
    desc: "国際価格・為替・世界情勢との関係をやさしく解説",
  },
  {
    href: "/column/estate-cleanup",
    title: "遺品整理・生前整理で貴金属を手放すときの心構え",
    desc: "気持ちの整理から実務的な注意点まで",
  },
];

export default function ColumnIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">金・貴金属買取コラム</h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        金・貴金属を売る前に知っておくと安心できることを、専門用語をできるだけ使わずにまとめました。
      </p>
      <ul className="flex flex-col gap-3">
        {columns.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block rounded-2xl border border-border bg-surface p-4 shadow-sm transition active:scale-[0.99] sm:p-5 sm:hover:border-accent/40 sm:hover:shadow-md"
            >
              <p className="font-semibold">{c.title}</p>
              <p className="mt-1 text-sm text-muted">{c.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
