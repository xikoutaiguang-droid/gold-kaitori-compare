import Link from "next/link";
import { OPERATOR_NAME } from "@/lib/siteConfig";

export default function OperatorMessage() {
  return (
    <div className="mb-8 flex gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:mb-10 sm:p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
        <CatIcon />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted">サイト運営者・{OPERATOR_NAME}(アラフィフ・猫好き)</p>
        <p className="mt-1 text-base leading-relaxed text-foreground/90">
          はじめまして、このサイトを運営している{OPERATOR_NAME}です。数年前、祖母の遺品整理で指輪やネックレスを
          手放したとき、お店によって査定額がこんなに違うのかと驚いたことがこのサイトを作るきっかけになりました。金・貴金属を
          売る前に、まずは相場を知って安心して比較検討していただきたいという思いで運営しています。特定の買取店の
          味方をすることなく、公表されている情報をそのままお伝えすることを大切にしています。
        </p>
        <Link href="/about" className="mt-2 inline-block text-sm font-semibold text-accent-strong hover:underline">
          運営者について詳しく →
        </Link>
      </div>
    </div>
  );
}

// 自宅で飼っている猫、という設定に合わせた、丸みのある親しみやすい家猫のアイコン。
function CatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M6 9 4.5 4.5 8.5 7a8 8 0 0 1 7 0l4-2.5L18 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 9c-1.2 1.1-2 2.8-2 4.7C4 17.7 7.6 21 12 21s8-3.3 8-7.3c0-1.9-.8-3.6-2-4.7-1.5 1-3.6 1.6-6 1.6s-4.5-.6-6-1.6Z"
        strokeLinejoin="round"
      />
      <circle cx="9.3" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11 16.2c.3.4.7.4 1 0" strokeLinecap="round" />
      <path d="M4.5 15h2M17.5 15h2M5 17l2-.6M19 17l-2-.6" strokeLinecap="round" />
    </svg>
  );
}
