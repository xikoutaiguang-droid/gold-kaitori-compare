"use client";

import { useState } from "react";
import type { DriverDay } from "@/lib/marketDrivers";

const INITIAL = 10;

const yen = (n: number) =>
  `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n)).toLocaleString("ja-JP")}`;

const day = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
};

/**
 * 日ごとの内訳。新しい日が上。
 *
 * 全部を最初から出すと、記録が増えるほど下の説明まで届かなくなる。
 * 最初の10日ぶんだけ出して、残りは押したときに出す。
 */
export default function DriverLog({ days }: { days: DriverDay[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!days.length) return null;

  const newestFirst = [...days].reverse();
  const shown = expanded ? newestFirst : newestFirst.slice(0, INITIAL);
  const rest = newestFirst.length - shown.length;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full table-fixed text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-accent bg-table-head text-left">
              <th className="w-12 px-2 py-2 font-medium">日付</th>
              <th className="px-2 py-2 text-right font-medium">前日比</th>
              <th className="px-2 py-2 text-right font-medium">為替分</th>
              <th className="px-2 py-2 text-right font-medium">残り</th>
              <th className="w-16 px-2 py-2 text-right font-medium">ドル円</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((d) => (
              <tr key={d.date} className="border-b border-border last:border-0 even:bg-table-stripe">
                <td className="px-2 py-2">{day(d.date)}</td>
                <td
                  className={`px-2 py-2 text-right font-medium tabular-nums ${
                    d.changeJpy > 0 ? "text-emerald-700 dark:text-emerald-400" : ""
                  }`}
                >
                  {yen(d.changeJpy)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-muted">{yen(d.fxPart)}</td>
                <td className="px-2 py-2 text-right tabular-nums text-muted">{yen(d.restPart)}</td>
                <td className="px-2 py-2 text-right tabular-nums text-muted">
                  {d.usdJpy.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rest > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium transition active:scale-[0.99] sm:hover:border-accent"
        >
          残り{rest}日ぶんも見る
        </button>
      )}
      <p className="mt-2 text-xs leading-relaxed text-muted">
        単位は円/g。「為替分」は、その日のドル円の動きだけで説明できる額です。
      </p>
    </>
  );
}
