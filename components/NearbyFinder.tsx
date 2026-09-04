"use client";

import { useState } from "react";
import CompanyLogo from "@/components/CompanyLogo";

interface NearbyResult {
  companyId: string;
  companyName: string;
  storeName: string;
  address: string;
  distanceKm: number;
  mapsUrl: string | null;
}

type Status = "idle" | "locating" | "loading" | "done" | "error";

export default function NearbyFinder() {
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<NearbyResult[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = () => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErrorMessage("お使いのブラウザは現在地の取得に対応していません。");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("loading");
        try {
          const res = await fetch("/api/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });
          if (!res.ok) throw new Error();
          const json = await res.json();
          setResults(json.results ?? []);
          setStatus("done");
        } catch {
          setStatus("error");
          setErrorMessage("検索中にエラーが発生しました。時間をおいて再度お試しください。");
        }
      },
      () => {
        setStatus("error");
        setErrorMessage("現在地を取得できませんでした。ブラウザの位置情報の許可設定をご確認ください。");
      }
    );
  };

  return (
    <div>
      <button
        onClick={handleSearch}
        disabled={status === "locating" || status === "loading"}
        className="w-full rounded-xl bg-accent px-4 py-3 text-center font-medium text-accent-foreground transition active:scale-[0.98] disabled:opacity-60"
      >
        {status === "locating"
          ? "現在地を取得中…"
          : status === "loading"
            ? "近くの買取店を検索中…"
            : "現在地から探す"}
      </button>
      <p className="mt-2 text-xs text-muted">
        ボタンを押すとブラウザが位置情報の利用許可を求めます。取得した位置情報はこの検索のためだけに使い、保存はしません。
      </p>

      {status === "error" && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}

      {status === "done" && (
        <div className="mt-6">
          {results.length === 0 ? (
            <p className="text-sm text-muted">半径30km以内に該当する店舗が見つかりませんでした。</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {results.map((r) => (
                <li key={r.companyId} className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <CompanyLogo id={r.companyId} name={r.companyName} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{r.storeName}</p>
                      <p className="truncate text-xs text-muted">{r.address}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-accent-strong">{r.distanceKm}km</span>
                  </div>
                  {r.mapsUrl && (
                    <div className="mt-2.5 pl-11">
                      <a
                        href={r.mapsUrl}
                        target="_blank"
                        rel="noopener"
                        className="text-sm font-medium text-accent-strong hover:underline"
                      >
                        Googleマップで開く →
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
