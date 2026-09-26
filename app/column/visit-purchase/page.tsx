import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OtherColumns from "@/components/OtherColumns";
import RemoteBuyers from "@/components/RemoteBuyers";
import { articleJsonLd, columnBreadcrumb } from "@/lib/structuredData";
import { onlyVia, serviceCounts, visitBuyers, SERVICE_RECORDS } from "@/lib/services";
import { PURITY_LABELS } from "@/lib/types";
import rawCompanies from "@/data/companies.json";
import type { Company } from "@/lib/types";

export function generateMetadata(): Metadata {
  const n = serviceCounts();
  return {
    title: "出張買取の8日間 — 取り消せる場合と、取り消せない場合",
    description:
      `自宅に来てもらう出張買取は、特定商取引法の「訪問購入」にあたります。` +
      `書面を受け取った日から8日間のクーリング・オフと、品物を渡さないでいられる権利がつきますが、` +
      `条文には適用除外があり、頼み方によっては外れます。条文と消費者庁の記載を引いて整理し、` +
      `出張に対応していると確認できた${n.visit}社を単価順に並べました。`,
    alternates: { canonical: "/column/visit-purchase" },
  };
}

const CAA_VISIT = "https://www.no-trouble.caa.go.jp/what/doortodoorpurchases/";
const CAA_CASE = "https://www.no-trouble.caa.go.jp/case/doortodoorpurchases/case02.html";
const CAA_QA = "https://www.no-trouble.caa.go.jp/qa/exclusion.html";
const EGOV_LAW = "https://laws.e-gov.go.jp/law/351AC0000000057";

/** 本文で引く条文・記載を読んだ日 */
const READ_AT = "2026年9月26日";

function companyName(id: string): string {
  return (rawCompanies as Company[]).find((c) => c.id === id)?.name ?? id;
}

export default function VisitPurchasePage() {
  const n = serviceCounts();
  const buyers = visitBuyers("k24");
  const visitOnly = onlyVia("visit").map(companyName);
  const noVisit = SERVICE_RECORDS.filter((r) => !r.visit).map((r) => companyName(r.companyId));
  const nationwide = SERVICE_RECORDS.filter((r) => r.visit?.area === "全国").map((r) =>
    companyName(r.companyId),
  );
  const limited = SERVICE_RECORDS.filter((r) => r.visit?.area && r.visit.area !== "全国");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <JsonLd
        data={[
          articleJsonLd("/column/visit-purchase", generateMetadata()),
          columnBreadcrumb("/column/visit-purchase", generateMetadata()),
        ]}
      />
      <p className="mb-2 text-sm font-medium text-accent-strong">
        <Link href="/column" className="hover:underline">
          コラム
        </Link>
      </p>
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        出張買取の8日間 — 取り消せる場合と、取り消せない場合
      </h1>
      <p className="mb-8 text-base leading-relaxed text-muted">
        当サイトが価格を追っている{SERVICE_RECORDS.length}社のうち、{n.visit}
        社が自宅まで来る出張買取に対応していました。
        近くに店が無くても売れる方法ですが、店頭や宅配には無い法律が1本かかります。
        この法律は、売る人に「あとから取り消す」「品物を渡さないでおく」という2つの権利を与えます。
        ただし条文には適用除外があり、頼み方によっては外れます。
      </p>

      {/* ---- 要点 ---- */}
      <section className="mb-10">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold">先に結論</h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-foreground/80">
            <li>出張買取は特定商取引法の「訪問購入」にあたり、書面を受け取った日から8日間は契約を取り消せます</li>
            <li>その8日間は、契約したあとでも品物を渡さないでおけます。金は溶かされると戻りません</li>
            <li>
              ただし「自宅で契約したい」と自分から求めた場合、条文上はこの2つが適用除外になります。
              「まず査定をお願いします」と頼むのとは、扱いが変わりえます
            </li>
          </ul>
        </div>
      </section>

      {/* ---- 訪問購入とは ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">出張買取は「訪問購入」という枠に入る</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          消費者庁は訪問購入を次のように説明しています。
        </p>
        <blockquote className="mb-4 rounded-xl border-l-4 border-accent/40 bg-surface px-4 py-3 text-sm leading-relaxed">
          「訪問購入」とは、購入業者が、店舗等以外の場所（例えば、消費者の自宅等）で契約を締結等して行う物品の購入のことをいいます。
        </blockquote>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          店に持ち込む買取は店舗の中の取引なので、ここに入りません。宅配買取も訪問ではないので入りません。
          自宅に来てもらう出張買取だけが、この章の対象になります。
          もともとは貴金属の押し買い（断っても居座って安く買い取っていく手口）が問題になり、
          2013年の法改正で入った規制です。売ろうとしているものが金であるほど、関係が深い条文です。
        </p>
      </section>

      {/* ---- 8日間に何ができるか ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">8日間にできることが2つある</h2>

        <h3 className="mb-2 text-sm font-semibold">1. 契約を取り消せる（法58条の14）</h3>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          消費者庁の説明では、
          <span className="text-foreground">
            「法律で決められた書面を受け取った日から数えて8日以内」
          </span>
          であれば、書面または電磁的記録で申込みの撤回や契約の解除ができます。起算点は契約した日ではなく、
          <strong>書面を受け取った日</strong>です。代金を受け取ったあとでも返金して取り消せますし、
          違約金や損害賠償を請求されることはありません。
          「解約はできない」と書かれた紙に印を押していても、消費者庁は同じページで
          <span className="text-foreground">「クーリング・オフできない、といった特約は無効とされます」</span>
          としています。
        </p>

        <h3 className="mb-2 text-sm font-semibold">2. 品物を渡さないでおける（法58条の15）</h3>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          こちらのほうが、金を売る場面では効きます。消費者庁は
          <span className="text-foreground">
            「クーリング・オフ期間内は債務不履行に陥ることなく、事業者に対して契約対象である物品の引渡しを拒むことができます」
          </span>
          と書いています。契約してしまっても、8日のあいだは手元に置いておける、ということです。
          業者の側には、品物を受け取るその場で「渡さないでおけます」と告げる義務があります（法58条の9）。
        </p>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          なぜこれが重要かというと、取り消せても物が戻らない場合があるからです。消費者庁が載せている相談事例では、
          解約を申し出た消費者が業者からこう言われています。
        </p>
        <blockquote className="mb-4 rounded-xl border-l-4 border-accent/40 bg-surface px-4 py-3 text-sm leading-relaxed">
          「指輪はもうすでに別の事業者に売ってしまっており、溶かされていると思うのでそもそも返せない。」
        </blockquote>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          金やプラチナは溶かせば地金に戻り、その指輪は二度と戻りません。形見や結婚指輪なら、
          金額で取り返せるものでもない。渡すのを8日待てる権利は、そのための備えです。
        </p>
      </section>

      {/* ---- 外れる場合 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">「自分から呼んだ場合」の扱いに注意</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          ここが、このページで一番書いておきたいところです。上の2つは、いつでも付いてくるわけではありません。
          特定商取引法58条の17第2項は、次のように定めています。
        </p>
        <blockquote className="mb-4 rounded-xl border-l-4 border-accent/40 bg-surface px-4 py-3 text-sm leading-relaxed">
          第五十八条の六第一項及び第五十八条の七から前条までの規定は、次の訪問購入については、適用しない。
          一　その住居において売買契約の申込みをし又は売買契約を締結することを請求した者に対して行う訪問購入
        </blockquote>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          この「第五十八条の七から前条まで」の中に、8日間のクーリング・オフ（58条の14）も、
          引渡しを拒める権利（58条の15）も入っています。つまり
          <strong>「自宅で契約したい」と自分から求めた人には、この2つが適用されない</strong>
          と読める条文になっています。
        </p>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          では、出張買取を自分で申し込んだ時点で権利が消えるのか。そうとは限りません。
          消費者庁は「請求した者」の意味について、訪問販売の同じ表現（法26条6項1号）に関するQ&Aで、
          こう説明しています。
        </p>
        <blockquote className="mb-4 rounded-xl border-l-4 border-accent/40 bg-surface px-4 py-3 text-sm leading-relaxed">
          「請求した者」とは、購入者が契約の申込み又は締結をする意思をあらかじめ有し、その住居において当該契約の申込み又は締結を行いたい旨の明確な意思表示をした場合が該当します。
        </blockquote>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          単に来てもらうことを頼んだ、ではなく、
          <strong>あらかじめ売る意思があって、家で契約したいとはっきり言った場合</strong>
          という、かなり狭い読み方です。あわせて消費者庁は訪問購入のページで、勧誘の規制について
          <span className="text-foreground">
            「単に相手方から査定の依頼があった場合に、査定を超えて勧誘を行うことは、法に抵触することになります」
          </span>
          とも書いています。査定を頼むことと、契約を求めることは別だ、という整理です。
        </p>
        <div className="mb-4 rounded-xl border border-border bg-accent-soft/30 p-4">
          <p className="mb-2 text-sm font-semibold">申し込むときにできること</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-foreground/80">
            <li>申込フォームや電話では「まず査定をお願いします」と伝える。売ると決めた形にしない</li>
            <li>その場で決めない。金額を聞いてから考えると言ってよい</li>
            <li>契約したら、書面を必ず受け取る。8日はそこから数える</li>
            <li>納得できていないうちは品物を渡さない。渡さないでおけると告げる義務が業者側にある</li>
          </ul>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-muted">
          上の読み方は、条文と消費者庁の記載から当サイトが整理したものです。引用したQ&Aは訪問販売についてのもので、
          訪問購入の「請求した者」について同じ説明をした記載は、消費者庁のサイト内では見つけられませんでした。
          個別のケースがどちらに当たるかは、当サイトでは判断できません。困ったときは消費者ホットライン（188）や
          お住まいの消費生活センターにご相談ください。
        </p>
      </section>

      {/* ---- 対応社 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">出張買取に対応している{n.visit}社</h2>
        <p className="mb-2 text-sm leading-relaxed text-foreground/80">
          各社の公式サイトを読んで、出張買取の案内があることを確認できた社です（{READ_AT}時点）。
          {visitOnly.length > 0 && (
            <>
              このうち{visitOnly.join("・")}は、店頭も宅配も確認できず、出張でしか売れません。
            </>
          )}
        </p>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          逆に{noVisit.join("・")}の{noVisit.length}社は、出張の案内を確認できませんでした（
          対応していないという意味ではなく、当サイトが見たページに書かれていなかった、ということです）。
        </p>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          対応エリアは社ごとに違います。公式サイトに全国対応と明記していたのは
          {nationwide.join("・")}の{nationwide.length}社だけでした。
          {limited.map((r) => (
            <span key={r.companyId}>
              {companyName(r.companyId)}は{r.visit?.area}に限ると明記しています。
            </span>
          ))}
          残りの社は、どこまで来てくれるかを当サイトでは確認できていません。
          店舗から査定員が来る形の社もあり、その場合は近くに店が無い地域だと範囲外になることがあります。
        </p>
        <RemoteBuyers
          options={buyers}
          purityLabel={PURITY_LABELS.k24}
          source="column_visit"
          heading="出張買取に対応している店"
          lead={<>公式サイトで出張買取の案内を確認できた{buyers.length}社です。</>}
        />
      </section>

      {/* ---- 他の方法 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">他の売り方と比べる</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/80">
          出張は「人が家に来る」ぶん、上のような法律の保護が付きます。一方で、店に持ち込めばその場で現金になり、
          持ち帰るのも自由です。当サイトの掲載社でいえば、店頭{n.storefront}社、出張{n.visit}社、宅配{n.shipping}
          社が対応していました。どれが良いかは、住んでいる場所と、売る量と、急いでいるかで変わります。
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <Link href="/nearby" className="font-medium text-accent-strong hover:underline">
              近くの店舗を探す（店頭で売る）→
            </Link>
          </li>
          <li>
            <Link href="/column/fees" className="font-medium text-accent-strong hover:underline">
              手数料は、どこでいくら引かれるのか →
            </Link>
          </li>
          <li>
            <Link href="/column/multiple-quotes" className="font-medium text-accent-strong hover:underline">
              査定額を上げるコツ →
            </Link>
          </li>
        </ul>
      </section>

      {/* ---- 出典 ---- */}
      <section className="mb-10">
        <h2 className="font-serif-jp mb-3 text-lg font-semibold">出典</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted">
          <li>
            <a href={CAA_VISIT} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              訪問購入｜特定商取引法ガイド（消費者庁）
            </a>
          </li>
          <li>
            <a href={CAA_CASE} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              相談事例：解約を拒否され「もうすでに指輪は溶かしてしまった」と言われた（消費者庁）
            </a>
          </li>
          <li>
            <a href={CAA_QA} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              訪問販売等の適用除外に関するQ&A（消費者庁）
            </a>
          </li>
          <li>
            <a href={EGOV_LAW} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              特定商取引に関する法律（e-Gov法令検索）
            </a>
            ／第58条の4・第58条の9・第58条の14・第58条の15・第58条の17
          </li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          条文および各ページは{READ_AT}に読んだものです。法令や各社の案内は変わることがあります。
          このページは一般的な説明であり、個別の法律相談ではありません。
        </p>
      </section>

      <OtherColumns current="/column/visit-purchase" />
    </div>
  );
}
