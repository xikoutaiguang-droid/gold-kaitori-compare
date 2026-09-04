// 日本の複合TLD(co.jp、ne.jp等)を考慮した実効ドメイン(eTLD+1)抽出。
// 単純に「末尾2ラベル」を取ると co.jp 同士が誤って同一ドメイン扱いになってしまう
// (例: ginzaya.co.jp と ito-ya.co.jp が両方 "co.jp" に潰れて一致してしまうバグが実際に発生した)。
const JP_COMPOUND_SUFFIXES = ["co.jp", "ne.jp", "or.jp", "ac.jp", "go.jp", "gr.jp", "ed.jp", "lg.jp"];

export function rootDomain(hostname: string): string {
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

export function isSameRootDomain(urlA: string, urlB: string): boolean {
  try {
    return rootDomain(new URL(urlA).hostname) === rootDomain(new URL(urlB).hostname);
  } catch {
    return false;
  }
}
