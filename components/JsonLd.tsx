/**
 * 構造化データを <script type="application/ld+json"> として出す。
 *
 * JSON.stringify は "<" をそのまま通すので、値に "</script>" が混ざると
 * タグが閉じてしまう。Next.js のドキュメントの推奨どおり "<" を < に置き換える。
 * 今の入力は当サイトのデータだけだが、将来ここに外部の文字列が入っても壊れないようにしておく。
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\u003c") }}
        />
      ))}
    </>
  );
}
