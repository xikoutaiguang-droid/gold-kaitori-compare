import type { Metadata } from "next";
import Link from "next/link";
import { measureWeekend } from "@/lib/weekendPrices";
import JsonLd from "@/components/JsonLd";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import OtherColumns from "@/components/OtherColumns";

const PATH = "/column/weekend";

// 見出しの数字も測った結果から作る。記録が伸びれば日曜が0%でなくなる日も来るので、
// 「日曜は動かない」と決め打ちで書かない。
export function generateMetadata(): Metadata {
  const m = measureWeekend("k24");
  if (!m) {
    return {
      title: "土日に金を売ると損をするのか",
      description:
        "土日に各社の買取価格がどう動くかを、毎日記録している価格から測ります。",
      alternates: { canonical: PATH },
    };
  }
  const sun = m.sundayChangedPct;
  const title =
    sun === 0
      ? "日曜は、どの店も金の買取価格を1円も変えていない"
      : `日曜に買取価格を変える店は${sun}%しかない`;
  return {
    title,
    description:
      `掲載社の公表買取価格を${m.days}日間記録し、曜日ごとに測りました。` +
      `前日と違う値を出した社の割合は、平日が${m.weekdayChangedPct}%、土曜が${m.saturdayChangedPct}%、` +
      `日曜が${sun}%です。土日に表示されている単価がいつのものか、週明けにどれだけ動くかをまとめています。`,
    alternates: { canonical: PATH },
  };
}

function jaDate(iso: string): string {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!d) return iso;
  const w = ["日", "月", "火", "水", "木", "金", "土"][new Date(`${iso}T00:00:00+09:00`).getDay()];
  return `${Number(d[2])}月${Number(d[3])}日(${w})`;
}

const pct = (v: number | null) => (v === null ? "—" : `${v}%`);
const signed = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

export default function WeekendPage() {
  const m = measureWeekend("k24");

  if (!m) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-muted">
          曜日ごとに比べられるだけの記録がまだ足りないため、この記事を一時的に出していません。
          各社の価格を毎日記録しているので、日数がたまり次第また出します。
        </p>
      </div>
    );
  }

  const meta = generateMetadata();
  const weekdayDays = m.byDay.filter((d) => !"土日".includes(d.day));
  const maxPublishing = Math.max(...m.byDay.map((d) => d.publishing));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd data={[articleJsonLd(PATH, meta), columnBreadcrumb(PATH, meta)]} />

      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>

      <h1 className="font-serif-jp mb-3 text-2xl font-semibold leading-snug sm:text-3xl">
        {String(meta.title)}
      </h1>

      <p className="mb-8 text-base leading-relaxed">
        土日に売ると損をするのか、という疑問があります。
        各社の公式サイトを見ても、そこに出ているのは今日の数字だけなので答えは出ません。
        掲載社の価格を{m.days}日ぶん記録してあるので、曜日ごとに測りました。
      </p>

      {/* ---- 1. 日曜 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">日曜は、値段が止まっています</h2>
        <div className="mb-4 rounded-xl border border-accent/30 bg-accent-soft/40 p-4">
          <p className="text-sm text-muted">前日と1円でも違う値を出した社の割合</p>
          <dl className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            {[
              { k: "平日(月〜金)", v: m.weekdayChangedPct },
              { k: "土曜", v: m.saturdayChangedPct },
              { k: "日曜", v: m.sundayChangedPct },
            ].map((row) => (
              <div key={row.k} className="flex items-baseline gap-2">
                <dt className="text-sm text-muted">{row.k}</dt>
                <dd className="text-2xl font-bold tabular-nums text-accent-strong">{pct(row.v)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mb-3 text-base leading-relaxed">
          {m.sundayChangedPct === 0 ? (
            <>
              日曜は<strong>0%</strong>でした。記録している{m.byDay.find((d) => d.day === "日")?.changedSamples}回の日曜のすべてで、
              価格を公表している社のどこも、土曜から1円も動かしていません。
              「日曜に様子を見る」ことに意味はない、ということです。
            </>
          ) : (
            <>
              日曜に値を変える社は{pct(m.sundayChangedPct)}しかありませんでした。平日の
              {pct(m.weekdayChangedPct)}と比べると、日曜はほぼ止まっているとみてよさそうです。
            </>
          )}
        </p>
        <p className="text-base leading-relaxed">
          一方で<strong>土曜は{pct(m.saturdayChangedPct)}</strong>の社が金曜と違う値を出しています。
          土日をひとまとめに「動かない」と考えると、土曜のぶんを取りこぼします。
        </p>
      </section>

      {/* ---- 2. なぜ止まるのか(一次情報) ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">止まっている理由は、基準が出ないからです</h2>
        <p className="mb-3 text-base leading-relaxed">
          各社が単価を決めるときの目安になっている田中貴金属の地金価格が、土日・祝日には更新されません。
          同社のページにこう書かれています。
        </p>
        <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          <p>「※前日比は、土日・祝日を除く前営業日の9:30の価格と比較して算出しています。」</p>
          <p className="mt-2">「※土日・祝日の地金価格は、マーケット市況情報をご参照ください。」</p>
          <footer className="mt-2 text-xs text-muted">
            出典:{" "}
            <a
              href="https://gold.tanaka.co.jp/commodity/souba/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-2"
            >
              田中貴金属「貴金属価格情報」
            </a>
            （当サイトが{jaDate(m.lastDate)}に確認）
          </footer>
        </blockquote>
        <p className="text-base leading-relaxed">
          つまり土日に見えている数字は、金曜に出た基準のまま置かれているものです。
          各社が公表している社数そのものも、土日は減ります。
        </p>
      </section>

      {/* ---- 3. 曜日ごとの表 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">曜日ごとの記録</h2>
        <ul className="border-y border-border divide-y divide-border/60">
          {m.byDay.map((d) => {
            const quiet = d.day === "日" || d.day === "土";
            return (
              <li key={d.day} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5">
                <span className={`w-8 shrink-0 text-sm ${quiet ? "font-semibold text-accent-strong" : ""}`}>
                  {d.day}
                </span>
                <span className="flex grow items-center gap-2">
                  <span
                    className="h-2 rounded-full bg-accent/60"
                    style={{ width: `${Math.round((d.publishing / maxPublishing) * 100)}%` }}
                  />
                </span>
                <span className="shrink-0 text-right text-sm tabular-nums">
                  {d.publishing.toFixed(1)}
                  <span className="ml-0.5 text-xs text-muted">社が公表</span>
                </span>
                <span className="w-full text-right text-xs tabular-nums text-muted sm:w-28">
                  値を変えた社 {pct(d.changedPct)}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          「公表」は、その日の日付で価格を出していた社の平均です。平日は
          {Math.min(...weekdayDays.map((d) => d.publishing)).toFixed(1)}〜
          {Math.max(...weekdayDays.map((d) => d.publishing)).toFixed(1)}社、
          土曜は{m.byDay.find((d) => d.day === "土")?.publishing.toFixed(1)}社、
          日曜は{m.byDay.find((d) => d.day === "日")?.publishing.toFixed(1)}社でした。
          出していない社は、前の営業日の値がそのまま置かれています。
        </p>
      </section>

      {/* ---- 4. 週明け ---- */}
      {m.weekendGaps.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">動かなかったぶんは、月曜にまとめて出ます</h2>
          <p className="mb-3 text-base leading-relaxed">
            値が止まっていても、世界の金相場は動いています。
            金曜から翌月曜までに、掲載社の単価がどれだけ変わったかを記録から拾いました。
          </p>
          <ul className="mb-3 border-y border-border divide-y divide-border/60">
            {m.weekendGaps.map((g) => (
              <li key={g.from} className="flex flex-wrap items-baseline gap-x-3 py-2.5 text-sm">
                <span className="grow">
                  {jaDate(g.from)} → {jaDate(g.to)}
                </span>
                <span
                  className={`shrink-0 font-semibold tabular-nums ${
                    g.pct > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/80"
                  }`}
                >
                  {signed(g.pct)}
                </span>
                <span className="w-full text-right text-xs text-muted sm:w-20">{g.companies}社の中央値</span>
              </li>
            ))}
          </ul>
          {m.largestGap && Math.abs(m.largestGap.pct) > 0 && (
            <p className="text-base leading-relaxed">
              いちばん大きかったのは{jaDate(m.largestGap.from)}から{jaDate(m.largestGap.to)}の
              <strong className="mx-1 tabular-nums">{signed(m.largestGap.pct)}</strong>です。
              土日の2日ぶんが週明けに一度に乗るので、平日1日ぶんより大きく動くことがあります。
            </p>
          )}
        </section>
      )}

      {/* ---- 5. 送る場合 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">送って売る場合は、着いた日の値段になることがあります</h2>
        <p className="mb-3 text-base leading-relaxed">
          店頭に持ち込むなら、その場の金額を見てから決められます。
          宅配買取は、申し込んだ日ではなく品物が届いた日の価格で査定すると書いている社があります。
        </p>
        <blockquote className="mb-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          <p>「宅配買取をご利用の場合、到着日の買取価格で査定致します。」</p>
          <footer className="mt-2 text-xs text-muted">
            出典:{" "}
            <a
              href="https://www.nexus13.co.jp/buy2/notice.php"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-2"
            >
              ネクサス「宅配買取の注意事項」
            </a>
            （当サイトが{jaDate(m.lastDate)}に確認）
          </footer>
        </blockquote>
        <p className="mb-3 text-base leading-relaxed">
          金曜の夕方に出すと、着くのは週明けになります。
          そのあいだに上の表のぶんだけ動いていることがある、ということです。
          どの日の価格を使うかは店によって違うので、送る前にその社の記載を確かめてください。
          返送料や少額のときの差し引きは
          <Link href="/column/mail-in-purchase" className="mx-1 underline underline-offset-2 hover:text-accent">
            宅配買取の記事
          </Link>
          にまとめています。
        </p>
        <p className="text-base leading-relaxed">
          なお、どの曜日に売るかより、どの店に売るかのほうが金額を動かすことが多いです。
          これも記録から測っていて、
          <Link href="/column/timing-vs-shop" className="mx-1 underline underline-offset-2 hover:text-accent">
            売る日と売る店、どちらが金額を動かすのか
          </Link>
          で比べています。今日の各社の順位は
          <Link href="/compare" className="mx-1 underline underline-offset-2 hover:text-accent">
            相場比較
          </Link>
          で見られます。
        </p>
      </section>

      <section className="mb-10 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-serif-jp mb-2 text-base font-semibold">この記録について</h2>
        <p className="text-xs leading-relaxed text-muted">
          各社が公式サイトで公表している買取参考価格を、当サイトが毎日くりかえし取得して記録したものです。
          期間は{jaDate(m.firstDate)}から{jaDate(m.lastDate)}までの{m.days}日ぶんで、
          日付はその社が価格を公表した日です。
          「値を変えた社の割合」は、前日と当日の両方で価格を取れた社だけで数えています。
          記録が飛んだ区間は前日比にならないため除いています。
          買取店の公式サイトは自社の当日の価格しか載せないので、曜日ごとの比較は記録している側でしか作れません。
          数字はページを作るたびに最新の記録から計算し直しています。
        </p>
      </section>

      <OtherColumns current={PATH} />
    </div>
  );
}
