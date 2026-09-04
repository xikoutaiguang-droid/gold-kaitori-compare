export default function ReferenceDiff({ value, referenceValue }: { value: number; referenceValue: number }) {
  const diff = value - referenceValue;
  const pct = (diff / referenceValue) * 100;
  const sign = diff > 0 ? "+" : "";
  const color = diff >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-muted";

  return (
    <span className={`text-xs ${color}`}>
      田中貴金属比: {sign}
      {diff.toLocaleString()}円 ({sign}
      {pct.toFixed(1)}%)
    </span>
  );
}
