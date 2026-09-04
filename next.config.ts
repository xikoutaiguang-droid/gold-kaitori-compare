import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // スマホなど同一Wi-Fi上の別端末からnext devの開発サーバーに
  // アクセスすると、デフォルトではJS/HMRリソースがクロスオリジンとして
  // ブロックされ、画面は表示されるがボタン等が一切反応しなくなる。
  // 開発中の動作確認用に、ローカルネットワークからのアクセスを許可する。
  allowedDevOrigins: ["192.168.10.106"],
};

export default nextConfig;
