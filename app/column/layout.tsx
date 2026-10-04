/**
 * コラムの共通レイアウト。
 *
 * 記事本文に .column-body を付けるためだけに置いている(スタイルは app/globals.css)。
 * 20本の記事それぞれに同じクラスを書くと、新しい記事で付け忘れたときに
 * そこだけ行間が違う、という状態になるので、まとめてここで付ける。
 */
export default function ColumnLayout({ children }: LayoutProps<"/column">) {
  return <div className="column-body">{children}</div>;
}
