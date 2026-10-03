"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// コラムはこれまでフッターからの1本でしか辿れなかった。12本あって、
// 検索で各社ページの次に表示されているのもコラムなのに、入口が無かった。
// 読みものなので並びの最後に置く。
const links = [
  { href: "/compare", label: "相場比較" },
  { href: "/simulator", label: "シミュレーター" },
  { href: "/finder", label: "お店診断" },
  // 「近くの買取店」から縮めた。6本にすると768pxで22pxしか余らず、
  // フォントの差で溢れる余地があったため。意味は変わらない。
  { href: "/nearby", label: "近くの店" },
  { href: "/trend", label: "今が売り時？" },
  { href: "/column", label: "コラム" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:py-4">
        {/* shrink-0 が無いと、ナビを縮まないようにした途端こちらが折れて
            「金買取相場/比較」と2行になる。文字を大きくするのは lg 以上にして、
            768pxではロゴ側も少し控えめにして6本ぶんの幅を空ける。 */}
        <Link
          href="/"
          className="font-serif-jp shrink-0 whitespace-nowrap text-lg font-semibold tracking-wide lg:text-xl"
        >
          金買取相場比較
        </Link>
        {/* 640pxでは入らない。6本にするとロゴ121 + ナビ561 + 余白32 = 714px 必要で、
            5本のときですら640pxちょうどで余白が無かった。切替点を768pxに上げ、
            それ未満は下のタブバーに任せる(MobileTabBar も md:hidden に合わせてある)。 */}
        <nav className="hidden gap-1.5 text-sm md:flex lg:gap-2">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                // 768pxちょうどだと6本で余裕が15pxしか無い。狭いほうだけ詰めて、
                // lg以上は従来の見た目に戻す。
                // whitespace-nowrap が無いと、幅が足りないときに縮まず折り返して
                // 「相場比/較」のように2行になる。縮んだ結果 scrollWidth も小さく出るので、
                // 測っても入っているように見えてしまう。折り返さないと決めてから測る。
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 font-medium transition lg:px-4 ${
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border text-foreground/80 hover:border-accent/40 hover:bg-accent-soft"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
