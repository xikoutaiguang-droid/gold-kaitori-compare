import type { Company } from "@/lib/types";

/**
 * 買取店への遷移先URL(単一)。1つのリンクしか置けない場所(ランキングカード等)向け。
 * アフィリエイトリンクが複数登録されている場合は先頭の1件を代表として使う。
 * 未承認の会社は officialUrl のままにする(存在しないアフィリエイトリンクを捏造しないため)。
 */
export function getOutboundUrl(company: Company): string {
  return company.affiliateLinks?.[0]?.url || company.officialUrl;
}

export function hasAffiliateLink(company: Company): boolean {
  return Boolean(company.affiliateLinks?.length);
}

/** 会社に登録されているアフィリエイトリンク一覧(未登録なら空配列)。複数導線を出し分けたい場所向け。 */
export function getAffiliateLinks(company: Company): { label: string; url: string }[] {
  return company.affiliateLinks ?? [];
}
