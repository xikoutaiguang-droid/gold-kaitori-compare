"use client";

import { useState } from "react";

interface ResultItem {
  name: string;
  amount: number;
}

const SITE_NAME = "金買取相場比較";

function drawResultImage(contextLabel: string, results: ResultItem[]): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 160 + results.length * 64 + 60;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#b8860b";
  ctx.font = "600 14px sans-serif";
  ctx.fillText("金・貴金属買取 相場比較サイト", 40, 44);

  ctx.fillStyle = "#16181d";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText(SITE_NAME, 40, 84);

  ctx.fillStyle = "#6b7280";
  ctx.font = "18px sans-serif";
  ctx.fillText(`${contextLabel} の概算買取額`, 40, 118);

  let y = 170;
  results.forEach((r, i) => {
    ctx.fillStyle = "#16181d";
    ctx.font = "600 22px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${i + 1}. ${r.name}`, 40, y);

    ctx.fillStyle = "#b8860b";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`約${r.amount.toLocaleString()}円`, canvas.width - 40, y);
    ctx.textAlign = "left";

    y += 64;
  });

  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(40, y - 20);
  ctx.lineTo(canvas.width - 40, y - 20);
  ctx.stroke();

  ctx.fillStyle = "#9aa0aa";
  ctx.font = "13px sans-serif";
  ctx.fillText("各社公式サイトの公表価格をもとにした参考値です。実際の査定額を保証するものではありません。", 40, y + 8);

  return canvas.toDataURL("image/png");
}

export default function ShareResult({ contextLabel, results }: { contextLabel: string; results: ResultItem[] }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // スマホのブラウザ(特にiOSのChrome)は navigator.share 経由の画像保存が
  // 「写真に保存」ではなく「ファイル/ドライブ」の保存ダイアログになってしまい、
  // ブラウザによって挙動がバラつくことが実機検証で判明した。
  // そのため画像を直接<img>として表示し、長押し保存(iOS/Androidどちらでも
  // 共通して使える標準ジェスチャー)に統一する。
  const handleSaveImage = () => {
    setPreviewUrl(drawResultImage(contextLabel, results));
  };

  const handleLineShare = () => {
    const text = `${contextLabel}の概算買取額、1位は${results[0]?.name}で約${results[0]?.amount.toLocaleString()}円でした。`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=500,height=600");
  };

  if (results.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleLineShare}
          className="flex items-center gap-1.5 rounded-full bg-[#06C755] px-4 py-2 text-sm font-medium text-white transition active:scale-95"
        >
          <LineIcon />
          LINEで送る
        </button>
        <button
          onClick={handleSaveImage}
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition active:scale-95 hover:bg-accent-soft"
        >
          <ImageIcon />
          画像として保存
        </button>
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="max-w-sm" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="買取額の結果画像" className="w-full rounded-lg shadow-xl" />
            <p className="mt-3 text-center text-sm text-white">
              画像を長押しして「写真に追加」(Chromeでは「画像をダウンロード」)を選ぶと保存できます。
            </p>
            <button
              onClick={() => setPreviewUrl(null)}
              className="mx-auto mt-3 block rounded-full bg-white px-5 py-2 text-sm font-medium text-foreground"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 5.94 2 10.7c0 4.27 3.6 7.85 8.44 8.55.33.07.78.22.9.5.1.26.06.66.03.92l-.15.9c-.04.26-.2 1.03.9.56 1.1-.47 5.96-3.5 8.13-6 1.5-1.65 2.2-3.32 2.2-5.43C22.45 5.94 17.97 2 12 2Z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5-5-9 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
