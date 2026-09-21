import type { Company } from "@/lib/types";

/**
 * 買取店への遷移先URL(単一)。1つのリンクしか置けない場所(ランキングカード等)向け。
 *
 * 複数登録されている場合、primary の印が付いた1件を代表とする。印が無ければ先頭。
 * 配列の並び順だけで代表を決めていると、店側の都合で並べ替えたときに黙って
 * 行き先が変わる。コメ兵が実際にそうで、先頭が宅配買取だったため、店頭査定に
 * 行きたい人まで宅配へ送っていた。
 *
 * 未承認の会社は officialUrl のままにする(存在しないアフィリエイトリンクを捏造しないため)。
 */
export function getOutboundUrl(company: Company): string {
  const links = company.affiliateLinks;
  if (!links?.length) return company.officialUrl;
  return (links.find((l) => l.primary) ?? links[0]).url;
}

export function hasAffiliateLink(company: Company): boolean {
  return Boolean(company.affiliateLinks?.length);
}

/**
 * 会社に登録されているアフィリエイトリンク一覧(未登録なら空配列)。複数導線を出し分けたい場所向け。
 * 代表リンクを先頭に寄せるので、一覧で最初に目に入るものと、
 * 単一リンクの場所の行き先が食い違わない。
 */
export function getAffiliateLinks(company: Company): { label: string; url: string; primary?: boolean }[] {
  const links = company.affiliateLinks ?? [];
  return [...links].sort((a, b) => Number(Boolean(b.primary)) - Number(Boolean(a.primary)));
}
