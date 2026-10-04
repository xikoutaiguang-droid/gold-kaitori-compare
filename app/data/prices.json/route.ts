import { SITE_NAME, SITE_URL, OPERATOR_NAME } from "@/lib/siteConfig";
import { getCompanies, getReferenceRate, PRICE_MAX_AGE_DAYS } from "@/lib/companies";
import { getPriceHistory } from "@/lib/priceHistory";

/**
 * 当サイトが集めている価格を、そのまま機械で読める形で出す。
 *
 * なぜ要るか:
 * ここに並んでいる数字は、各社が自社サイトに出している値を毎日取って揃えたもので、
 * 「同じ日の、同じ純度の、各社の価格」という形で持っているのは当サイトだけになる。
 * 画面でしか読めないと、引用する側はHTMLから数字を剥がすしかなく、
 * 剥がし間違えればこちらの名前で間違った数字が出回る。
 *
 * 出すのは /trend と /compare に表示しているものと同じ中身。画面に出していない
 * ものはここにも出さない。各社の出典URLを必ず添えるのは、孫引きされたときに
 * 元が辿れるようにするため(当サイトは出典であって、値の出どころではない)。
 */

export const dynamic = "force-static";

function build() {
  const companies = getCompanies();
  const history = getPriceHistory();
  const reference = getReferenceRate();

  return {
    name: `${SITE_NAME} 買取価格データ`,
    description:
      "金・プラチナ・銀の買取参考価格(円/g)。各社が公式サイトで公表している値を毎日取得したもの。",
    source: SITE_URL,
    maintainer: OPERATOR_NAME,
    terms:
      "利用は自由ですが、引用・転載の際は出典として " +
      SITE_URL +
      " を明記してください。価格は日々変わるため、各レコードの updatedAt も併せて示してください。",
    caveats: [
      "各社が公表している参考価格であり、実際の査定額を保証するものではない",
      "宝飾品のスクラップを前提とした価格で、地金(インゴット)とは前提が異なる社がある",
      `公表から${PRICE_MAX_AGE_DAYS}日を超えた価格は、同じ日の比較に使えないものとして prices を空にしている`,
      "一部の社は手数料や分析料を単価から差し引くため、この値がそのまま受け取れる額ではない",
    ],
    generatedAt: new Date().toISOString(),
    referenceRate: {
      source: reference.source,
      sourceUrl: reference.sourceUrl,
      updatedAt: reference.updatedAt,
      prices: reference.prices,
      note: reference.notes,
    },
    companies: companies.map((c) => ({
      id: c.id,
      name: c.name,
      officialUrl: c.officialUrl,
      priceSourceUrl: c.priceSourceUrl ?? null,
      page: `${SITE_URL}/company/${c.id}`,
      regions: c.regions,
      updatedAt: c.priceData.updatedAt,
      fetchedAt: c.priceData.fetchedAt ?? null,
      pricesPerGramJpy: c.priceData.prices,
    })),
    dailyAverage: {
      note: history.notes,
      recordingStartedAt: history.recordingStartedAt,
      entries: history.entries,
    },
  };
}

export async function GET() {
  return new Response(JSON.stringify(build(), null, 2) + "\n", {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
