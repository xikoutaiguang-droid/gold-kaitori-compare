import type { Metadata } from "next";
import Link from "next/link";
import TrustBadges from "@/components/TrustBadges";
import WeightUnitConverter from "@/components/WeightUnitConverter";
import UnitReference from "@/components/UnitReference";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/structuredData";
import { WEIGHT_UNIT_TO_GRAM } from "@/lib/units";
import { measureSpread, getMeasuredOn } from "@/lib/spread";
import {
  SPECIAL_UNITS,
  UNIT_LAW_CHECKED_AT,
  UNIT_LAW_QUOTES,
  ozDefinitionGap,
} from "@/lib/unitLaw";

export const metadata: Metadata = {
  title: "g・匁・オンス換算ツール｜金・貴金属の重さ単位変換",
  description:
    "グラム(g)・匁(もんめ)・トロイオンス(oz)・キログラムを相互に変換できる無料ツール。" +
    "匁もトロイオンスも計量単位令に定義があり、匁は真珠、トロイオンスは金貨と、使ってよい計量まで決まっています。" +
    "条文を引きながら、金やプラチナの買取価格が必ずgで示される理由も説明しています。",
  alternates: { canonical: "/tools/weight-converter" },
};

const faq = [
  {
    q: "匁(もんめ)とは何ですか？",
    a: "尺貫法の質量単位で、1匁は3.75gです。日本の貴金属店・宝飾業界では今でも重さの単位としてよく使われます。",
  },
  {
    q: "オンス(oz)とは何ですか？",
    a: "金地金の国際取引で使われる「トロイオンス」という単位で、1トロイオンスは31.1034768gです。一般的なオンス(常衡オンス、約28.35g)とは値が異なるのでご注意ください。",
  },
  {
    q: "買取価格が「1匁いくら」で示されないのはなぜですか？",
    a: "計量法第8条が、法定計量単位(キログラム・グラム)以外を取引や証明に用いることを禁じているためです。匁は計量単位令の別表第六で「真珠の質量の計量」に限って使える特殊の単位とされていて、金やプラチナの取引には使えません。同じ表でトロイオンスは「金貨の質量の計量」、カラットは「宝石の質量の計量」に限られています。",
  },
];

/** 条文をそのまま出す。要約すると「法律にそう書いてある」が検証できなくなる */
function LawQuoteBlock({ entry }: { entry: (typeof UNIT_LAW_QUOTES)[string] }) {
  return (
    <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
      <p>「{entry.quote}」</p>
      <footer className="mt-2 text-xs text-muted">
        出典:{" "}
        <a
          href={entry.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {entry.label}
        </a>
        （e-Gov法令検索、{UNIT_LAW_CHECKED_AT}に確認）
      </footer>
    </blockquote>
  );
}

export default function WeightConverterPage() {
  // 換算の例は、今日の実際の買取価格から作る。本文に数字を書くと翌日には嘘になる。
  const k24 = measureSpread("k24");
  const measuredOn = getMeasuredOn();
  const ozGap = ozDefinitionGap(WEIGHT_UNIT_TO_GRAM.oz);
  const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd
        data={[
          jsonLd,
          breadcrumbJsonLd([
            { name: "計算ツール", path: "/tools" },
            { name: "g・匁・オンス換算", path: "/tools/weight-converter" },
          ]),
        ]}
      />
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">g・匁・オンス換算ツール</h1>
      <p className="mb-6 text-base text-muted">
        グラム・匁(もんめ)・トロイオンス・キログラムを相互に変換できます。金やプラチナの重さを、買取店の刻印(g表記)や海外の地金相場(oz表記)などと見比べたいときにお使いください。
      </p>
      <TrustBadges
        items={["入力した数値はサーバーに送信されず、この画面内だけで計算されます", "会員登録なしで使えます"]}
      />
      <WeightUnitConverter />

      <UnitReference />

      {/* ---- 今日の価格で換算するといくらか ---- */}
      {k24 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">今日の価格で換算すると</h2>
          <p className="mb-4 text-sm leading-relaxed text-foreground/80">
            換算係数だけを見ても金額の見当はつきません。当サイトが掲載{k24.count}社から取得した
            {measuredOn ? `${measuredOn}時点の` : ""}K24（純金）の最高値、
            <strong>
              1gあたり{yen(k24.high.price)}円（{k24.high.name}）
            </strong>
            で、それぞれの単位を金額に直すとこうなります。
          </p>
          <div className="mb-3 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-2/60 text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">重さ</th>
                  <th className="px-3 py-2 text-right font-medium">gに直すと</th>
                  <th className="px-3 py-2 text-right font-medium">K24の最高値なら</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["1g", WEIGHT_UNIT_TO_GRAM.g],
                    ["1匁", WEIGHT_UNIT_TO_GRAM.momme],
                    ["1トロイオンス", WEIGHT_UNIT_TO_GRAM.oz],
                    ["1kg", WEIGHT_UNIT_TO_GRAM.kg],
                  ] as const
                ).map(([label, grams]) => (
                  <tr key={label} className="border-t border-border">
                    <td className="px-3 py-2">{label}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted">{grams}g</td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">
                      {yen(grams * k24.high.price)}円
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            価格は毎日取り直しているので、この表も毎日変わります。同じ日の最低値は1gあたり
            {yen(k24.low.price)}円（{k24.low.name}）で、1kgに直すと
            {yen(k24.range * 1000)}円の差になります。各社の今日の価格は
            <Link href="/compare" className="underline underline-offset-2 hover:text-accent">
              比較表
            </Link>
            で見られます。
          </p>
        </section>
      )}

      {/* ---- 単位の法的な位置づけ ---- */}
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          匁もトロイオンスも、「何を量るときに使えるか」まで法律で決まっています
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          1匁 = 3.75g という数字は業界の慣習ではなく、政令に書かれている定義です。ただし同時に、その単位を使ってよい場面も限られています。まず原則から。
        </p>
        <LawQuoteBlock entry={UNIT_LAW_QUOTES.prohibition} />
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          質量の法定計量単位はキログラムとグラムです。匁もトロイオンスもカラットも、これには含まれません。では完全に使えないかというとそうではなく、「特殊の計量」として例外が置かれています。
        </p>
        <LawQuoteBlock entry={UNIT_LAW_QUOTES.onlyForSpecial} />
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          その「特殊の計量」の一覧が、計量単位令の別表第六です。貴金属まわりで出てくる3つを抜き出すと、こうなっています。
        </p>
        <div className="mb-4 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-2/60 text-xs text-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">単位</th>
                <th className="px-3 py-2 text-left font-medium">使ってよい計量</th>
                <th className="px-3 py-2 text-left font-medium">原文の定義</th>
              </tr>
            </thead>
            <tbody>
              {SPECIAL_UNITS.map((u) => (
                <tr key={u.unit} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{u.unit}</td>
                  <td className="px-3 py-2">{u.use}</td>
                  <td className="px-3 py-2 text-muted">
                    {u.definition}
                    <span className="ml-1 whitespace-nowrap">（{u.grams}g）</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mb-3 text-xs text-muted">
          出典:{" "}
          <a
            href={UNIT_LAW_QUOTES.mommeUse.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            計量単位令（平成四年政令第三百五十七号）別表第六（第五条関係）
          </a>
          （e-Gov法令検索、{UNIT_LAW_CHECKED_AT}に確認）
        </p>
        <p className="mb-3 text-sm leading-relaxed text-foreground/80">
          認められているのは、匁は<strong>真珠</strong>、トロイオンスは<strong>金貨</strong>、カラットは
          <strong>宝石</strong>の計量です。金の地金やK18のネックレスはどれにも当たりません。つまり買取価格を「1匁いくら」として示すことは、取引の表示としてはできません。各社が例外なく1gあたりで出しているのには、この裏付けがあります。手元の品物の重さを匁で言うぶんには取引の計量ではないので、この換算ツールが役に立つのはそこです。
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          なお当ツールのトロイオンス換算には、国際的に使われている
          {ozGap.siteValue}gを採っています。上の表の{ozGap.lawValue}
          gとは末尾が違い、差は1トロイオンスあたり{ozGap.diffGrams.toFixed(7)}
          gです。1kgを換算しても差は{ozGap.diffPerKilogram.toFixed(6)}
          gにとどまるため金額には影響しませんが、桁を合わせて見比べたときに数字が食い違って見えるので書いておきます。
        </p>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif-jp mb-4 text-lg font-semibold">よくある質問</h2>
        <dl className="flex flex-col gap-5">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-sm text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-8 text-sm">
        <Link href="/simulator" className="text-accent-strong hover:underline">
          買取額シミュレーターで概算額を計算する →
        </Link>
      </p>
    </div>
  );
}
