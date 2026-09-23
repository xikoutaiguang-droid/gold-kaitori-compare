import type { Metadata } from "next";
import Link from "next/link";
import { COLUMNS } from "@/lib/columns";

export const metadata: Metadata = {
  title: "金・貴金属買取コラム",
  description: "金・貴金属を売る前に知っておきたいことを、やさしい言葉でまとめたコラム一覧。見分け方・査定のコツ・相場の仕組み・遺品整理の心構えなど。",
  alternates: { canonical: "/column" },
};


export default function ColumnIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">金・貴金属買取コラム</h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        金・貴金属を売る前に知っておくと安心できることを、専門用語をできるだけ使わずにまとめました。
      </p>
      <ul className="flex flex-col gap-3">
        {COLUMNS.map((c) => (
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
