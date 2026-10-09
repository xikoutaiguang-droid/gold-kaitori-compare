import { CAMPAIGN_KIND_LABEL, CAMPAIGN_SCOPE_LABEL, type ActiveCampaign } from "@/lib/campaigns";

function jaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : iso;
}

/**
 * 実施中のキャンペーン。
 *
 * 単価の順位より金額を動かしうるので目立たせるが、当サイトが自動で追えていない情報なので
 * 「いつ確認したか」を必ず一緒に出す。読んだ人が、当サイトの記載ではなく
 * リンク先の各社ページで確かめられるようにしておく。
 *
 * compact を付けると適用条件と確認日の注記を畳む。各社ページでは、この枠が
 * 価格表の手前で537px(ページ全体の13%)を占めていて、価格を見に来た人が
 * 細則をかき分けてから本題に着く形になっていた。畳むだけでHTMLには残る。
 * /campaign はキャンペーンそのものを読むページなので全部開いたままにする。
 */
export default function CampaignNotice({
  campaigns,
  compact = false,
}: {
  campaigns: ActiveCampaign[];
  compact?: boolean;
}) {
  if (!campaigns.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {campaigns.map((c) => (
        <div key={c.id} className="rounded-2xl border border-accent/40 bg-accent-soft/30 p-4 sm:p-5">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-strong px-2 py-0.5 text-xs font-semibold text-white">
              実施中
            </span>
            <span className="text-sm font-semibold">{c.title}</span>
            <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] text-muted">
              {CAMPAIGN_SCOPE_LABEL[c.scope]}
            </span>
            <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] text-muted">
              {CAMPAIGN_KIND_LABEL[c.kind]}
            </span>
            <span className="text-xs text-muted">
              {/* 各社の告知は本日を含めて数えていることが多い。同じ日を指しているのに
                  数字だけ1つずれると、リンク先と見比べた人には誤りに見える。
                  どちらの数え方かを書いて、ずれを起こさないようにする。 */}
              {jaDate(c.endsAt)}まで
              {c.daysLeft === 0 ? "（本日まで）" : `（本日を含め残り${c.daysLeft + 1}日）`}
            </span>
          </div>
          <p className={compact ? "text-sm leading-relaxed" : "mb-2 text-sm leading-relaxed"}>
            {c.summary}
          </p>
          {(() => {
            const details = (
              <>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-xs leading-relaxed text-muted">
                  {c.conditions.map((cond) => (
                    <li key={cond}>{cond}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  当サイトが{jaDate(c.verifiedAt)}に
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline underline-offset-2"
                  >
                    同社のページ
                  </a>{" "}
                  で確認した内容です
                  {c.verifiedDaysAgo > 0 ? `（${c.verifiedDaysAgo}日前）` : ""}。自動取得ではないため、その後に変更・終了している可能性があります。申し込む前に必ずリンク先でご確認ください。
                </p>
              </>
            );
            return compact ? (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-muted underline underline-offset-2 hover:text-accent">
                  適用条件{c.conditions.length}件と確認日を見る
                </summary>
                <div className="mt-2">{details}</div>
              </details>
            ) : (
              details
            );
          })()}
        </div>
      ))}
    </div>
  );
}
