import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Shippori_Mincho } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import { SITE_NAME, SITE_URL, ADSENSE_PUBLISHER_ID } from "@/lib/siteConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 見出しに使う上品な明朝体。「コンシェルジュ」的な高級感のトーンを出すために採用。
const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  weight: ["500", "600", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}｜金・貴金属買取の相場比較とシミュレーター`,
    template: `%s｜${SITE_NAME}`,
  },
  description:
    "おたからや・買取大吉・ジュエルカフェなど主要な金・貴金属買取店の相場を1gあたりで比較。重さを入力するだけの買取額シミュレーターと、重視するポイントから選べる買取店診断つき。",
  keywords: ["金買取", "貴金属買取", "金 買取 相場", "金 買取 シミュレーター", "金 買取 計算", "買取店 診断"],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title: `${SITE_NAME}｜金・貴金属買取の相場比較とシミュレーター`,
    description: "主要な金・貴金属買取店の相場を比較し、重さから概算買取額を計算できるサイト",
  },
  // AdSense審査時のサイト所有権確認用(パブリッシャーID未設定のうちは出力しない)
  other: ADSENSE_PUBLISHER_ID ? { "google-adsense-account": `ca-${ADSENSE_PUBLISHER_ID}` } : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${shipporiMincho.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Nav />
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
        <Footer />
        <MobileTabBar />
      </body>
    </html>
  );
}
