"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/compare", label: "相場比較" },
  { href: "/simulator", label: "シミュレーター" },
  { href: "/finder", label: "お店診断" },
  { href: "/nearby", label: "近くの買取店" },
  { href: "/trend", label: "今が売り時？" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:py-4">
        <Link href="/" className="font-serif-jp text-lg font-semibold tracking-wide sm:text-xl">
          金買取相場比較
        </Link>
        <nav className="hidden gap-2 text-sm sm:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full border px-4 py-1.5 font-medium transition ${
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
