// lib/domain.ts と同じロジック(Node製スクリプト側は.tsを直接importできないため複製)。
// 日本の複合TLD(co.jp等)を考慮した実効ドメイン抽出。単純な末尾2ラベル抽出だと
// co.jp同士が誤って同一ドメイン扱いになるバグが実際に発生したため、これを防ぐ。
const JP_COMPOUND_SUFFIXES = ["co.jp", "ne.jp", "or.jp", "ac.jp", "go.jp", "gr.jp", "ed.jp", "lg.jp"];

export function rootDomain(hostname) {
  const lower = hostname.toLowerCase();
  const labels = lower.split(".");

  for (const suffix of JP_COMPOUND_SUFFIXES) {
    if (lower.endsWith(`.${suffix}`)) {
      const suffixLabels = suffix.split(".").length;
      return labels.slice(-(suffixLabels + 1)).join(".");
    }
  }

  return labels.slice(-2).join(".");
}
