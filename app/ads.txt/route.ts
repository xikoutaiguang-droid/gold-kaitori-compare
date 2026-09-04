import { ADSENSE_PUBLISHER_ID } from "@/lib/siteConfig";

// AdSense審査・広告配信に必要なads.txt。パブリッシャーIDが未設定のうちは空文字を返す
// (中身のないads.txtは「広告枠を販売する権利者がまだ存在しない」正しい状態として扱われる)。
export async function GET() {
  const body = ADSENSE_PUBLISHER_ID
    ? `google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`
    : "";

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
