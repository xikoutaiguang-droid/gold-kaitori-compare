"use client";

import { useEffect, useState } from "react";
import type { Company, Purity } from "@/lib/types";
import { PURITY_LABELS, GOLD_PURITIES, PLATINUM_PURITIES, SILVER_PURITIES } from "@/lib/types";
import { getOutboundUrl, hasAffiliateLink } from "@/lib/outboundLink";
import CompanyLogo from "@/components/CompanyLogo";
import PriceBar from "@/components/PriceBar";
import CaveatNote from "@/components/CaveatNote";
import ShareResult from "@/components/ShareResult";
import PrBadge from "@/components/PrBadge";

const PURITY_OPTIONS: Purity[] = [...GOLD_PURITIES, ...PLATINUM_PURITIES, ...SILVER_PURITIES];
const STORAGE_KEY = "gold-kaitori-compare:multi-items";

interface Item {
  id: string;
  name: string;
  weight: string;
  stoneWeight: string;
  purity: Purity;
}

function newItem(): Item {
  return { id: crypto.randomUUID(), name: "", weight: "", stoneWeight: "", purity: "k18" };
}

export default function MultiItemCalculator({ companies }: { companies: Company[] }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

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
                          className={`block rounded-xl border p-3.5 shadow-sm transition active:scale-[0.99] sm:hover:border-accent/50 sm:hover:shadow-md ${
                            i === 0 ? "border-accent/40 bg-accent-soft/60" : "border-border bg-surface"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 shrink-0 text-center text-xs text-muted">{i + 1}</span>
                            <CompanyLogo id={company.id} name={company.name} size={32} />
                            <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate font-medium">
                              <span className="truncate">{company.name}</span>
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
