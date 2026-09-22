// 未実装のスクレイパー用ヘルパー。
// 実装時はcurl等で実際のHTMLを取得し、価格が表示されているセレクタを
// 特定してから、既存のsources/*.mjs (otakaraya.mjsなど)を参考に実装すること。
//
// 「まだ書いていない」ではなく「その会社が数値を公開していないので取りようがない」
// ケースがほとんどなので、点検側ではこれを失敗として数えない。
// 常に赤い点検は見られなくなり、本当の失敗が埋もれる。
// 文字列一致で判別すると理由文を書き換えたときに壊れるため、印を付けて渡す。
export class NotImplemented extends Error {
  constructor(message) {
    super(message);
    this.name = "NotImplemented";
    this.notImplemented = true;
  }
}

export function notImplemented(id, url, reason) {
  const fn = async function scrape() {
    throw new NotImplemented(`${id}: 未実装 (${url})${reason ? " - " + reason : ""}`);
  };
  fn.notImplemented = true;
  return fn;
}
