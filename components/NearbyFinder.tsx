"use client";

import { useState } from "react";
import CompanyLogo from "@/components/CompanyLogo";
import RemoteBuyers from "@/components/RemoteBuyers";
import type { RemoteOption } from "@/lib/services";

/**
 * 店舗が近くにあっても、これ以上離れていれば「持ち込み以外の方法」も出す。
 * 片道この距離を往復して1点売るのは、人によっては選ばない。
 */
const FAR_KM = 10;

const REMOTE_HEADING = "近くに店舗が無くても売れる店";

function remoteLead(count: number, total: number) {
  return (
    <>
      自宅まで来てもらう「出張」か、送って査定してもらう「宅配」に対応していると、
      各社の公式サイトで確認できた{count}社です。
      {count === total
        ? "当サイトの掲載店はすべて、どちらかの方法に対応していました。"
        : `当サイトの掲載${total}社のうち、この方法を確認できたのがこの${count}社です。`}
    </>
  );
}

interface NearbyResult {
  companyId: string;
  companyName: string;
  storeName: string;
  address: string;
  distanceKm: number;
  mapsUrl: string | null;
}

type Status = "idle" | "locating" | "loading" | "done" | "error";

export default function NearbyFinder({
  remote,
  purityLabel,
  totalCompanies,
}: {
  remote: RemoteOption[];
  purityLabel: string;
  totalCompanies: number;
}) {
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
      },
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

      {status === "error" && (
        <>
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          {/* 位置情報を出さない/出せない人も、ここで行き止まりにしない */}
          <RemoteBuyers
            options={remote}
            purityLabel={purityLabel}
            source="nearby_no_location"
            heading={REMOTE_HEADING}
            lead={remoteLead(remote.length, totalCompanies)}
          />
        </>
      )}

      {status === "done" && (
        <div className="mt-6">
          {results.length === 0 ? (
            <>
              <p className="text-sm text-muted">
                半径30km以内に該当する店舗が見つかりませんでした。店舗に持ち込む以外の方法なら売れます。
              </p>
              <RemoteBuyers
                options={remote}
                purityLabel={purityLabel}
                source="nearby_none"
                heading={REMOTE_HEADING}
                lead={remoteLead(remote.length, totalCompanies)}
              />
            </>
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
                    <span className="shrink-0 text-sm font-semibold text-accent-strong">
                      {r.distanceKm}km
                    </span>
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
          {results.length > 0 && Math.min(...results.map((r) => r.distanceKm)) >= FAR_KM && (
            <RemoteBuyers
              options={remote}
              purityLabel={purityLabel}
              source="nearby_far"
              heading={REMOTE_HEADING}
              lead={remoteLead(remote.length, totalCompanies)}
            />
          )}
        </div>
      )}
    </div>
  );
}
