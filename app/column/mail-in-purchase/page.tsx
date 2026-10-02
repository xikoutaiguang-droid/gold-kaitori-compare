import type { Metadata } from "next";
import Link from "next/link";
import MethodTabs from "@/components/MethodTabs";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import RemoteBuyers from "@/components/RemoteBuyers";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import { onlyVia, serviceCounts, shippingBuyers, SERVICE_RECORDS } from "@/lib/services";
import { FEE_DISCLOSURES } from "@/lib/fees";
import { PURITY_LABELS } from "@/lib/types";
import rawCompanies from "@/data/companies.json";
import type { Company } from "@/lib/types";

export function generateMetadata(): Metadata {
  const n = serviceCounts();
  return {
    title: "金の宅配買取で、送る前に確かめる3つのこと",
    description:
      `送るだけで売れる宅配買取は、掲載25社のうち${n.shipping}社が対応しています。` +
      `ただし8日間のクーリング・オフが付くのは「訪問購入」だけで、自分で送る宅配買取はそこに入りません。` +
      `返してもらえるか、返送料は誰が払うか、少額だと手数料が引かれないか。各社の記載を引用して並べました。`,
    alternates: { canonical: "/column/mail-in-purchase" },
  };
}

const KOKUSEN = "https://www.kokusen.go.jp/soudan_now/data/coolingoff.html";
const CAA_VISIT = "https://www.no-trouble.caa.go.jp/what/doortodoorpurchases/";

/** 本文で引いた記載を読んだ日 */
const READ_AT = "2026年10月2日";

function companyName(id: string): string {
  return (rawCompanies as Company[]).find((c) => c.id === id)?.name ?? id;
}

export default function MailInPurchasePage() {
  const n = serviceCounts();
  const buyers = shippingBuyers("k24");
  const shippingOnly = onlyVia("shipping").map(companyName);
  const noShipping = SERVICE_RECORDS.filter((r) => !r.shipping).map((r) => companyName(r.companyId));

  // 宅配のときだけ引かれると書いている社。手数料の調査で見つかったもの
  const deductedOnShipping = FEE_DISCLOSURES.filter(
    (d) => d.model === "deducted" && d.condition?.includes("宅配"),
  );
  // 引かれるものはないと明記している社のうち、宅配に対応している社
  const freeIds = new Set(buyers.map((b) => b.id));
  const freeOnShipping = FEE_DISCLOSURES.filter((d) => d.model === "free" && freeIds.has(d.companyId));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd
        data={[
          articleJsonLd("/column/mail-in-purchase", generateMetadata()),
          columnBreadcrumb("/column/mail-in-purchase", generateMetadata()),
        ]}
      />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        金の宅配買取で、送る前に確かめる3つのこと
      </h1>
      <MethodTabs current="/column/mail-in-purchase" />
      <p className="mb-8 text-base leading-relaxed text-muted">
        当サイトが価格を追っている{SERVICE_RECORDS.length}社のうち、{n.shipping}
        社が宅配買取に対応していました。箱に詰めて送るだけで、店に行かずに売れます。
        ただし、家まで来てもらう出張買取には付く「8日間の取り消し」が、宅配買取には付きません。
        品物が手元を離れたあとで頼れるのは、法律ではなく各社が自分で決めた条件です。
      </p>

      {/* ---- 法律 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">
          クーリング・オフが付く買取は「訪問購入」だけ
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          国民生活センターは、8日間のクーリング・オフができる取引として次の4つを挙げています。
        </p>
        <blockquote className="mb-4 rounded-xl border-l-4 border-accent/40 bg-surface px-4 py-3 text-sm leading-relaxed">
          訪問販売（キャッチセールス、アポイントメントセールス等を含む）／電話勧誘販売／特定継続的役務提供／
          <strong>訪問購入（業者が消費者の自宅等を訪ねて、商品の買い取りを行うもの）</strong>
        </blockquote>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          買取で入っているのは<strong>訪問購入だけ</strong>です。その訪問購入について、消費者庁はこう説明しています。
        </p>
        <blockquote className="mb-4 rounded-xl border-l-4 border-accent/40 bg-surface px-4 py-3 text-sm leading-relaxed">
          「訪問購入」とは、購入業者が、店舗等以外の場所（例えば、消費者の自宅等）で契約を締結等して行う物品の購入のことをいいます。
        </blockquote>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          自分で箱に詰めて送る宅配買取は、業者が訪ねてくる取引ではないので、ここに当たりません。
          同じ一覧に<strong>「通信販売には、クーリング・オフ制度はありません。」</strong>とも書かれています。
          つまり宅配買取では、<strong>送ったあとに「やっぱり返して」と言える権利が、法律では用意されていません</strong>。
        </p>
        <p className="mb-4 text-xs leading-relaxed text-muted">
          これは引用した2つの記載から当サイトが整理したものです。個別のケースがどう扱われるかは当サイトでは判断できません。
          困ったときは消費者ホットライン（188）やお住まいの消費生活センターにご相談ください。
          家まで来てもらう場合の扱いは
          <Link href="/column/visit-purchase" className="underline underline-offset-2 hover:text-accent">
            出張買取の記事
          </Link>
          にまとめています。
        </p>
      </section>

      {/* ---- 3つ ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">だから、送る前にこの3つを見る</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-foreground/80">
          <li>金額に納得できなかったとき、返してもらえるか</li>
          <li>その返送料は、どちらが払うか</li>
          <li>少額だと、支払額から何か引かれないか</li>
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          3つめは見落とされがちですが、当サイトが各社の利用規約まで読んだところ、
          <strong>宅配買取のときだけ、金額が小さいと差し引く</strong>と決めている社がありました。
        </p>
      </section>

      {/* ---- 少額だと引かれる社 ---- */}
      {deductedOnShipping.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">
            少額の宅配だと、支払額から引く社がある
          </h2>
          <div className="flex flex-col gap-4">
            {deductedOnShipping.map((d) => (
              <div
                key={d.companyId}
                className="rounded-xl border border-amber-500/40 bg-amber-50/60 p-4 dark:bg-amber-950/20"
              >
                <Link href={`/company/${d.companyId}`} className="font-semibold hover:underline">
                  {companyName(d.companyId)}
                </Link>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">{d.condition}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  同社の
                  <a
                    href={d.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    規約・注意事項
                  </a>
                  より。
                  {d.contrast && <>価格ページには「{d.contrast.quote}」とあります。どちらも同社の記載です。</>}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/80">
            どちらも、ブランド品ではない貴金属を、少額で、宅配で送る場合の話です。
            金のネックレスを1本売る、という最も多いであろう売り方がそのまま当てはまります。
            店頭に持ち込む場合は対象外と書かれています。
          </p>
        </section>
      )}

      {/* ---- 引かれないと明記している社 ---- */}
      {freeOnShipping.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif-jp mb-3 text-lg font-semibold">引かれるものはない、と書いている社</h2>
          <p className="mb-3 text-sm leading-relaxed text-foreground/80">
            逆に、はっきり書いている社もあります。文言はそのまま引いています。
          </p>
          <ul className="flex flex-col gap-3">
            {freeOnShipping.map((d) => (
              <li key={d.companyId} className="rounded-xl border border-border bg-surface p-3.5">
                <Link href={`/company/${d.companyId}`} className="text-sm font-semibold hover:underline">
                  {companyName(d.companyId)}
                </Link>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">「{d.quote}」</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- 返送とキャンセル ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">返してもらうときの条件は社ごとに違う</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          返送料を会社が持つのか、こちらが着払いで払うのか。ここは各社がそれぞれ決めています。
          たとえばリファスタは、よくある質問でこう書いています。
        </p>
        <blockquote className="mb-4 rounded-xl border-l-4 border-accent/40 bg-surface px-4 py-3 text-sm leading-relaxed">
          査定後のキャンセル料、返送料は無料。返却は一部、全品どちらも対応しております。なお、お送りいただいたお品物すべてにお値段が付かなかった場合のみ着払いにて返送いたしております。
        </blockquote>
        <p className="text-sm leading-relaxed text-foreground/80">
          「値段が付かなかった場合だけ着払い」という線引きです。
          条件のある社とない社があるので、送る前にその社のページで確かめてください。
        </p>
      </section>

      {/* ---- 本人確認 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">送ってすぐお金が入るわけではない</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          古物の買取では本人確認が要ります。対面でないぶん、宅配ではその手続きが先に来ます。
          リファスタの利用規約にはこうあります。
        </p>
        <blockquote className="mb-4 rounded-xl border-l-4 border-accent/40 bg-surface px-4 py-3 text-sm leading-relaxed">
          eKYC手続きが完了するまでの間、お品物の査定及び買取代金のお振込みを行うことができません。
        </blockquote>
        <p className="text-sm leading-relaxed text-foreground/80">
          身分証の撮影と顔写真の送信を済ませるまで、査定も振込も始まらないということです。
          急いで現金化したい場合は、この時間も含めて考えておくほうが確実です。
          その日に現金が要るなら、店頭に持ち込むほうが早いことになります。
        </p>
      </section>

      {/* ---- 対応社 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">宅配買取に対応している{n.shipping}社</h2>
        <p className="mb-2 text-sm leading-relaxed text-foreground/80">
          各社の公式サイトを読んで、宅配買取の案内があることを確認できた社です（{READ_AT}時点）。
          {shippingOnly.length > 0 && (
            <>このうち{shippingOnly.join("・")}は実店舗を持たず、宅配でしか売れません。</>
          )}
        </p>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          {noShipping.join("・")}の{noShipping.length}
          社は、宅配の案内を確認できませんでした（対応していないという意味ではなく、
          当サイトが見たページに書かれていなかった、ということです）。
        </p>
        <RemoteBuyers
          options={buyers}
          purityLabel={PURITY_LABELS.k24}
          source="column_mailin"
          heading="宅配買取に対応している店"
          lead={<>公式サイトで宅配買取の案内を確認できた{buyers.length}社です。</>}
        />
      </section>

      {/* ---- 他の方法 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">他の売り方と比べる</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          掲載社でいえば、店頭{n.storefront}社、出張{n.visit}社、宅配{n.shipping}社が対応していました。
          宅配は店に行かずに済む代わりに、品物が手元を離れている時間が長く、取り消しの権利もありません。
          急ぐなら店頭、量が多いなら出張、近くに店が無いなら宅配、という選び方になります。
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <Link href="/nearby" className="font-medium text-accent-strong hover:underline">
              近くの店舗を探す（店頭で売る）→
            </Link>
          </li>
          <li>
            <Link href="/column/visit-purchase" className="font-medium text-accent-strong hover:underline">
              出張買取の8日間 — 取り消せる場合と、取り消せない場合 →
            </Link>
          </li>
          <li>
            <Link href="/column/fees" className="font-medium text-accent-strong hover:underline">
              手数料は、どこでいくら引かれるのか →
            </Link>
          </li>
        </ul>
      </section>

      {/* ---- 出典 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">出典</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted">
          <li>
            <a href={KOKUSEN} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              クーリング・オフ（国民生活センター）
            </a>
          </li>
          <li>
            <a href={CAA_VISIT} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              訪問購入｜特定商取引法ガイド（消費者庁）
            </a>
          </li>
          <li>各社の利用規約・よくある質問・宅配買取の案内（引用ごとにリンクと閲覧日を併記）</li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          引用はいずれも、取得したHTMLに同じ文字列があることを1件ずつ確認しています。
          記載は予告なく変わるため、送る前にご自身でもお確かめください。
          このページは一般的な説明であり、個別の法律相談ではありません。
        </p>
      </section>

      <OtherColumns current="/column/mail-in-purchase" />
    </div>
  );
}
