import Image from "next/image";
import Link from "next/link";
import { OPERATOR_NAME } from "@/lib/siteConfig";

export default function OperatorMessage() {
  return (
    <div className="mb-8 flex gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:mb-10 sm:p-5">
      <Image
        src="/operator-avatar.jpg"
        alt={`${OPERATOR_NAME}のアイコン`}
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
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
