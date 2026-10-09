"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PriceHistory } from "@/lib/priceHistory";
import { priceChangeSince, type TrackedPurity } from "@/lib/sinceLastVisit";

/**
 * 相場がどれだけ動いたかの1行。
 *
 * 2回目以降に来た人には「前回見た日から」の差を出す。初めての人には「1週間前から」を出す。
 *
 * なぜ前回からの差なのか:
 * 買取店のサイトは自社の今日の価格しか出せない。日々の記録を持っているのはこちら側なので、
 * 「あなたが前に見たときからいくら動いたか」はこのサイトにしか出せない。
 * 金を売る人は売る前に何度も相場を見るので、戻ってくる理由になる。
 * 登録もメールも要らず、端末の中だけで完結する。
 *
 * 出しているのは掲載社の公表価格の平均(相場)で、特定の1社の価格ではない。
 * 各社ページにも置くので、その社の価格が動いた話だと読まれないよう「掲載社の平均」と書く。
 */
const LAST_SEEN_KEY = "gold-kaitori-compare:last-seen-date";
const PREV_VISIT_KEY = "gold-kaitori-compare:prev-visit-date";

/** 1行に出す純度。多いと読み飛ばされるので、売られる量が多い2つに絞る */
const SHOWN: TrackedPurity[] = ["k24", "k18"];

function jaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[2])}月${Number(m[3])}日` : iso;
}

function signed(n: number): string {
  return `${n > 0 ? "+" : ""}${n.toLocaleString("ja-JP")}`;
}

export default function MarketChange({ history }: { history: PriceHistory }) {
  const [prevVisit, setPrevVisit] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      if (lastSeen && lastSeen !== today) {
        // 日付が変わった = 今回が「次の訪問」。前回の日付を取っておく
        localStorage.setItem(PREV_VISIT_KEY, lastSeen);
      }
      localStorage.setItem(LAST_SEEN_KEY, today);
      const prev = localStorage.getItem(PREV_VISIT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorageはSSR時に読めないため初回マウント後に反映する
      if (prev && prev !== today) setPrevVisit(prev);
    } catch {
      // localStorageが使えないときは、初めての人と同じ扱いにする
    }
  }, []);

  const personal = prevVisit
    ? SHOWN.map((p) => priceChangeSince(history, p, prevVisit)).filter((c) => c !== null && c.diff !== 0)
    : [];

  if (personal.length > 0) {
    return (
      <p className="mb-8 text-sm leading-relaxed text-muted sm:mb-10">
        前回ご覧になった{jaDate(prevVisit as string)}から、掲載社の平均は
        {personal.map((c, i) => (
          <span key={c!.purity}>
            {i > 0 && "、"}
            {c!.purity === "k24" ? "K24" : "K18"}が
            <span
              className={`font-semibold tabular-nums ${
                c!.diff > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/80"
              }`}
            >
              {signed(c!.diff)}円/g
            </span>
          </span>
        ))}
        。
        <Link href="/trend" className="ml-1 underline underline-offset-2">
          推移を見る
        </Link>
      </p>
    );
  }

  // 初めての人、または前回から動きが無い人には、期間を決めた差を出す
  const weekly = weeklyChange(history);
  if (!weekly) return null;
  return (
    <p className="mb-8 text-sm leading-relaxed text-muted sm:mb-10">
      掲載社のK24平均は、1週間前（{jaDate(weekly.since)}）より
      <span
        className={`font-semibold tabular-nums ${
          weekly.diff > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/80"
        }`}
      >
        {signed(weekly.diff)}円/g
      </span>
      です。
      <Link href="/trend" className="ml-1 underline underline-offset-2">
        推移を見る
      </Link>
    </p>
  );
}

/**
 * 7日前との差。前日比にしないのは、土日祝は市場が動かず数字が出ないため。
 * 記録が7日ぶん貯まるまでは何も出さない。
 */
const DAYS = 7;

function weeklyChange(history: PriceHistory): { since: string; diff: number } | null {
  const entries = history.entries;
  if (entries.length <= DAYS) return null;
  const latest = entries[entries.length - 1];
  const past = entries[entries.length - 1 - DAYS];
  const now = latest.prices.k24;
  const then = past.prices.k24;
  if (now === undefined || then === undefined) return null;
  const diff = now - then;
  if (diff === 0) return null;
  return { since: past.date, diff };
}
