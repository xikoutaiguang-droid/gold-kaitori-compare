import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { COLUMNS } from "@/lib/columns";
import { SITE_NAME } from "@/lib/siteConfig";

/**
 * 記事ごとのOGP画像をビルド時に作る。
 *
 * これまでは全ページが同じ1枚を共有していたので、どの記事を共有しても
 * 見た目が同じで、リンク先が何の記事なのかは文字リンクを読むしかなかった。
 *
 * 日本語を描くにはフォントの実体が要る。ビルド中にGoogle Fontsから取りに行く作り方が
 * 広く使われているが、それだと取得できなかった日にビルドごと落ちる(= 価格の更新が止まる)。
 * ここでは Noto Sans JP (SIL Open Font License) を、記事タイトルに出てくる文字と
 * かな・英数・記号だけに絞って同梱してある(assets/fonts/)。
 *
 * 絞ってあるぶん、新しい記事で新しい漢字を使うと豆腐(□)になる。黙って崩れるのは
 * 避けたいので、scripts/check-og-font.mjs が全タイトルの文字をフォントの収録範囲と
 * 突き合わせる。足りなければ、そこで作り直す。
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const FONT_PATH = path.join(process.cwd(), "assets", "fonts", "NotoSansJP-og.otf");

export function columnTitle(href: string): string {
  const entry = COLUMNS.find((c) => c.href === href);
  if (!entry) throw new Error(`lib/ogImage.tsx: ${href} は lib/columns.ts にありません`);
  return entry.title;
}

/**
 * 記事1本ぶんの画像。
 * 画面に出ている見出しをそのまま描く(別の文言を作らない)。
 */
export async function columnOgImage(href: string) {
  const title = columnTitle(href);
  const font = await readFile(FONT_PATH);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #1c1917 0%, #292524 55%, #3f3a34 100%)",
          color: "#faf9f7",
          fontFamily: "NotoSansJP",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, color: "#d6b56a" }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#d6b56a" }} />
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.35, letterSpacing: "0.01em" }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#b8b2a8" }}>
          kin-hikaku.com ／ コラム
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "NotoSansJP", data: font, style: "normal", weight: 700 }],
    },
  );
}
