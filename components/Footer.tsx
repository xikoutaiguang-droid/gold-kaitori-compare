import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      {/* 下端に固定された MobileTabBar(sm未満で表示)がこのフッターに被るため、
          バーの高さぶんの余白を最後の要素であるフッターに持たせる。
          main 側に付けても、フッターはその外側にあるので効かない。
          ホームバーのある端末では safe-area-inset-bottom のぶんだけバーも下に伸びる。 */}
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] text-xs leading-relaxed text-muted sm:pb-6">
        <p>
          掲載している買取価格・信頼度スコアは各社公式サイト等の公開情報をもとにした参考値です。
          実際の査定額を保証するものではなく、品物の状態・重量・純度・相場変動により変わります。
          最終的な金額は各社にご確認のうえご判断ください。
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4">
          <Link href="/company" className="hover:text-accent hover:underline">
            買取店一覧
          </Link>
          <Link href="/about" className="hover:text-accent hover:underline">
            このサイトについて
          </Link>
          <Link href="/column" className="hover:text-accent hover:underline">
            コラム
          </Link>
          <Link href="/guide/tax" className="hover:text-accent hover:underline">
            売却時の税金について
          </Link>
          <Link href="/privacy" className="hover:text-accent hover:underline">
            プライバシーポリシー
          </Link>
        </p>
      </div>
    </footer>
  );
}
