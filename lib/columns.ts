/**
 * コラム記事の一覧。
 *
 * 一覧ページの中だけに置いていたため、各記事への内部リンクが /column からの1本しか
 * 無かった。実際、公開から1週間経っても Google にインデックスされない記事があった。
 * 記事どうしを行き来できるようにすると、読む人にとっても次の1本が見つかる。
 */
export interface ColumnEntry {
  href: string;
  title: string;
  desc: string;
}

export const COLUMNS: ColumnEntry[] = [
  {
    href: "/column/fees",
    title: "金買取の手数料は、どこでいくら引かれるのか",
    desc: "「手数料無料」の意味が店ごとに違うこと、あとから引かれる場合に実質単価がいくらになるかを各社の記載から",
  },
  {
    href: "/column/timing-vs-shop",
    // 一覧は静的な配列なので、どちらが効くかを書かない。記事側の見出しは
    // 測った結果で入れ替わるため、ここに書くと片方が古くなる。
    title: "売る日と売る店、どちらが金額を動かすのか",
    desc: "売る日をずらしたときの差と、売る店を変えたときの差を、記録した価格で測り比べました",
  },
  {
    href: "/column/hallmark",
    title: "金の刻印はどこにある？「750」「K18」「GP」の見分け方",
    desc: "刻印の位置を図で示し、造幣局のホールマークやメッキ表記との違いまで",
  },
  {
    href: "/column/karat-and-price",
    title: "K18は「金75%」。では値段も75%になるのか",
    desc: "刻印が示す含有率と、実際に払われている金額を各社の公表価格から比べました",
  },
  {
    href: "/column/what-a-gram-means",
    title: "「1gいくら」は、店ごとに同じ意味ではない",
    desc: "各社の注意書きまで読むと、同じ単価が指しているものが揃っていませんでした",
  },
  {
    href: "/column/price-gap",
    title: "同じ日に、同じ金を、各社はいくらで買うのか",
    desc: "当サイトが集めた各社の公表価格を実際に測り、得と損の大きさを比べました",
  },
  {
    href: "/column/plating-check",
    title: "メッキと金の簡単な見分け方",
    desc: "磁石を使った自宅でできる簡易チェックと、その限界について",
  },
  {
    href: "/column/multiple-quotes",
    title: "査定額を上げるコツ",
    desc: "相見積もりをはじめ、売る前にできる準備をまとめました",
  },
  {
    href: "/column/price-factors",
    title: "金相場はなぜ変動するのか",
    desc: "国際価格・為替・世界情勢との関係をやさしく解説",
  },
  {
    href: "/column/estate-cleanup",
    title: "遺品整理・生前整理で貴金属を手放すときの心構え",
    desc: "気持ちの整理から実務的な注意点まで",
  },
];
