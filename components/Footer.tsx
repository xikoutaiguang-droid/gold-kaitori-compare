import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs leading-relaxed text-muted">
        <p>
          掲載している買取価格・信頼度スコアは各社公式サイト等の公開情報をもとにした参考値です。
          実際の査定額を保証するものではなく、品物の状態・重量・純度・相場変動により変わります。
          最終的な金額は各社にご確認のうえご判断ください。
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4">
          <Link href="/about" className="hover:text-accent hover:underline">
            このサイトについて
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
