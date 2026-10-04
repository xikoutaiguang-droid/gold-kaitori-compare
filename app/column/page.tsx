import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COLUMNS } from "@/lib/columns";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/structuredData";
import { SITE_NAME } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "金・貴金属買取コラム",
  description: "金・貴金属を売る前に知っておきたいことを、やさしい言葉でまとめたコラム一覧。見分け方・査定のコツ・相場の仕組み・遺品整理の心構えなど。",
  alternates: { canonical: "/column" },
};


export default function ColumnIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd
        data={[
          collectionJsonLd(
            "/column",
            metadata,
            COLUMNS.map((c) => ({ name: c.title, path: c.href, description: c.desc })),
          ),
          breadcrumbJsonLd([
            { name: SITE_NAME, path: "/" },
            { name: "コラム", path: "/column" },
          ]),
        ]}
      />
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">金・貴金属買取コラム</h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        金・貴金属を売る前に知っておくと安心できることを、専門用語をできるだけ使わずにまとめました。
      </p>
      <ul className="flex flex-col gap-3">
        {COLUMNS.map((c, i) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition active:scale-[0.99] sm:hover:border-accent/40 sm:hover:shadow-md"
            >
              {/* 記事と同じ画像(共有されたときに出るもの)をそのまま使う。
                  一覧専用の画像を別に作ると、見出しを直したときに片方だけ古くなる。
                  i < 2 だけ先に読む。残りは画面に入ってから。 */}
              <Image
                src={`${c.href}/opengraph-image`}
                alt=""
                width={1200}
                height={630}
                priority={i < 2}
                loading={i < 2 ? undefined : "lazy"}
                sizes="(max-width: 768px) 100vw, 672px"
                className="h-auto w-full border-b border-border"
              />
              <div className="p-4 sm:p-5">
                <p className="font-semibold">{c.title}</p>
                <p className="mt-1 text-sm text-muted">{c.desc}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
