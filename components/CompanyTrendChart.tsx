import type { CompanySeries } from "@/lib/companyHistory";

/**
 * その店自身の買取単価の推移。
 *
 * なぜ要るか:
 * 「高山質店 金相場 1g 今日」のような検索で来る人が見たいのは今日の数字だが、
 * 次に出てくる疑問は「で、上がっているのか」である。各社の公式サイトは
 * 自社の今日の値しか載せないので、その店の推移を出せるのは日次で記録している
 * こちら側だけになる。掲載社に等しく付くので、特定の店を持ち上げることにもならない。
 *
 * 描き方で1つだけ譲れない点がある。**点を等間隔に並べない。**
 * 記録は日付が飛ぶ(店が休みの日は公表されず、取得に失敗した日も増えない)。
 * 等間隔に並べると、土日を挟んだ1回の動きが「毎日少しずつ動いた」ように見える。
 * 横の位置は日付そのもので決めて、空いた日は空いたまま見せる。
 *
 * 面(塗り)は付けない。0から積み上げた量ではなく、狭い範囲を上下している値なので、
 * 塗ると動きが実際より大きく見える。
 */

const WIDTH = 600;
const HEIGHT = 170;
const PAD_X = 10;
const PAD_TOP = 14;
const PAD_BOTTOM = 30;

const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");

function shortDate(iso: string) {
  const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[1])}/${Number(m[2])}` : iso;
}

export default function CompanyTrendChart({
  series,
  companyName,
  purityLabel,
}: {
  series: CompanySeries;
  companyName: string;
  purityLabel: string;
}) {
  const { points, first, last, high, low, diff, recorded, spanDays } = series;

  // 縦は値の幅に合わせる。ただし全く動いていない日が続くと range が 0 になるので下限を置く
  const range = Math.max(high.price - low.price, 1);
  const plotW = WIDTH - PAD_X * 2;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const t0 = new Date(first.date).getTime();
  const t1 = new Date(last.date).getTime();
  const spanMs = Math.max(t1 - t0, 1);

  const coords = points.map((p) => ({
    ...p,
    // 横は日付の位置。等間隔にはしない(記録の無い日を詰めて見せないため)
    x: PAD_X + ((new Date(p.date).getTime() - t0) / spanMs) * plotW,
    y: PAD_TOP + (1 - (p.price - low.price) / range) * plotH,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");

  const up = diff > 0;
  const flat = diff === 0;

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`${companyName}の${purityLabel}買取価格の推移。${shortDate(first.date)}の1gあたり${yen(first.price)}円から、${shortDate(last.date)}の${yen(last.price)}円まで、${recorded}日分の記録。`}
      >
        {/* 最高と最安の目安線。グラフの上下が何円なのかが読めないと、動きの大きさが分からない */}
        {[
          { y: PAD_TOP, label: `${yen(high.price)}円` },
          { y: PAD_TOP + plotH, label: `${yen(low.price)}円` },
        ].map((g) => (
          <g key={g.label}>
            <line
              x1={PAD_X}
              y1={g.y}
              x2={WIDTH - PAD_X}
              y2={g.y}
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text x={PAD_X} y={g.y - 4} fontSize="11" fill="var(--color-muted)">
              {g.label}
            </text>
          </g>
        ))}

        <path
          d={linePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((c, i) => (
          <circle
            key={c.date}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 4.5 : 2.5}
            fill="var(--accent)"
          />
        ))}

        <text x={PAD_X} y={HEIGHT - 8} fontSize="11" fill="var(--color-muted)">
          {shortDate(first.date)}
        </text>
        <text
          x={WIDTH - PAD_X}
          y={HEIGHT - 8}
          fontSize="11"
          fill="var(--color-muted)"
          textAnchor="end"
        >
          {shortDate(last.date)}
        </text>
      </svg>

      <p className="mt-2 text-sm leading-relaxed">
        {shortDate(first.date)}の{yen(first.price)}円/gから{yen(last.price)}円/gまで、
        <span
          className={`font-semibold tabular-nums ${
            up ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/80"
          }`}
        >
          {flat ? "変わらず" : `${up ? "+" : ""}${yen(diff)}円/g`}
        </span>
        。この間の最高は{yen(high.price)}円（{shortDate(high.date)}）、最安は{yen(low.price)}円（
        {shortDate(low.date)}）でした。
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        {companyName}が公表した{purityLabel}
        の1gあたりの価格を、当サイトが毎日取得して記録したものです。{spanDays}日間のうち
        {recorded}日分あります。抜けているのは店が価格を出さなかった日で、値が動かなかった日ではありません。点は記録のある日だけに置き、横の位置は日付どおりにしています。
      </p>
    </div>
  );
}
