import { COLUMNS, type ColumnEntry } from "@/lib/columns";
import { GOLD_PURITIES, PLATINUM_PURITIES, type Purity } from "@/lib/types";

/**
 * そのページを見ている人に、次に読むと役に立つコラムを出す。
 *
 * なぜ要るか:
 * コラムは20本あるのに、記事以外のページからの導線は刻印とメッキの2本だけだった。
 * 価格を見に来た人は「で、この単価は何を指しているのか」「手数料は引かれるのか」を
 * そのページで知りたいはずで、一覧まで戻って探す人はいない。
 * 検索エンジン側から見ても、記事に入る経路が /column からの1本しかない状態になる。
 *
 * 並べるものは文脈ごとに決め打ちにする。自動で「関連」を作ると、関係のない記事が
 * 混ざって、どのページにも同じ4本が並ぶだけになるため。
 */

/** どのページから出すか */
export type ColumnContext =
  | "gold"
  | "platinum"
  | "silver"
  | "company"
  | "compare"
  | "simulator"
  | "trend";

const RELATED: Record<ColumnContext, string[]> = {
  // 金の純度ページ。刻印とメッキは本文中から別途リンクしているので重ねない
  gold: [
    "/column/karat-and-price",
    "/column/what-a-gram-means",
    "/column/fees",
    "/column/price-gap",
  ],
  platinum: [
    "/column/which-metal",
    "/column/what-a-gram-means",
    "/column/fees",
    "/column/hallmark",
  ],
  silver: [
    "/column/which-metal",
    "/column/fees",
    "/column/what-a-gram-means",
    "/column/hallmark",
  ],
  // 会社ページ。「この社の単価は何を指すのか」「引かれるものはあるか」が続きの疑問
  company: [
    "/column/what-a-gram-means",
    "/column/fees",
    "/column/how-to-choose",
    "/column/nationwide",
  ],
  compare: [
    "/column/how-to-choose",
    "/column/price-gap",
    "/column/fees",
    "/column/timing-vs-shop",
  ],
  // 金額を計算した直後の人。実際に受け取る額と、税の話につながる
  simulator: ["/column/fees", "/column/what-a-gram-means", "/column/tax", "/column/which-metal"],
  trend: [
    "/column/price-factors",
    "/column/timing-vs-shop",
    "/column/weekend",
    "/column/retail-vs-buy",
  ],
};

/**
 * 文脈に対応するコラムを返す。
 *
 * 知らないパスが混ざっていたらビルドを落とす。記事を消したり移したりしたときに
 * 黙ってリンクが減る(または404になる)より、その場で気づくほうがいい。
 */
export function relatedColumns(context: ColumnContext): ColumnEntry[] {
  return RELATED[context].map((href) => {
    const entry = COLUMNS.find((c) => c.href === href);
    if (!entry) {
      throw new Error(
        `lib/relatedColumns.ts: ${href} は lib/columns.ts にありません(記事を移動・削除した場合はここも直してください)`,
      );
    }
    return entry;
  });
}

/** 純度から、どの金属の文脈かを決める */
export function contextForPurity(purity: Purity): ColumnContext {
  if (GOLD_PURITIES.includes(purity)) return "gold";
  if (PLATINUM_PURITIES.includes(purity)) return "platinum";
  return "silver";
}
