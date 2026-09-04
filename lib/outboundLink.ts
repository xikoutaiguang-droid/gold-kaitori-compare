import type { Company } from "@/lib/types";

/**
 * 買取店への遷移先URL。アフィリエイトプログラムの承認が下りて affiliateUrl が
 * 設定されている会社はそちらを使い、未承認の会社は officialUrl のままにする
 * (存在しないアフィリエイトリンクを捏造しないため)。
 */
export function getOutboundUrl(company: Company): string {
  return company.affiliateUrl || company.officialUrl;
}

export function hasAffiliateLink(company: Company): boolean {
  return Boolean(company.affiliateUrl);
}
