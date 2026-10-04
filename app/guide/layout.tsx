/**
 * ガイドページの共通レイアウト。
 *
 * コラムと同じ長文なので、同じ行間・段落間のスタイル(.column-body)を使う。
 * スタイルの定義は app/globals.css。
 */
export default function GuideLayout({ children }: LayoutProps<"/guide">) {
  return <div className="column-body">{children}</div>;
}
