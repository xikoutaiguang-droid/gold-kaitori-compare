import rawCompanies from "@/data/companies.json";
import rawReferenceRate from "@/data/referenceRate.json";
import type { Company, Purity, Region } from "@/lib/types";

export interface ReferenceRate {
  source: string;
  sourceUrl: string;
  prices: Partial<Record<Purity, number>>;
  updatedAt: string;
  notes: string;
}

export function getReferenceRate(): ReferenceRate {
  return rawReferenceRate as ReferenceRate;
}

export type ReliabilityTier = "high" | "medium" | "low";

export const RELIABILITY_LABELS: Record<ReliabilityTier, string> = {
  high: "十分なサンプル",
  medium: "参考程度",
  low: "サンプル少なめ・要注意",
};

/**
 * 口コミサンプルの統計的な厚みを大まかに3段階で判定する。
 * 個々のレビューが本物かどうか(やらせ等)を検証するものではなく、
 * あくまで「サンプル店舗数・レビュー総数がどれだけ集まっているか」の目安。
 * 単一店舗のサンプルはチェーン全体の代表値として弱いため、件数に関わらずlow扱いにする。
 */
export function reviewReliability(gr: NonNullable<Company["googleReview"]>): ReliabilityTier {
  if (gr.sampleSize <= 1) return "low";
  if (gr.totalReviewCount >= 1000) return "high";
  if (gr.totalReviewCount >= 100) return "medium";
  return "low";
}

/**
 * これより古い公表価格は、同じ日の横並び比較に使えないものとして扱う。
 *
 * 金価格は日々動くので、数日前の数字を今日の数字の隣に並べて順位を付けると、
 * その社を実態より高くも低くも見せてしまう。実際になんぼやの取得元JSONが
 * 10か月更新されておらず、約2,100円/g低い価格で17位に並べていた。
 *
 * 取得スクリプトの側にも「古ければ無効化すること」という警告はあったが、
 * 人が読んで対応する前提の警告は動かなかった。だからここで、
 * 誰が見ていなくても古い価格が比較に入らないようにする。
 */
export const PRICE_MAX_AGE_DAYS = 10;

function daysBetween(iso: string, today: Date): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const t = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((t - d) / 86400000);
}

export function getCompanies(): Company[] {
  const today = new Date();
  return (rawCompanies as Company[]).map((c) => {
    if (!c.priceData.updatedAt) return c;
    const age = daysBetween(c.priceData.updatedAt, today);
    if (age === null || age <= PRICE_MAX_AGE_DAYS) return c;
    // 価格そのものは捨てるが、更新日と経過日数は残す。
    // 「公表していない」のではなく「取得できている値が古い」ことを
    // ページ側で正しく説明できるようにするため。
    return { ...c, priceData: { ...c.priceData, prices: {}, staleDays: age } };
  });
}

/**
 * 当サイトが価格を取りに行った日時を、日本時間の「9月22日 15:01 取得」形式にする。
 *
 * 1日に複数回価格を動かす店があるので(コメ兵は田中貴金属の建値公表後と14時ごろの2回)、
 * 日付だけでは朝の値か午後の値かが分からない。当サイトの取得は10:00と15:00の2回。
 */
export function formatFetchedAt(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // JST固定。読む人の端末の時計に合わせると、同じ価格が別の時刻に見えてしまう。
  const jst = new Date(d.getTime() + 9 * 3600 * 1000);
  const mm = jst.getUTCMonth() + 1;
  const dd = jst.getUTCDate();
  const hh = String(jst.getUTCHours()).padStart(2, "0");
  const mi = String(jst.getUTCMinutes()).padStart(2, "0");
  return `${mm}月${dd}日 ${hh}:${mi}`;
}

/** 「2026-09-25」を「9月25日」にする。表示用 */
export function formatPriceDay(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[2])}月${Number(m[3])}日` : iso;
}

export interface PriceDateSummary {
  /** 公表日ごとの社数。新しい日が先 */
  byDate: { date: string; count: number }[];
  /** いちばん新しい公表日 */
  latest: string | null;
  /** 当サイトが最後に価格を取りに行った時刻(ISO) */
  fetchedAt: string | null;
  /** 価格を出せている社数 */
  priced: number;
}

/**
 * 表示している価格が「いつのものか」をまとめる。
 *
 * トップページは各社の価格を並べておきながら、日付をどこにも出していなかった。
 * 「本日の買取価格ランキング」とだけ書いていたが、各社の公表日は揃わないし、
 * 当サイトの取得は1日3回なので、今日の日付が入っているとは限らない。
 * /about には「ページ内に更新日を必ず表示している」と書いてあり、そこも守れていなかった。
 *
 * 日付は各社が価格を公表した日(updatedAt)で、当サイトが取りに行った時刻(fetchedAt)とは
 * 別物。前者が「いつの価格か」、後者が「いつ確認したか」なので、両方出す。
 */
export function priceDateSummary(companies: Company[] = getCompanies()): PriceDateSummary {
  const priced = companies.filter((c) => Object.keys(c.priceData.prices).length > 0);

  const counts = new Map<string, number>();
  for (const c of priced) {
    const d = c.priceData.updatedAt;
    if (!d) continue;
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const byDate = [...counts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const fetchedAt = priced
    .map((c) => c.priceData.fetchedAt)
    .filter((v): v is string => Boolean(v))
    .sort()
    .pop();

  return {
    byDate,
    latest: byDate[0]?.date ?? null,
    fetchedAt: fetchedAt ?? null,
    priced: priced.length,
  };
}

/** 鮮度の判定を通していない元データ。古さそのものを点検したいとき用 */
export function getCompaniesUnfiltered(): Company[] {
  return rawCompanies as Company[];
}

export function getCompaniesWithPurity(purity: Purity): Company[] {
  return getCompanies().filter((c) => c.priceData.prices[purity] !== undefined);
}

export function filterByRegion(companies: Company[], region: Region | "全国"): Company[] {
  if (region === "全国") return companies;
  return companies.filter((c) => c.regions.includes("全国") || c.regions.includes(region));
}

export const ALL_REGIONS: Region[] = [
  "全国",
  "北海道",
  "東北",
  "関東",
  "中部",
  "東海",
  "近畿",
  "中国",
  "四国",
  "九州・沖縄",
];

export type CriteriaId = "major" | "highPrice" | "trusted" | "hospitality";

export const DIAGNOSIS_CRITERIA: { id: CriteriaId; label: string; description: string }[] = [
  {
    id: "major",
    label: "大手に任せたい",
    description: "店舗数が多く、知名度の高い大手チェーンを優先します。",
  },
  {
    id: "highPrice",
    label: "とにかく高価買取",
    description: "選択した純度の買取参考価格が高い会社を優先します。",
  },
  {
    id: "trusted",
    label: "安心した買取ができる店",
    description: "運営規模・上場や資本提携の有無など公開情報から算出した信頼度スコアで優先します。",
  },
  {
    id: "hospitality",
    label: "接客・会話も楽しみたい",
    description:
      "代表的な店舗のGoogle口コミ評価(サンプリング値)が高い会社を優先します。全店舗の集計ではない参考値です。",
  },
];

/**
 * 選択された基準ごとに順位(1位=最良)を算出し、選択基準の平均順位が小さい順(=総合的に良い順)に並べる。
 * 単純な平均順位方式を採用しているのは、基準ごとの単位が異なる(店舗数/円/スコア)ため、
 * 加重和よりも「どの基準でも上位に来る会社が総合的に評価される」方式の方が説明しやすいため。
 */
/**
 * 各基準での「値」。取れていない場合は null を返し、0 を代入しない。
 *
 * 以前は `storeCount ?? 0` と書いていたため、店舗数を公表していない会社が
 * 「0店舗」として最下位に並んでいた。掲載しているmajor区分10社のうち6社が
 * 非公表なので、コメ兵やなんぼやのような大手が「大手に任せたい」で消えていた。
 * 口コミ(`avgRating ?? 0`)も同じで、未取得の5社が★0.0の店として扱われていた。
 * 公表していないことは、実在する最低値より悪い評価にはならない。
 */
function valueFor(criterion: CriteriaId, purity: Purity, pool: Company[]): (c: Company) => number | null {
  switch (criterion) {
    case "major": {
      // 規模の問いに答えるのは tier(major/midsize/boutique)で、店舗数はその中の目安。
      // 非公表の社は、同じ tier で公表している社の中央値とみなす。
      // プール全体の中位に置くと tier をまたいでしまい、大手が中堅より下に出る。
      const medianByTier = new Map<Company["tier"], number>();
      for (const tier of ["major", "midsize", "boutique"] as const) {
        const known = pool
          .filter((c) => c.tier === tier && c.storeCount !== null)
          .map((c) => c.storeCount as number)
          .sort((x, y) => x - y);
        if (known.length) medianByTier.set(tier, known[(known.length - 1) >> 1]);
      }
      return (c) => {
        const count = c.storeCount ?? medianByTier.get(c.tier) ?? null;
        return count === null ? null : TIER_BASE[c.tier] + count;
      };
    }
    case "highPrice":
      return (c) => c.priceData.prices[purity] ?? null;
    case "trusted":
      return (c) => c.trustScore;
    case "hospitality":
      return (c) => c.googleReview?.avgRating ?? null;
    default:
      return () => null;
  }
}

/** tier の順序を数値にしたもの。同じ tier 内で店舗数が効くよう十分に離す */
const TIER_BASE: Record<Company["tier"], number> = {
  major: 2_000_000,
  midsize: 1_000_000,
  boutique: 0,
};

/**
 * 値の大きい順に1位から並べる。値が無い社は最下位にせず、
 * 値がある社の中央の順位に置く。有利にも不利にもしないための扱い。
 */
function rankWithUnknowns(
  pool: Company[],
  value: (c: Company) => number | null,
): Map<string, number> {
  const known = pool
    .map((c) => ({ c, v: value(c) }))
    .filter((x): x is { c: Company; v: number } => x.v !== null && Number.isFinite(x.v))
    .sort((a, b) => b.v - a.v);

  const ranks = new Map<string, number>();
  known.forEach((x, i) => ranks.set(x.c.id, i + 1));

  const medianRank = known.length ? (known.length + 1) / 2 : 1;
  for (const c of pool) if (!ranks.has(c.id)) ranks.set(c.id, medianRank);
  return ranks;
}

export function diagnose(
  companies: Company[],
  criteria: CriteriaId[],
  purity: Purity
): { company: Company; avgRank: number }[] {
  const priced = companies.filter((c) => c.priceData.prices[purity] !== undefined);
  const pool = priced.length > 0 ? priced : companies;

  if (criteria.length === 0) {
    return pool.map((company) => ({ company, avgRank: 0 }));
  }

  const ranks = new Map<string, number[]>();
  for (const c of pool) ranks.set(c.id, []);

  for (const criterion of criteria) {
    const value = valueFor(criterion, purity, pool);
    const ranked = rankWithUnknowns(pool, value);
    for (const [id, rank] of ranked) ranks.get(id)!.push(rank);
  }

  return pool
    .map((company) => {
      const r = ranks.get(company.id)!;
      const avgRank = r.reduce((sum, v) => sum + v, 0) / r.length;
      return { company, avgRank };
    })
    .sort((a, b) => a.avgRank - b.avgRank);
}
