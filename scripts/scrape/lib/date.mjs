/**
 * 取得した価格に付ける日付の決め方。
 *
 * updatedAt は「その店がその価格を公表した日」であって、こちらが取りに行った日ではない。
 * ここを取り違えると、サイトには今日の日付が出ているのに中身は数日前の価格、という
 * 見え方になる。実際おたからや・ジュエルカフェ・ネクサスの3社がそうなっていた
 * (各社のページには更新日が書いてあるのに、こちらは常に実行日を入れていた)。
 *
 * ページに更新日が書いてある店は、それを読む。書いていない店だけ、こちらが見た日を使う。
 */

/**
 * 日本時間の今日(YYYY-MM-DD)。
 *
 * new Date().toISOString() は UTC なので、日本時間の朝9時より前に実行すると前日になる。
 * 対象が日本の店の日本時間での公表である以上、日付は日本時間で切る。
 */
export function todayJst() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * 「2026年09月25日」「2026/9/26」のような表記を YYYY-MM-DD にする。
 * 読めなければ null を返す。呼び出し側で失敗として扱うこと。
 */
export function toIsoDate(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** 文字列から最初の年月日を取り出す。区切りは 年月日 / . - に対応 */
export function parseJaDate(text) {
  const m = /(\d{4})\s*[年./-]\s*(\d{1,2})\s*[月./-]\s*(\d{1,2})/.exec(text ?? "");
  return m ? toIsoDate(m[1], m[2], m[3]) : null;
}
