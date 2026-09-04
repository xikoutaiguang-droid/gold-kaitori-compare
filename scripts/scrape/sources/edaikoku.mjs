import { notImplemented } from "./_stub.mjs";

export const id = "e-daikoku";
const URL = "https://kaitori.e-daikoku.com/brand/genre/gold.html";

export const scrape = notImplemented(
  id,
  URL,
  "価格表はJSコメント内のテンプレート文字列として埋め込まれ、実際の値はJavaScriptで書き換えられる方式。curl取得では明らかに現実離れした値(K24=7,170円など)しか得られないため、ブラウザレンダリングまたは実際のAJAXエンドポイントの特定が必要。"
);
