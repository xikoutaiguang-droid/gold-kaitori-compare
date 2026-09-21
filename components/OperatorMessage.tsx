import Image from "next/image";
import Link from "next/link";
import { OPERATOR_NAME } from "@/lib/siteConfig";

export default function OperatorMessage() {
  return (
    <div className="mb-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:mb-10 sm:flex-row sm:items-start sm:p-5">
      <Image
        src="/operator-avatar.jpg"
        alt={`${OPERATOR_NAME}のアイコン`}
        width={128}
        height={128}
        className="h-24 w-24 shrink-0 rounded-full object-cover sm:h-32 sm:w-32"
      />
      <div className="min-w-0 text-center sm:text-left">
        <p className="text-sm text-muted">サイト運営者・{OPERATOR_NAME}(買取の現場で店長を経験)</p>
        <p className="mt-1 text-base leading-relaxed text-foreground/90">
          このサイトを作っている{OPERATOR_NAME}です。買取の店舗で店長を務めた経験があり、今も業界にいます。
          カウンターの内側にいると、相場を知らないまま金額を受け取って帰っていく方を何度も見ます。
          その方が悪いのではなく、比べる材料がどこにも無いだけです。その材料を外に置いておきたくて、
          このサイトを作りました。掲載している会社の中には、私が関わったことのある会社も含まれます。
          だからこそ価格は各社の公表値をそのまま取得し、並び順は計算結果だけで決めて、
          私の判断で動かせない作りにしています。
        </p>
        <Link href="/about" className="mt-2 inline-block text-sm font-semibold text-accent-strong hover:underline">
          運営者について詳しく →
        </Link>
      </div>
    </div>
  );
}
