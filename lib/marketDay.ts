import { getReferenceRate } from "@/lib/companies";

/**
 * 市場が動いていない日かどうか。
 *
 * 金の建値は土日祝に更新されない。その間、各社の価格は一様には動かない。
 * 2026年9月の4連休(9/19土〜9/22秋分の日)を実際に測ったところ、価格を追えている
 * 16社のうち9社は金曜の値のまま据え置き、3社は下げ(コメ兵 -281円/g、
 * ロデオドライブ -260円/g、ベストライフ -128円/g)、3社は上げていた。
 *
 * つまり市場が止まっている間の順位は、価格水準ではなく各社の値付け方針を映す。
 * 週明けの変動に備えて下げる店は、その分だけ下位に出る。並べて順位を出している
 * 以上、その条件下で見ていることは読む人に伝える必要がある。
 *
 * 判定には田中貴金属の建値の公表日を使う。当サイトが基準にしている価格そのもので、
 * 市場が開いた日にしか更新されないため、祝日カレンダーを持たずに済む。
 */
export interface MarketStatus {
  /** 建値が今日のものではない(=市場が動いていない)か */
  stale: boolean;
  /** 建値の公表日(YYYY-MM-DD) */
  referenceDate: string;
  /** 建値の日から何日経ったか */
  daysSince: number;
}

export function getMarketStatus(): MarketStatus | null {
  const ref = getReferenceRate();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ref.updatedAt ?? "");
  if (!m) return null;

  const refDay = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSince = Math.round((today - refDay) / 86400000);

  return {
    // 建値は日本時間9:30ごろの公表なので、平日の早朝は前日の値のままになる。
    // それを「市場が止まっている」と言うと外れるので、2日以上空いたときだけ扱う。
    stale: daysSince >= 2,
    referenceDate: ref.updatedAt!,
    daysSince,
  };
}
