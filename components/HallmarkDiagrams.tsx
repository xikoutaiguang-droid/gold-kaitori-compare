/**
 * 刻印の図。
 *
 * 画像ファイルではなくインラインSVGで描く。文字が拡大しても潰れず、
 * currentColor を使うので明暗どちらのテーマでも読める。
 * 図そのものが情報を持つので、読み上げ環境のために title を必ず付ける。
 */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Figure({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="rounded-2xl border border-border bg-surface p-4">
      <div className="text-foreground/80">{children}</div>
      <figcaption className="mt-2 text-xs leading-relaxed text-muted">
        <span className="font-medium text-foreground/80">{title}</span>
        <br />
        {caption}
      </figcaption>
    </figure>
  );
}

/** 指輪：刻印は内側 */
export function RingDiagram() {
  return (
    <Figure title="指輪" caption="内側（腕の部分の裏）に刻まれています。外からは見えないので、外して内周を一周見てください。">
      <svg viewBox="0 0 220 120" className="h-auto w-full max-w-[260px]" role="img" aria-label="指輪の内側に刻印がある位置を示した図">
        <title>指輪の刻印位置</title>
        {/* 外周と内周 */}
        <ellipse cx="70" cy="60" rx="44" ry="46" strokeWidth="2" {...stroke} />
        <ellipse cx="70" cy="60" rx="30" ry="33" strokeWidth="2" {...stroke} />
        {/* 内側の刻印 */}
        <rect x="55" y="80" width="30" height="13" rx="2" strokeWidth="1.4" {...stroke} />
        <text x="70" y="90" textAnchor="middle" fontSize="9" fill="currentColor">
          K18
        </text>
        {/* 引き出し線 */}
        <path d="M88 86 L128 86" strokeWidth="1.4" strokeDasharray="3 3" {...stroke} />
        <text x="134" y="83" fontSize="10" fill="currentColor">
          ここ
        </text>
        <text x="134" y="96" fontSize="9" fill="currentColor" opacity="0.7">
          内側の面
        </text>
      </svg>
    </Figure>
  );
}

/** ネックレス・ブレスレット：留め具の近く */
export function ClaspDiagram() {
  return (
    <Figure
      title="ネックレス・ブレスレット"
      caption="留め具の近くにある小さな板（プレート）か、留め具そのものに刻まれています。鎖の部分にはありません。"
    >
      <svg viewBox="0 0 220 120" className="h-auto w-full max-w-[260px]" role="img" aria-label="ネックレスの留め具付近に刻印がある位置を示した図">
        <title>ネックレスの刻印位置</title>
        {/* 鎖 */}
        <path d="M14 46 q26 -22 52 0 q26 22 52 0" strokeWidth="2" {...stroke} />
        {/* 留め具 */}
        <rect x="120" y="36" width="26" height="20" rx="5" strokeWidth="2" {...stroke} />
        {/* プレート */}
        <rect x="150" y="38" width="32" height="16" rx="2" strokeWidth="1.4" {...stroke} />
        <text x="166" y="50" textAnchor="middle" fontSize="9" fill="currentColor">
          750
        </text>
        <path d="M166 60 L166 80" strokeWidth="1.4" strokeDasharray="3 3" {...stroke} />
        <text x="166" y="94" textAnchor="middle" fontSize="10" fill="currentColor">
          ここ
        </text>
        <text x="166" y="107" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">
          留め具のそば
        </text>
      </svg>
    </Figure>
  );
}

/** ピアス・イヤリング：ポストや金具の裏 */
export function EarringDiagram() {
  return (
    <Figure
      title="ピアス・イヤリング"
      caption="細い軸（ポスト）か、留め具の裏側です。小さすぎて刻印がない製品もあります。"
    >
      <svg viewBox="0 0 220 120" className="h-auto w-full max-w-[260px]" role="img" aria-label="ピアスのポスト部分に刻印がある位置を示した図">
        <title>ピアスの刻印位置</title>
        <circle cx="56" cy="46" r="20" strokeWidth="2" {...stroke} />
        {/* ポスト */}
        <path d="M56 66 L56 96" strokeWidth="3" {...stroke} />
        <rect x="64" y="72" width="26" height="13" rx="2" strokeWidth="1.4" {...stroke} />
        <text x="77" y="82" textAnchor="middle" fontSize="8" fill="currentColor">
          K14
        </text>
        <path d="M94 79 L128 79" strokeWidth="1.4" strokeDasharray="3 3" {...stroke} />
        <text x="134" y="76" fontSize="10" fill="currentColor">
          ここ
        </text>
        <text x="134" y="89" fontSize="9" fill="currentColor" opacity="0.7">
          軸か留め具の裏
        </text>
      </svg>
    </Figure>
  );
}

/**
 * 刻印の種類の比較。
 * 造幣局のホールマークと、メーカーが自分で打つK表記は別物なので、並べて描く。
 */
export function StampTypesDiagram() {
  return (
    <figure className="rounded-2xl border border-border bg-surface p-4">
      <svg viewBox="0 0 300 150" className="h-auto w-full" role="img" aria-label="K18の刻印、750の刻印、造幣局のホールマークを並べて比べた図">
        <title>刻印の種類</title>

        {/* 1. K表記 */}
        <rect x="10" y="14" width="76" height="34" rx="3" strokeWidth="1.6" {...stroke} />
        <text x="48" y="37" textAnchor="middle" fontSize="17" fill="currentColor">
          K18
        </text>
        <text x="48" y="64" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.75">
          24分率
        </text>
        <text x="48" y="77" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.75">
          メーカー表示
        </text>

        {/* 2. 千分率 */}
        <rect x="112" y="14" width="76" height="34" rx="3" strokeWidth="1.6" {...stroke} />
        <text x="150" y="37" textAnchor="middle" fontSize="17" fill="currentColor">
          750
        </text>
        <text x="150" y="64" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.75">
          千分率
        </text>
        <text x="150" y="77" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.75">
          K18と同じ意味
        </text>

        {/* 3. 造幣局ホールマーク */}
        <rect x="214" y="14" width="76" height="34" rx="3" strokeWidth="1.6" {...stroke} />
        {/* 日の丸 */}
        <circle cx="234" cy="31" r="9" strokeWidth="1.4" {...stroke} />
        <circle cx="234" cy="31" r="4.5" fill="currentColor" />
        {/* ひし形＋数字 */}
        <path d="M264 18 L280 31 L264 44 L248 31 Z" strokeWidth="1.4" {...stroke} />
        <text x="264" y="35" textAnchor="middle" fontSize="9" fill="currentColor">
          750
        </text>
        <text x="252" y="64" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.75">
          造幣局の証明
        </text>
        <text x="252" y="77" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.75">
          日の丸＋ひし形
        </text>

        {/* 注意の行 */}
        <path d="M10 96 L290 96" strokeWidth="1" strokeDasharray="4 4" {...stroke} opacity="0.5" />
        <text x="10" y="116" fontSize="10" fill="currentColor">
          K18GP / K18GF は金そのものではありません
        </text>
        <text x="10" y="133" fontSize="9" fill="currentColor" opacity="0.75">
          GP＝メッキ、GF＝金張り。1文字違いで買取額が大きく変わります
        </text>
      </svg>
      <figcaption className="mt-2 text-xs leading-relaxed text-muted">
        <span className="font-medium text-foreground/80">刻印の種類</span>
        <br />
        造幣局のホールマークは日の丸とひし形の組み合わせで、K18のような表記とは別のものです。
      </figcaption>
    </figure>
  );
}
