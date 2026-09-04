interface Point {
  date: string;
  value: number;
}

const WIDTH = 600;
const HEIGHT = 220;
const PAD_X = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

export default function TrendChart({ points, unit = "円/g" }: { points: Point[]; unit?: string }) {
  if (points.length < 2) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-lg bg-accent-soft/40 text-center text-sm text-muted">
        データが1日分しかまだありません。
        <br />
        明日以降、ここに推移グラフが表示されます。
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const plotW = WIDTH - PAD_X * 2;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const coords = points.map((p, i) => {
    const x = PAD_X + (i / (points.length - 1)) * plotW;
    const y = PAD_TOP + (1 - (p.value - min) / range) * plotH;
    return { x, y, ...p };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${PAD_TOP + plotH} L${coords[0].x.toFixed(1)},${PAD_TOP + plotH} Z`;

  const first = points[0];
  const last = points[points.length - 1];
  const diff = last.value - first.value;
  const diffPct = (diff / first.value) * 100;

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="価格推移グラフ">
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#trend-fill)" />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c) => (
          <circle key={c.date} cx={c.x} cy={c.y} r={c === coords[coords.length - 1] ? 4 : 2} fill="var(--accent)" />
        ))}
        <text x={PAD_X} y={HEIGHT - 8} fontSize="11" fill="var(--color-muted)">
          {first.date}
        </text>
        <text x={WIDTH - PAD_X} y={HEIGHT - 8} fontSize="11" fill="var(--color-muted)" textAnchor="end">
          {last.date}
        </text>
      </svg>
      <div className="mt-2 flex items-baseline justify-between text-sm">
        <span className="text-muted">
          期間: {first.value.toLocaleString()}〜{max.toLocaleString()}
          {unit}(最安{min.toLocaleString()})
        </span>
        <span className={`font-semibold tabular-nums ${diff >= 0 ? "text-accent-strong" : "text-foreground"}`}>
          {diff >= 0 ? "+" : ""}
          {Math.round(diff).toLocaleString()}
          {unit} ({diff >= 0 ? "+" : ""}
          {diffPct.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}
