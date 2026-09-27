import Link from "next/link";
import { getCompanies } from "@/lib/companies";

/**
 * 各社の個別ページへのリンク。
 *
 * この25ページには、サイト内から /company(一覧)の1本しかリンクが無かった。
 * トップの順位表も /compare の比較表も、店名を押すと各社の公式サイトへ出ていくだけで、
 * 当サイトがその店について書いたページには行けない作りだった。
 * 実際、掲載25社のうち8社のページは Google に一度もクロールされていない
 * (Search Console で「前回のクロール: 該当なし」)。
 *
 * 読む人の側にも同じ穴がある。Search Console の上位クエリは
 * 「ネクサス 金」「なんぼや 買取」「24金相場 1g 今日 コメ兵」のように
 * ほとんどが店名での検索で、探しているのは特定の1社の情報なのに、
 * トップページからその店のページへ行く道が無かった。
 */
export default function CompanyLinks({ exclude }: { exclude?: string }) {
  const companies = getCompanies().filter((c) => c.id !== exclude);
  return (
    <div className="flex flex-wrap gap-2">
      {companies.map((c) => (
        <Link
          key={c.id}
          href={`/company/${c.id}`}
          className="rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground/80 transition hover:border-accent/40 hover:bg-accent-soft"
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
