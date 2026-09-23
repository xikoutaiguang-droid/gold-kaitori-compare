import raw from "@/data/campaigns.json";

/**
 * 買取金額の増額キャンペーン。
 *
 * 単価の差が数%を争っているのに対し、キャンペーンは数十%を動かす。それを載せていない
 * 比較表は、いちばん大きい要素を抜いたまま順位を出していることになる。
 *
 * ただしキャンペーンは価格以上に腐りやすい。期限があるうえ、各社の注意書きには
 * 「予告なく終了する場合がございます」と書かれている。日次で自動取得している価格と違い、
 * これは人が各社のページを見て転記したものなので、確認が止まればそのまま古くなる。
 * なので「載せない」のではなく「古くなったら自動的に消える」ようにしている。
 */
/**
 * 企画の性質。「30名に抽選」と「全員に35%増額」を同じ言葉でまとめると、
 * 読む人が期待値を大きく取り違える。並べる以上は区別して出す。
 */
export type CampaignKind = "guaranteed" | "coupon" | "lottery";

export const CAMPAIGN_KIND_LABEL: Record<CampaignKind, string> = {
  guaranteed: "条件を満たせば全員",
  coupon: "クーポンの提示が必要",
  lottery: "抽選",
};

/**
 * 適用範囲。当サイトの読者は金を重さで売る人なので、ブランド品限定の企画を
 * 同じ欄に並べると「自分の指輪も10%上がる」と読まれる。分けて出すために持つ。
 */
export type CampaignScope = "gold" | "brand";

export const CAMPAIGN_SCOPE_LABEL: Record<CampaignScope, string> = {
  gold: "金・貴金属が対象",
  brand: "ブランド品が対象",
};

export interface Campaign {
  id: string;
  companyId: string;
  kind: CampaignKind;
  scope: CampaignScope;
  title: string;
  /** 内容の要約。転記元の文言を短くまとめたもの */
  summary: string;
  startsAt: string | null;
  endsAt: string;
  sourceUrl: string;
  /** 当サイトが最後に各社のページで内容を確かめた日 */
  verifiedAt: string;
  conditions: string[];
}

/**
 * これより長く確認が途絶えたキャンペーンは、期限内であっても表示しない。
 * 「予告なく終了する場合がございます」と各社が明記している以上、
 * 2週間前に見たきりのものを「実施中」と言うことはできない。
 */
export const CAMPAIGN_MAX_VERIFY_AGE_DAYS = 14;

function parseDate(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

function todayUtc(): number {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

export interface ActiveCampaign extends Campaign {
  /** 終了日まであと何日か(当日なら0) */
  daysLeft: number;
  /** 最終確認から何日経ったか */
  verifiedDaysAgo: number;
}

/** 期限内で、かつ確認が新しいキャンペーンだけを返す */
export function getActiveCampaigns(): ActiveCampaign[] {
  const today = todayUtc();
  return (raw.campaigns as Campaign[])
    .map((c) => {
      const ends = parseDate(c.endsAt);
      const verified = parseDate(c.verifiedAt);
      if (ends === null || verified === null) return null;
      return {
        ...c,
        daysLeft: Math.round((ends - today) / 86400000),
        verifiedDaysAgo: Math.round((today - verified) / 86400000),
      };
    })
    .filter((c): c is ActiveCampaign => c !== null)
    .filter((c) => c.daysLeft >= 0 && c.verifiedDaysAgo <= CAMPAIGN_MAX_VERIFY_AGE_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function getCampaignsForCompany(companyId: string): ActiveCampaign[] {
  return getActiveCampaigns().filter((c) => c.companyId === companyId);
}

/** 金・貴金属に効くものだけ。価格比較の文脈で出すのはこちら */
export function getGoldCampaigns(): ActiveCampaign[] {
  return getActiveCampaigns().filter((c) => c.scope === "gold");
}

export function getBrandCampaigns(): ActiveCampaign[] {
  return getActiveCampaigns().filter((c) => c.scope === "brand");
}

/** キャンペーンを確認できている会社のID(表示の有無を分けるため) */
export function getCompanyIdsWithCampaign(): Set<string> {
  return new Set(getActiveCampaigns().map((c) => c.companyId));
}

/** 点検用。期限切れ・確認切れを含む全件を、状態つきで返す */
export function auditCampaigns(): {
  id: string;
  companyId: string;
  endsAt: string;
  verifiedAt: string;
  state: "active" | "expired" | "unverified";
}[] {
  const today = todayUtc();
  return (raw.campaigns as Campaign[]).map((c) => {
    const ends = parseDate(c.endsAt);
    const verified = parseDate(c.verifiedAt);
    const expired = ends === null || ends < today;
    const unverified =
      verified === null || Math.round((today - verified) / 86400000) > CAMPAIGN_MAX_VERIFY_AGE_DAYS;
    return {
      id: c.id,
      companyId: c.companyId,
      endsAt: c.endsAt,
      verifiedAt: c.verifiedAt,
      state: expired ? "expired" : unverified ? "unverified" : "active",
    };
  });
}
