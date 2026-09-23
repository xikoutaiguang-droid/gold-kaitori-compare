"use client";

import { useEffect, useState } from "react";
import type { Company, Purity } from "@/lib/types";
import type { PriceHistory } from "@/lib/priceHistory";
import { priceChangeSince } from "@/lib/sinceLastVisit";
import { PURITY_LABELS, GOLD_PURITIES, PLATINUM_PURITIES, SILVER_PURITIES } from "@/lib/types";
import { getOutboundUrl, hasAffiliateLink } from "@/lib/outboundLink";
import { trackOutboundClick } from "@/lib/analytics";
import CompanyLogo from "@/components/CompanyLogo";
import PriceBar from "@/components/PriceBar";
import CaveatNote from "@/components/CaveatNote";
import ShareResult from "@/components/ShareResult";
import PrBadge from "@/components/PrBadge";

const PURITY_OPTIONS: Purity[] = [...GOLD_PURITIES, ...PLATINUM_PURITIES, ...SILVER_PURITIES];
const STORAGE_KEY = "gold-kaitori-compare:multi-items";
/**
 * この端末で前回この画面を見た日。品物とは別に持つ。
 * 同じ日に何度開いても基準は動かさないので、「前回からの差」が読んでいる間に消えない。
 */
const LAST_SEEN_KEY = "gold-kaitori-compare:items-last-seen";

interface Item {
  id: string;
  name: string;
  weight: string;
  stoneWeight: string;
  purity: Purity;
}

/** 本文に混ぜる日付。ISO表記のままだと読みにくい */
function jaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[2])}月${Number(m[3])}日` : iso;
}

function newItem(): Item {
  return { id: crypto.randomUUID(), name: "", weight: "", stoneWeight: "", purity: "k18" };
}

export default function MultiItemCalculator({
  companies,
  history,
}: {
  companies: Company[];
  history: PriceHistory;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  // 初回マウント時にlocalStorageから復元する。SSRとの不一致を避けるため
  // マウント後にのみ読み込み、読み込み前は空リストのまま描画する。
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // localStorageはSSR時に存在しないため、マウント後の同期読み込みが必要。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // 読み込みに失敗しても空リストから始めれば良いだけなので無視する
    }
    // 前回この画面を見た日を読み、今日の日付で更新しておく。
    // 日付が変わったときだけ基準を進めるので、同じ日のうちは差が安定して見える。
    try {
      const today = new Date().toISOString().slice(0, 10);
      const prev = localStorage.getItem(LAST_SEEN_KEY);
      if (prev && prev < today) setLastSeen(prev);
      if (prev !== today) localStorage.setItem(LAST_SEEN_KEY, today);
    } catch {
      // 使えない環境では「前回」が出ないだけで、計算そのものには影響しない
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // 保存できなくても機能は継続できるため無視する(プライベートブラウジング等)
    }
  }, [items, loaded]);

  const addItem = () => setItems((prev) => [...prev, newItem()]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const availablePurities = PURITY_OPTIONS.filter((p) =>
    companies.some((c) => c.priceData.prices[p] !== undefined)
  );

  // 保存されている品物の純度について、前回この画面を見た日からの相場の動きを出す。
  // 買取店は自社の「今日」しか出せない。前回との差を出せるのは日次の記録がある側だけで、
  // これがこのサイトに戻ってくる理由になる。登録も通知も要らず端末の中で完結する。
  const changes = lastSeen
    ? [...new Set(items.map((i) => i.purity))]
        .map((p) => priceChangeSince(history, p, lastSeen))
        .filter((c): c is NonNullable<typeof c> => c !== null && c.diff !== 0)
    : [];

  const goldWeightOf = (item: Item) => {
    const w = Number(item.weight);
    const sw = Number(item.stoneWeight) || 0;
    if (!Number.isFinite(w) || w <= 0) return 0;
    return Math.max(0, w - sw);
  };

  // 品物ごとに、どの会社が一番高く買い取ってくれるかを個別に見せる。
  // 合計額に丸めてしまうと「この指輪はA社、このネックレスはB社が高い」といった
  // 使い分けが分からなくなるため、あえて合算しない設計にしている。
  const itemResults = items.map((item) => {
    const goldWeight = goldWeightOf(item);
    const ranked = companies
      .filter((c) => c.priceData.prices[item.purity] !== undefined && goldWeight > 0)
      .map((c) => ({ company: c, amount: (c.priceData.prices[item.purity] as number) * goldWeight }))
      .sort((a, b) => b.amount - a.amount);
    return { item, ranked };
  });

  return (
    <div>
      <div className="mb-4">
        <CaveatNote>
          ダイヤなどの石が付いたジュエリーは、多くの買取店で地金の重量から石の重量を差し引いて査定します。
          正確な石の重量が分からない場合、ここでの計算はあくまで概算になります。石を外して量れる場合は、その重さを
          「石の重さ」欄に入力してください。
        </CaveatNote>
      </div>

      {changes.length > 0 && (
        <div className="mb-4 rounded-2xl border border-accent/40 bg-accent-soft/30 p-4 text-sm">
          <p className="mb-2 font-medium">前回ご覧になったときからの相場の動き</p>
          <ul className="flex flex-col gap-1">
            {changes.map((c) => (
              <li key={c.purity} className="flex items-baseline justify-between gap-2">
                <span className="text-muted">
                  {PURITY_LABELS[c.purity]}
                  <span className="ml-2 text-xs">{jaDate(c.since)}比</span>
                </span>
                <span
                  className={`tabular-nums font-semibold ${
                    c.diff > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/80"
                  }`}
                >
                  {c.diff > 0 ? "+" : ""}
                  {c.diff.toLocaleString("ja-JP")}円/g
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            掲載各社の公表価格の平均です。特定の店の査定額ではなく、相場がどちらに動いたかの目安として
            ご覧ください。保存した品物はこの端末の中だけにあり、当サイトには送信されません。
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <input
                type="text"
                placeholder={`品物${index + 1}(例: 指輪)`}
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                className="min-h-9 flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-sm"
              />
              <button
                onClick={() => removeItem(item.id)}
                aria-label="この品物を削除"
                className="ml-2 shrink-0 rounded-full p-1.5 text-muted hover:bg-accent-soft hover:text-accent-strong"
              >
                <TrashIcon />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col text-xs text-muted">
                重さ(g)
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.1"
                  value={item.weight}
                  onChange={(e) => updateItem(item.id, { weight: e.target.value })}
                  className="mt-1 w-24 min-h-9 rounded-lg border border-border bg-background px-2.5 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col text-xs text-muted">
                石の重さ(g・任意)
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={item.stoneWeight}
                  onChange={(e) => updateItem(item.id, { stoneWeight: e.target.value })}
                  className="mt-1 w-28 min-h-9 rounded-lg border border-border bg-background px-2.5 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col text-xs text-muted">
                純度
                <select
                  value={item.purity}
                  onChange={(e) => updateItem(item.id, { purity: e.target.value as Purity })}
                  className="mt-1 min-h-9 rounded-lg border border-border bg-background px-2.5 py-1 text-sm"
                >
                  {availablePurities.map((p) => (
                    <option key={p} value={p}>
                      {PURITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-3 w-full rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-accent-strong hover:bg-accent-soft"
      >
        + 品物を追加
      </button>

      {items.length > 0 && (
        <div className="mt-8 flex flex-col gap-8">
          {itemResults.map(({ item, ranked }, itemIndex) => {
            const maxAmount = Math.max(1, ...ranked.map((r) => r.amount));
            return (
              <div key={item.id}>
                <h2 className="font-serif-jp mb-3 text-lg font-semibold">
                  {item.name || `品物${itemIndex + 1}`}
                  <span className="ml-2 text-sm font-normal text-muted">
                    {PURITY_LABELS[item.purity]}・{goldWeightOf(item)}g
                  </span>
                </h2>
                {ranked.length === 0 ? (
                  <p className="text-sm text-muted">重さを入力すると、この品物の概算額が計算されます。</p>
                ) : (
                  <>
                    <div className="mb-3">
                      <ShareResult
                        contextLabel={`${item.name || `品物${itemIndex + 1}`} ${PURITY_LABELS[item.purity]} ${goldWeightOf(item)}g`}
                        results={ranked.slice(0, 3).map((r) => ({ name: r.company.name, amount: Math.round(r.amount) }))}
                      />
                    </div>
                    <ul className="flex flex-col gap-2.5">
                    {ranked.map(({ company, amount }, i) => (
                      <li key={company.id}>
                        <a
                          href={getOutboundUrl(company)}
                          target="_blank"
                          rel="nofollow sponsored noopener"
                          onClick={() =>
                            trackOutboundClick({
                              shopId: company.id,
                              shopName: company.name,
                              hasAffiliate: hasAffiliateLink(company),
                              source: "multi-item-simulator",
                            })
                          }
                          className={`block rounded-xl border p-3.5 shadow-sm transition active:scale-[0.99] sm:hover:border-accent/50 sm:hover:shadow-md ${
                            i === 0 ? "border-accent/40 bg-accent-soft/60" : "border-border bg-surface"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 shrink-0 text-center text-xs text-muted">{i + 1}</span>
                            <CompanyLogo id={company.id} name={company.name} size={32} />
                            {/* 社名を truncate すると PRバッジと金額に挟まれて切れる。折り返させる。 */}
                            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 font-medium">
                              <span className="break-keep">{company.name}</span>
                              {hasAffiliateLink(company) && <PrBadge />}
                            </span>
                            <span className="shrink-0 text-lg font-semibold tabular-nums">
                              約{Math.round(amount).toLocaleString()}円
                            </span>
                          </div>
                          <div className="mt-2.5 pl-8">
                            <PriceBar value={amount} max={maxAmount} />
                          </div>
                        </a>
                      </li>
                    ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-muted">
        入力内容はこの端末のブラウザにのみ保存されます(他の人やデバイスと共有されません)。
      </p>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
