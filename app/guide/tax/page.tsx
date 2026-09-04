import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "金・貴金属を売ったときの税金｜イラストでやさしく解説",
  description:
    "金やプラチナを売却したときに税金がかかるかどうかを、イラスト付きでやさしく解説。生活用動産の非課税ルール、30万円超の例外、インゴット(地金)の譲渡所得、200万円超の支払調書などをまとめました。",
  alternates: { canonical: "/guide/tax" },
};

const faq = [
  {
    q: "指輪やネックレスを売っても税金はかかりますか？",
    a: "普段使っていたアクセサリーなど「生活用動産」の売却は、原則として税金がかかりません。フリマアプリで不要な服を売るのと同じ考え方です。",
  },
  {
    q: "インゴット(地金)を売る場合はどうですか？",
    a: "資産として保有していたインゴットは生活用動産に当たらないとされることが多く、売却益(譲渡所得)が出ると課税対象になる場合があります。5年を超えて保有していた場合は税負担が軽くなる仕組みもあります。",
  },
  {
    q: "買取店で身分証の提示を求められるのはなぜですか？",
    a: "貴金属を1回あたり200万円を超えて買い取った業者は、税務署へ「支払調書」を提出する決まりがあります。本人確認はその法律上のルールに基づくもので、怪しまれているわけではありません。",
  },
];

export default function TaxGuidePage() {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="font-serif-jp mb-2 text-xl font-semibold sm:text-2xl">
        金・貴金属を売ったときの税金について
      </h1>
      <p className="mb-6 text-base leading-relaxed text-muted">
        「税金がかかるのでは」と気になって一歩を踏み出せない方も多いテーマです。
        専門用語をできるだけ使わず、身近な例でやさしく説明します。
      </p>

      <div className="mb-8 rounded-2xl border border-accent/30 bg-accent-soft/60 p-4 text-sm leading-relaxed text-foreground/80 sm:mb-10 sm:p-5">
        このページは一般的な考え方をまとめた参考情報です。個別の税務判断はできませんので、
        金額や状況によって迷う場合は税務署や税理士にご確認ください。
      </div>

      <div className="flex flex-col gap-5 sm:gap-6">
        <GuideCard icon={<RingIcon />} title="基本は「非課税」です">
          普段使っていた指輪やネックレスなど、生活のために持っていたもの(「生活用動産」といいます)を
          売った場合は、原則として税金はかかりません。着なくなった服をフリマアプリで売るのと
          同じ考え方です。
        </GuideCard>

        <GuideCard icon={<TagIcon />} title="例外: 1点30万円を超える貴金属・宝石">
          ただし、1個(1組)の価格が30万円を超える貴金属・宝石・骨とう品などは、この非課税の
          対象から外れるという決まりがあります。大粒の宝石や高額なジュエリーが該当することがあります。
        </GuideCard>

        <GuideCard icon={<BarIcon />} title="インゴット(地金)は「資産」として扱われやすい">
          資産として保有していたインゴットを売る場合は、生活用動産ではなく「譲渡所得」として
          税金の対象になることが多いです。売却額から取得費用や特別控除(50万円)を差し引いて
          プラスが残る場合に課税されます。5年を超えて保有していたものは税負担が軽くなる仕組みもあります。
        </GuideCard>

        <GuideCard icon={<IdCardIcon />} title="200万円を超える取引は本人確認・税務署への報告あり">
          買取業者は、貴金属を1回あたり200万円を超えて買い取ったとき、税務署へ「支払調書」を
          提出する決まりになっています。高額査定の際に身分証の提示を求められるのは、怪しまれて
          いるからではなく、このルールに沿った手続きです。
        </GuideCard>

        <GuideCard icon={<ChatIcon />} title="申告が必要か迷ったら">
          会社員の方は、給与以外の所得(譲渡所得を含む)が年間20万円を超えると確定申告が
          必要になる場合があります。金額や状況によって判断が変わるため、迷ったときは
          お近くの税務署や税理士に相談するのが確実です。
        </GuideCard>
      </div>

      <p className="mt-8 text-sm text-muted">
        より正確な内容は
        <a
          href="https://www.nta.go.jp/"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-1 text-accent-strong hover:underline"
        >
          国税庁ホームページ
        </a>
        でもご確認いただけます。
      </p>

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
          ← 買取額シミュレーターに戻る
        </Link>
      </p>
    </div>
  );
}

function GuideCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">{children}</p>
      </div>
    </div>
  );
}

function RingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="15" r="5.5" />
      <path d="M8 9.5 10 4l2 5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 12.5 19 15l-3.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M11 4h6a2 2 0 0 1 2 2v6a2 2 0 0 1-.6 1.4l-8 8a2 2 0 0 1-2.8 0l-5-5a2 2 0 0 1 0-2.8l8-8A2 2 0 0 1 11 4Z"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none" />
      <path d="M12 20v-3M12 15.5h.01" strokeLinecap="round" />
    </svg>
  );
}

function BarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 8h9l3 3v6H9l-3-3Z" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M6 8v6M9 8v6" strokeLinecap="round" />
    </svg>
  );
}

function IdCardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="8" cy="12" r="1.8" />
      <path d="M13 10h5M13 14h5" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M4 5h16v11H9l-4 3.5V16H4Z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M8 9h8M8 12h5" strokeLinecap="round" />
    </svg>
  );
}
