import { getCompanies } from "@/lib/companies";
import rawCompanies from "@/data/companies.json";
import { getAffiliateLinks, hasAffiliateLink } from "@/lib/outboundLink";
import type { Company, Purity } from "@/lib/types";

/**
 * 各社が公式サイトで案内している買取方法。
 *
 * 近くに店舗が無い人には、単価の順位だけでは足りない。「家まで来てくれるのか」
 * 「送れるのか」が分からないと、1位の店に売れるのかどうかも判断できない。
 * /nearby は半径30km以内に店舗が無いと「見つかりませんでした」で終わっていて、
 * その人が次に何をすればいいのかを何も示していなかった。ここはそのための材料。
 *
 * 記録の決まり:
 * ・公式サイトを読んで確認できたものだけを書く。他社の比較サイトは根拠にしない
 * ・確認できなかった方法は、欄を作らない。「非対応」とは書かない。
 *   当サイトが見たページに書かれていなかっただけで、別のページにある可能性は残る
 * ・読んだ日を残す。店の案内は書き換えられる
 * ・出張の対応エリアは、公式が全国と書いている社だけ「全国」と書く。
 *   書いていない社は空にする(全国だと決めつけない)
 */
export interface ServiceEvidence {
  /** 公式サイトの記載そのまま。ナビゲーションの項目名しか確認できなかった場合は省く */
  quote?: string;
}

export interface VisitEvidence extends ServiceEvidence {
  /** 公式が明記している対応エリア。書いていなければ省く */
  area?: string;
}

export interface ServiceRecord {
  companyId: string;
  /** 上の記載を読んだページ */
  sourceUrl: string;
  checkedAt: string;
  /** 持ち込み */
  storefront?: ServiceEvidence;
  /** 自宅まで来る */
  visit?: VisitEvidence;
  /** 送る */
  shipping?: ServiceEvidence;
}

/**
 * 2026-09-25〜26に各社の公式サイトを読んで確認したもの。掲載25社すべてを見ている。
 * 一部の社は方法の案内がナビゲーションの項目名だけで、説明文を引用できなかった。
 * その場合は quote を付けずに、確認したページのURLだけを残している。
 */
export const SERVICE_RECORDS: ServiceRecord[] = [
  {
    companyId: "otakaraya",
    sourceUrl: "https://www.otakaraya.jp/",
    checkedAt: "2026-09-25",
    storefront: { quote: "お近くの店舗を探す" },
    visit: { quote: "プロの査定員がご自宅までお伺いいたします。" },
  },
  {
    companyId: "nanboya",
    sourceUrl: "https://nanboya.com/",
    checkedAt: "2026-09-25",
    storefront: { quote: "全国140店舗以上！" },
    visit: { quote: "最短当日訪問！玄関先で大量査定も承ります" },
    shipping: { quote: "梱包材・査定・キャンセルすべて無料です" },
  },
  {
    companyId: "komehyo",
    sourceUrl: "https://komehyo.jp/kaitori/gold/souba/",
    checkedAt: "2026-09-25",
    storefront: { quote: "1分で予約完了来店予約" },
    visit: { quote: "品物が多い方に出張買取" },
    shipping: { quote: "お時間がない方に宅配買取" },
  },
  {
    companyId: "kaitori-daikichi",
    sourceUrl: "https://www.kaitori-daikichi.jp/",
    checkedAt: "2026-09-25",
    storefront: {},
    visit: { quote: "査定無料 / 出張費無料 / 日本全国OK", area: "全国" },
  },
  {
    companyId: "e-daikoku",
    sourceUrl: "https://kaitori.e-daikoku.com/",
    checkedAt: "2026-09-25",
    storefront: { quote: "来店買取予約" },
    visit: { quote: "自宅へ査定員がお伺い出張買取" },
    shipping: {
      quote: "宅配キット・往復送料・査定料・振込手数料・キャンセル料すべて0円",
    },
  },
  {
    companyId: "jewel-cafe",
    sourceUrl: "https://www.jewel-cafe.jp/",
    checkedAt: "2026-09-25",
    storefront: {},
    visit: { quote: "ご自宅でらくらく出張買取" },
    shipping: { quote: "詰めて送るだけ！宅配買取" },
  },
  {
    companyId: "kaitori-elite",
    sourceUrl: "https://kaitori-off.net/",
    checkedAt: "2026-09-25",
    storefront: {},
    shipping: {},
  },
  {
    companyId: "kingram",
    sourceUrl: "https://kingram.jp/",
    checkedAt: "2026-09-25",
    storefront: {},
    visit: {
      quote: "お近くの店舗からご自宅にお伺い！家にいながら査定を受けられます。",
    },
    shipping: {
      quote: "宅配便にてお品物をお送りいただければ査定金額をお伝えいたします。",
    },
  },
  {
    companyId: "best-life",
    sourceUrl: "https://e-kaitori.jp/",
    checkedAt: "2026-09-25",
    storefront: {},
    visit: { quote: "出張による買取" },
    shipping: { quote: "宅配による買取" },
  },
  {
    companyId: "brand-revalue",
    sourceUrl: "https://brandrevalue.com/",
    checkedAt: "2026-09-25",
    storefront: { quote: "その場で査定、即現金払いが可能 店頭買取" },
    visit: {
      quote: "家で待つだけでらくらく高価買取 出張買取 日本全国対応！大量売却も大歓迎",
      area: "全国",
    },
    shipping: {
      quote: "品物を送るだけでかんたん高価買取 宅配買取 高額品も配送保険付きで安心",
    },
  },
  {
    companyId: "gem-sigma",
    sourceUrl: "https://gem-sigma.com/",
    checkedAt: "2026-09-25",
    storefront: {
      quote: "店頭買取は、プライバシーに配慮した個室査定ブースをご用意",
    },
    visit: { quote: "出張・宅配買取は全国どこでも対応可能です", area: "全国" },
    shipping: { quote: "出張・宅配買取は全国どこでも対応可能です" },
  },
  {
    companyId: "galleryrare",
    sourceUrl: "https://galleryrare.jp/",
    checkedAt: "2026-09-25",
    storefront: {
      quote: "常駐のバイヤーがその場ですぐ査定、すぐ買取・お支払。",
    },
    shipping: {
      quote: "近くに店舗がない方におすすめです。ネットからのお申込みで宅配買取に必要なキットを無料送付。",
    },
  },
  {
    companyId: "manekiya",
    sourceUrl: "https://manekiya.com/",
    checkedAt: "2026-09-25",
    storefront: {},
    visit: {},
    shipping: {},
  },
  {
    companyId: "takayama78",
    sourceUrl: "https://takayama78.co.jp/",
    checkedAt: "2026-09-25",
    storefront: { quote: "買取には店舗買取と出張買取の２種類があります。" },
    visit: { quote: "買取には店舗買取と出張買取の２種類があります。" },
  },
  {
    companyId: "goldmrs",
    sourceUrl: "https://goldmrs.jp/",
    checkedAt: "2026-09-25",
    storefront: {
      quote: "直接お品物を店頭にご持参頂ければ、その場で査定額をご提示致します。",
    },
    visit: {},
    shipping: {
      quote: "当社でお買取り対象の取扱商品すべて、宅配・郵送でもお取り扱いしております。",
    },
  },
  {
    companyId: "nexus13",
    sourceUrl: "https://www.nexus13.co.jp/",
    checkedAt: "2026-09-25",
    storefront: {
      quote: "「その場で査定・その場で現金お支払い」の店頭買取を是非ご利用ください。",
    },
    shipping: {},
  },
  {
    companyId: "ginzaya",
    sourceUrl: "https://ginzaya.co.jp/",
    checkedAt: "2026-09-25",
    storefront: { quote: "お店ですぐにお支払い 店頭買取" },
    visit: { quote: "ご自宅まで買取にお伺いします 出張買取" },
  },
  {
    companyId: "okuraya",
    sourceUrl: "https://okuraya.jp/",
    checkedAt: "2026-09-25",
    storefront: {
      quote: "店頭買取では5分～10分程度でカンタン・スピーディにお客様の品物を査定し",
    },
    visit: { quote: "お客様のご自宅に伺って買取いたします。" },
  },
  {
    companyId: "brandoff",
    sourceUrl: "https://kaitori.brandoff.co.jp/",
    checkedAt: "2026-09-25",
    storefront: { quote: "お近くの店舗に持ち込むだけ" },
    visit: {
      quote: "ご自宅までブランドオフの査定スタッフがお伺いし お品物を直接拝見した上で査定",
    },
    shipping: { quote: "ご自宅から箱に詰めて送るだけ" },
  },
  {
    companyId: "fukuchan",
    sourceUrl: "https://fuku-chan.info/gold/",
    checkedAt: "2026-09-25",
    storefront: {},
    visit: { quote: "1点からでもお伺いします！手数料は全て無料" },
    shipping: { quote: "詰めて送るだけ！宅配キットも福ちゃんがご用意します" },
  },
  {
    companyId: "shichifuku",
    sourceUrl: "https://shichifuku-kaitori.com/",
    checkedAt: "2026-09-25",
    visit: { quote: "完全無料の出張買取で不用品を現金に！", area: "東京23区" },
  },
  {
    companyId: "urucoco",
    sourceUrl: "https://ultra-b.jp/",
    checkedAt: "2026-09-25",
    storefront: {},
    visit: { quote: "全国出張買取対応", area: "全国" },
    shipping: { quote: "品物送るだけ!高額品も配送保険付きで安心！" },
  },
  {
    companyId: "rodeodrive",
    sourceUrl: "https://kaitori.rodeodrive.co.jp/gold/",
    checkedAt: "2026-09-25",
    storefront: {},
    visit: { quote: "手間なく安全に売りたい方へ" },
    shipping: { quote: "ご自宅にいながら品物を売りたい方へ" },
  },
  {
    companyId: "refasta",
    sourceUrl: "https://kinkaimasu.jp/",
    checkedAt: "2026-09-25",
    storefront: {},
    visit: {},
    shipping: { quote: "選べる2つの無料宅配買取" },
  },
  {
    companyId: "netoff",
    sourceUrl: "https://www.netoff.co.jp/brand/jewelry/gold/",
    checkedAt: "2026-09-25",
    shipping: {
      quote: "希望日時に、ご自宅へ宅配業者が無料で集荷に伺います。コンビニへの持込もOK！",
    },
  },
];

export type ServiceId = "storefront" | "visit" | "shipping";

export const SERVICE_LABEL: Record<ServiceId, string> = {
  storefront: "店頭",
  visit: "出張",
  shipping: "宅配",
};

export function serviceRecord(companyId: string): ServiceRecord | undefined {
  return SERVICE_RECORDS.find((r) => r.companyId === companyId);
}

export interface RemoteOption {
  id: string;
  name: string;
  /** 指定純度の公表単価。公表していない、または古くて使えない場合は null */
  price: number | null;
  /** price が null の理由。公表していないのと、取れた値が古いのとは別のこと */
  priceNote: "unpublished" | "stale" | null;
  visit?: VisitEvidence;
  shipping?: ServiceEvidence;
  sourceUrl: string;
  checkedAt: string;
  /** この状況(近くに店舗が無い)で押すべきリンク */
  ctaUrl: string;
  ctaLabel: string;
  /** そのリンクが申し込む方法。どちらとも言えない場合は null */
  ctaService: ServiceId | null;
  isAffiliate: boolean;
  /** 実店舗を持たない、または店舗が少なく出張・宅配が主軸である社 */
  storeCount: number | null;
}

/**
 * 近くに店舗が無い人でも売れる社を、公表単価の高い順に返す。
 *
 * 並べる根拠は単価だけで、報酬の有無は順番に入れない。
 * 単価を公表していない社は最後に置く。0円とみなして最下位にするのとは違い、
 * 「分からないから順位に入れられない」ことを表示側で書けるようにする。
 */
export function remoteBuyers(purity: Purity = "k24"): RemoteOption[] {
  const live = getCompanies();
  const all = rawCompanies as Company[];

  const rows: RemoteOption[] = SERVICE_RECORDS.flatMap((rec) => {
    if (!rec.visit && !rec.shipping) return [];
    const base = all.find((c) => c.id === rec.companyId);
    if (!base) return [];
    const current = live.find((c) => c.id === rec.companyId);
    const price = current?.priceData.prices[purity] ?? null;

    const row: RemoteOption = {
      id: base.id,
      name: base.name,
      price,
      priceNote: price !== null ? null : current?.priceData.staleDays ? "stale" : "unpublished",
      visit: rec.visit,
      shipping: rec.shipping,
      sourceUrl: rec.sourceUrl,
      checkedAt: rec.checkedAt,
      storeCount: base.storeCount,
      isAffiliate: hasAffiliateLink(base),
      ...remoteCta(base, rec),
    };
    return [row];
  });

  return rows.sort((a, b) => {
    if (a.price === null && b.price === null) return 0;
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    return b.price - a.price;
  });
}

/**
 * 近くに店舗が無い人に出すリンクを選ぶ。
 *
 * 代表リンクをそのまま使うと行き先がずれる。コメ兵の代表リンクは「店頭買取予約」で、
 * 店舗が近くに無いと分かった直後の人に来店予約を出すことになる。
 * だから、確認できている方法(宅配・出張)に対応するリンクを優先して選ぶ。
 */
function remoteCta(
  company: Company,
  rec: ServiceRecord,
): { ctaUrl: string; ctaLabel: string; ctaService: ServiceId | null } {
  const links = getAffiliateLinks(company);
  const wanted: { service: ServiceId; keyword: string; label: string }[] = [];
  if (rec.shipping)
    wanted.push({
      service: "shipping",
      keyword: "宅配",
      label: "宅配買取を申し込む",
    });
  if (rec.visit)
    wanted.push({
      service: "visit",
      keyword: "出張",
      label: "出張買取を申し込む",
    });

  for (const w of wanted) {
    const hit = links.find((l) => l.label.includes(w.keyword));
    if (hit) return { ctaUrl: hit.url, ctaLabel: w.label, ctaService: w.service };
  }
  // 方法別のリンクが無い社。リンク自体があるならそれを使い、無ければ公式サイトへ送る。
  // 「公式サイトで」と書いておいて広告リンクを踏ませない。
  const fallback = links.find((l) => l.primary) ?? links[0];
  if (fallback) return { ctaUrl: fallback.url, ctaLabel: fallback.label, ctaService: null };
  return {
    ctaUrl: company.officialUrl,
    ctaLabel: "公式サイトで買取方法を見る",
    ctaService: null,
  };
}
