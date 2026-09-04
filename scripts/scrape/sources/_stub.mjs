// 未実装のスクレイパー用ヘルパー。
// 実装時はcurl等で実際のHTMLを取得し、価格が表示されているセレクタを
// 特定してから、既存のsources/*.mjs (otakaraya.mjsなど)を参考に実装すること。
export function notImplemented(id, url, reason) {
  return async function scrape() {
    throw new Error(`${id}: 未実装 (${url})${reason ? " - " + reason : ""}`);
  };
}
