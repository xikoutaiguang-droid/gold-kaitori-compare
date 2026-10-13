import { PURITY_FINENESS } from "@/lib/units";
import { GOLD_PURITIES, type Purity } from "@/lib/types";

/**
 * 「水に入れて調べる」方法(比重測定)のもとになる数字。
 *
 * 出どころ:
 * 財務省 関税中央分析所報 第56号「金製品の鑑定について」(東京税関分析部門)。
 * 金の密輸が増えたため、めっきや塗装で偽装された品物を税関でどう見分けるかを
 * まとめた報告で、蛍光X線分析と密度測定の手順が書かれている。
 * 家庭でやることと目的が同じ(これは本当に金かを確かめる)なので、ここを典拠にした。
 *
 * 注意: 出典はPDFである。当サイトの日次の照合(scripts/verify-quotes.mjs)は
 * HTMLを取って文字列を突き合わせる作りなので、PDFは自動では照合できない。
 * 代わりに、告示や法令と同じく「改訂されたら別の号になる」たぐいの文書なので、
 * 引用ではなく数値として持ち、確認日を残している。照合スクリプトはPDFのURLを
 * 取りに行かず、手で確かめる出典として一覧に出す。
 */

/** この日にPDFを読んで数値を転記した */
export const DENSITY_CHECKED_AT = "2026年10月14日";

export const CUSTOMS_REPORT = {
  sourceId: "customs-gold-analysis-56",
  title: "関税中央分析所報 第56号「金製品の鑑定について」",
  publisher: "財務省 関税中央分析所（東京税関分析部門）",
  // 照合スクリプトはPDFの中身を読まない。URLがまだ生きているかだけ毎日見る。
  sourceUrl: "https://www.customs.go.jp/ccl_search/info_search/inorganicss/r_56_10_j.pdf",
} as const;

/**
 * Table 3 Densities of precious metals and main base metals の転記(g/cm³)。
 * 貴金属と、めっきの土台に使われる主な金属が並んでいる。
 */
export const DENSITY: Record<string, number> = {
  金: 19.322,
  銀: 10.502,
  銅: 8.962,
  プラチナ: 21.452,
  鉄: 7.874,
  タングステン: 19.32,
  ニッケル: 8.902,
  すず: 7.28,
  アルミニウム: 2.698,
};

/** めっきの土台や偽装に使われていた側の金属。報告書が挙げている元素に合わせる */
export const BASE_METALS = ["ニッケル", "銅", "鉄", "すず", "アルミニウム"] as const;

/** Table 2 のモース硬度。金とタングステンを分けるのは密度ではなくこちら */
export const MOHS = { 金: 2.5, 鉄: 4.0, タングステン: 7.5, ダイヤモンド: 10.0 } as const;

/** 本文に出す実測の値。金地金457塊の密度の平均 */
export const MEASURED_BULLION = { samples: 457, mean: 19.24 } as const;

export interface AlloyDensity {
  purity: Purity;
  /** 金以外がすべて銅だと置いたときの密度(下限) */
  low: number;
  /** 金以外がすべて銀だと置いたときの密度(上限) */
  high: number;
}

/**
 * 金合金の密度を、含まれる金の割合から計算する。
 *
 * 体積が足し合わせになると置くと、質量比 w の合金の密度 ρ は
 *   1/ρ = w/ρ(金) + (1-w)/ρ(割り金)
 * になる。割り金に何がどれだけ入っているかは製品ごとに違って分からないので、
 * 銅だけの場合と銀だけの場合の2つを出して幅として示す。1つの値に決めない。
 *
 * この幅の意味はひとつだけで、「どのK数であっても、めっきの土台に使われる金属より
 * はっきり重い」ということである。K18とK20を見分けるような使い方はできない。
 */
function alloyDensity(goldFraction: number, otherDensity: number): number {
  return 1 / (goldFraction / DENSITY.金 + (1 - goldFraction) / otherDensity);
}

export function goldAlloyDensities(): AlloyDensity[] {
  return GOLD_PURITIES.map((purity) => {
    const w = PURITY_FINENESS[purity];
    return {
      purity,
      low: alloyDensity(w, DENSITY.銅),
      high: alloyDensity(w, DENSITY.銀),
    };
  });
}

/** いちばん金の少ない純度でも、これより軽くはならないという値 */
export function lowestGoldAlloyDensity(): number {
  return Math.min(...goldAlloyDensities().map((a) => a.low));
}

/** めっきの土台側でいちばん重い金属 */
export function heaviestBaseMetal(): { name: string; density: number } {
  let best: { name: string; density: number } = {
    name: BASE_METALS[0],
    density: DENSITY[BASE_METALS[0]],
  };
  for (const name of BASE_METALS) {
    if (DENSITY[name] > best.density) best = { name, density: DENSITY[name] };
  }
  return best;
}

/**
 * 報告書から引いている一文。
 *
 * PDFなので当サイトの日次の照合では中身まで確かめられない(照合スクリプトは
 * URLが生きているかだけ見る)。号の付いた刊行物で、あとから書き換わる種類の
 * 文書ではないため、確認日を残して扱う。記事側にもその旨を書いている。
 */
export const CUSTOMS_QUOTES = {
  plating: {
    sourceId: "customs-gold-analysis-56-plating",
    label: "関税中央分析所報 第56号「金製品の鑑定について」",
    quote:
      "試料に施されていためっきの大部分はニッケル又はニッケル合金によるものであり、めっきの除去には、希硝酸を使用したが、鉄が多い場合は、希塩酸を使用した。",
    sourceUrl: "https://www.customs.go.jp/ccl_search/info_search/inorganicss/r_56_10_j.pdf",
  },
} as const;

/**
 * 隣り合う純度どうしで、計算した幅が重なる組み合わせ。
 *
 * 「密度では何金かまでは分からない」と本文に書くなら、どこが重なるのかは
 * 計算で出す。品位の定義を直したときに、文章だけ古くなるのを避けるため。
 */
export function overlappingPairs(): { a: Purity; b: Purity }[] {
  const list = goldAlloyDensities();
  const out: { a: Purity; b: Purity }[] = [];
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i];
    const b = list[i + 1];
    // a は b より金が多い(密度が高い)。a の下限が b の上限より下なら重なる
    if (a.low <= b.high) out.push({ a: a.purity, b: b.purity });
  }
  return out;
}
