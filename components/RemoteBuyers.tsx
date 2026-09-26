"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import PrBadge from "@/components/PrBadge";
import { trackOutboundClick } from "@/lib/analytics";
import type { RemoteOption } from "@/lib/services";

const INITIAL = 6;

/**
 * 「いつ読んだものか」の表示。社ごとに確認日が違ってくるので、
 * 代表1社の日付ではなく実際の範囲を出す。古い方を隠さない。
 */
function checkedLabel(options: RemoteOption[]): string {
  const dates = [...new Set(options.map((o) => o.checkedAt))].sort();
  const first = jpDate(dates[0]);
  const last = jpDate(dates[dates.length - 1]);
  return first === last ? first : `${first}〜${last}`;
}

function jpDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : iso;
}

/**
 * 表示する引用は、そのカードのボタンが申し込む方法のものにする。
 * 宅配の説明文を出しておいて出張のボタンを置くと、読んだ内容と行き先がずれる。
 * ボタンが方法を特定できない場合は、宅配→出張の順で確認できている方を出す。
 */
function quoteFor(o: RemoteOption): string | undefined {
  if (o.ctaService === "visit") return o.visit?.quote;
  if (o.ctaService === "shipping") return o.shipping?.quote;
  return o.shipping?.quote ?? o.visit?.quote;
}

/**
 * 近くに店舗が無い人向けの一覧。
 *
 * /nearby は「半径30km以内に該当する店舗が見つかりませんでした」で終わっていた。
 * 地方在住の人にとっては、そこが行き止まりになっていた。出張(家まで来る)か
 * 宅配(送る)なら売れるので、その方法を公式サイトで確認できた社を出す。
 *
 * 並びは公表単価の高い順。広告リンクがある社を上に寄せることはしない。
 * 単価を公表していない社は、0円扱いで最下位にするのではなく末尾に置き、
 * 「分からない」と書く。
 */
export default function RemoteBuyers({
  options,
  purityLabel,
  source,
  heading,
  lead,
}: {
  options: RemoteOption[];
  purityLabel: string;
  source: string;
  heading: string;
  /** 何を並べたものかの説明。場面ごとに違うので呼び出し側で書く */
  lead: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!options.length) return null;

  const shown = expanded ? options : options.slice(0, INITIAL);
  const rest = options.length - shown.length;
  const priced = options.filter((o) => o.price !== null).length;

  return (
    <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-2 text-sm font-semibold">{heading}</h3>
      <p className="mb-4 text-sm leading-relaxed text-foreground/80">
        {lead}
        並び順は{purityLabel}の公表単価が高い順({priced}
        社)で、広告の有無は順番に入れていません。
      </p>

      <ul className="flex flex-col gap-2.5">
        {shown.map((o) => (
          <li key={o.id} className="rounded-xl border border-border p-3">
            <div className="flex items-start gap-3">
              <CompanyLogo id={o.id} name={o.name} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="break-keep font-medium">{o.name}</span>
                  {o.isAffiliate && <PrBadge />}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  {o.price !== null ? (
                    <span className="font-semibold text-accent-strong">{o.price.toLocaleString()}円/g</span>
                  ) : (
                    <span className="text-muted">
                      {o.priceNote === "stale" ? "単価を取得できず" : `${purityLabel}の単価は非公表`}
                    </span>
                  )}
                  {o.visit && (
                    <span className="rounded border border-border px-1.5 py-0.5 text-muted">
                      出張{o.visit.area ? `・${o.visit.area}` : ""}
                    </span>
                  )}
                  {o.shipping && (
                    <span className="rounded border border-border px-1.5 py-0.5 text-muted">宅配</span>
                  )}
                  {o.storeCount === 0 && <span className="text-muted">実店舗なし</span>}
                </div>
                {quoteFor(o) && (
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">「{quoteFor(o)}」</p>
                )}
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 pl-11">
              <a
                href={o.ctaUrl}
                target="_blank"
                rel={o.isAffiliate ? "sponsored noopener noreferrer" : "noopener noreferrer"}
                onClick={() =>
                  trackOutboundClick({
                    shopId: o.id,
                    shopName: o.name,
                    hasAffiliate: o.isAffiliate,
                    source,
                  })
                }
                className="text-sm font-medium text-accent-strong hover:underline"
              >
                {o.ctaLabel} →
              </a>
              <Link href={`/company/${o.id}`} className="text-xs text-muted hover:underline">
                この店の詳細
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {rest > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-3 min-h-11 w-full rounded-lg border border-border text-sm font-medium transition hover:border-accent/40 hover:bg-accent-soft/30"
        >
          残り{rest}社も表示する
        </button>
      )}

      <p className="mt-3 text-xs leading-relaxed text-muted">
        出張の対応エリアは社ごとに違います。上に「全国」と書いていない社は、
        当サイトでは全国対応かどうかを確認できていません(対応していないという意味ではありません)。
        申し込む前に各社のサイトでお住まいの地域が対象か確認してください。
        引用は各社の公式サイトの記載で、読んだ日は{checkedLabel(options)}です。
        手数料の扱いは店によって違うので、
        <Link href="/column/fees" className="underline hover:no-underline">
          手数料の記事
        </Link>
        も合わせてご覧ください。PR表記のある社は広告として掲載しており、申し込みがあると当サイトに報酬が入ります。
      </p>
    </section>
  );
}
