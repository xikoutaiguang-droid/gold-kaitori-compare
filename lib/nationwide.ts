import { getCompanies } from "@/lib/companies";
import { serviceRecord } from "@/lib/services";

/**
 * 「全国対応」と書いている社が、実際には何店舗あるのかを測る。
 *
 * 対応地域は各社が自分で名乗っているもので、当サイトはそれをそのまま載せている。
 * ところが同じ「全国」の中に、1,980店舗の社と実店舗ゼロの社が並んでいる。
 * 「全国対応」は買い取る範囲の話で、近くに店があるという意味ではない。
 * その食い違いは、25社ぶんの店舗数と対応方法を同じ表に並べて初めて見える。
 *
 * 記事側に数字を書かない。店舗数は各社の公表値で、増減するため。
 */

export interface NationwideShop {
  id: string;
  name: string;
  /** 各社が公表している店舗数。公表していなければ null */
  storeCount: number | null;
  storefront: boolean;
  visit: boolean;
  shipping: boolean;
}

export interface NationwideMeasurement {
  /** 価格を公表しているかどうかに関わらず、掲載している全社数 */
  total: number;
  /** 「全国」と名乗っている社 */
  shops: NationwideShop[];
  /** 店舗数を公表している社のうち、いちばん多い社と少ない社 */
  most: NationwideShop | null;
  fewest: NationwideShop | null;
  /** 店舗数を公表していない社の数 */
  undisclosed: number;
  /** 実店舗ゼロ(非対面のみ)の社 */
  noStore: NationwideShop[];
  /** 店頭買取を確認できた社の数 */
  withStorefront: number;
  /** 公表している社のうち、10店舗以下の社 */
  small: NationwideShop[];
}

export function measureNationwide(): NationwideMeasurement | null {
  const all = getCompanies();
  const shops: NationwideShop[] = all
    .filter((c) => (c.regions ?? []).includes("全国"))
    .map((c) => {
      const svc = serviceRecord(c.id);
      return {
        id: c.id,
        name: c.name,
        storeCount: c.storeCount ?? null,
        storefront: Boolean(svc?.storefront),
        visit: Boolean(svc?.visit),
        shipping: Boolean(svc?.shipping),
      };
    })
    // 店舗数の多い順。公表していない社は最後にまとめる
    .sort((a, b) => (b.storeCount ?? -1) - (a.storeCount ?? -1));

  if (shops.length < 3) return null;

  const disclosed = shops.filter((s): s is NationwideShop & { storeCount: number } => s.storeCount !== null);

  return {
    total: all.length,
    shops,
    most: disclosed[0] ?? null,
    fewest: disclosed[disclosed.length - 1] ?? null,
    undisclosed: shops.length - disclosed.length,
    noStore: shops.filter((s) => s.storeCount === 0),
    withStorefront: shops.filter((s) => s.storefront).length,
    small: disclosed.filter((s) => s.storeCount > 0 && s.storeCount <= 10),
  };
}
