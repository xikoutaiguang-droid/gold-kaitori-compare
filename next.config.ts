import type { NextConfig } from "next";

/**
 * 本番の別名ドメイン(*.vercel.app)に来た人を、本来のドメインへ送る。
 *
 * なぜ要るか:
 * gold-kaitori-compare.vercel.app が、kin-hikaku.com と同じ中身を200で返していた。
 * canonical は本来のドメインを指していたが、それは「どちらを正とするか」の申告であって、
 * 複製を配るのをやめたことにはならない。
 *
 * 2026年10月12日、AdSense がこの別名ドメインを「有用性の低いコンテンツ」と判定した。
 * 中身は本家と同一なので、向こうから見れば複製サイトでしかない。
 * 検索側にとっても同じ内容が2つのホストにある状態で、良いことがない。
 *
 * プレビュー(VERCEL_ENV=preview)では転送しない。コミットごとのURLで確認できなくなるため。
 * 転送するのは本番デプロイだけで、そこに割り当てられる *.vercel.app が対象になる。
 */
const REDIRECT_PREVIEW_HOSTS = process.env.VERCEL_ENV === "production";

const nextConfig: NextConfig = {
  // スマホなど同一Wi-Fi上の別端末からnext devの開発サーバーに
  // アクセスすると、デフォルトではJS/HMRリソースがクロスオリジンとして
  // ブロックされ、画面は表示されるがボタン等が一切反応しなくなる。
  // 開発中の動作確認用に、ローカルネットワークからのアクセスを許可する。
  allowedDevOrigins: ["192.168.10.106"],

  async redirects() {
    if (!REDIRECT_PREVIEW_HOSTS) return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<vercelHost>.*\\.vercel\\.app)" }],
        destination: "https://kin-hikaku.com/:path*",
        // 恒久的な転送。別名のほうを検索結果に残さない
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
