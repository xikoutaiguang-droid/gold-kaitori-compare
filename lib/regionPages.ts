import type { Region } from "@/lib/types";

export interface RegionPageConfig {
  slug: string;
  region: Region;
  label: string;
  intro: string;
}

// 「全国」は既存の/compareページがカバーするため対象外。
// 地域ごとに導入文を書き分け、内容が重複しないようにしている
// (会社一覧を絞り込むだけのページはGoogleに低品質な重複コンテンツと
//  判断されるリスクがあるため)。
export const REGION_PAGES: RegionPageConfig[] = [
  {
    slug: "hokkaido",
    region: "北海道",
    label: "北海道",
    intro:
      "北海道は店舗網が本州ほど密ではないため、店頭買取に加えて宅配買取・出張買取を軸に検討する人が多い地域です。全国チェーンの多くが宅配買取に対応しているので、近くに店舗がなくても比較検討できます。",
  },
  {
    slug: "tohoku",
    region: "東北",
    label: "東北",
    intro:
      "東北エリアは仙台など主要都市に店舗が集中する傾向があります。お住まいの地域に店舗がない場合は、下記の「近くの買取店」機能や宅配買取の利用も検討してみてください。",
  },
  {
    slug: "kanto",
    region: "関東",
    label: "関東",
    intro:
      "関東は東京を中心に最も店舗数が多く、競合も激しいエリアです。同じ会社でも店舗によって査定士の対応や柔軟さが異なることがあるため、価格だけでなく口コミ評価も参考にすることをおすすめします。",
  },
  {
    slug: "chubu",
    region: "中部",
    label: "中部",
    intro:
      "中部エリアは名古屋を中心に大手チェーンの店舗が揃っています。コメ兵など中部発祥の老舗チェーンも含め、比較的選択肢の多い地域です。",
  },
  {
    slug: "tokai",
    region: "東海",
    label: "東海",
    intro:
      "東海エリアは中部と店舗網が重なる会社も多く、静岡・三重方面にも対応している買取店があります。地域限定のチェーンも含めて比較してみてください。",
  },
  {
    slug: "kansai",
    region: "近畿",
    label: "近畿(関西)",
    intro:
      "掲載社のうち、大阪に店舗があるのはリファスタ(心斎橋)・ゴールドミセス・ネクサス(十三)・まねきや(あべの)など、関西に4店舗あるのがゴールドプラザ、大阪・神戸に店舗があるのがギャラリーレアです。京都府内に店舗があるかは社ごとに違うため、各社の店舗一覧で確かめてください。",
  },
  {
    slug: "chugoku",
    region: "中国",
    label: "中国",
    intro:
      "掲載社のうち中国地方に対応しているのは、全国対応の社のほか、買取エリート・キングラム・まねきやなどです。近くに店舗が無い場合は、宅配買取に対応している社も候補になります。",
  },
  {
    slug: "shikoku",
    region: "四国",
    label: "四国",
    intro:
      "四国は他地域に比べて店舗数がやや少なめですが、宅配買取であれば全国チェーンの多くが対応しています。店頭・宅配の両方で比較してみてください。",
  },
  {
    slug: "kyushu-okinawa",
    region: "九州・沖縄",
    label: "九州・沖縄",
    intro:
      "福岡を中心に店舗が集まるエリアです。沖縄など離島部は店舗が限られるため、宅配買取の活用もあわせて検討することをおすすめします。",
  },
];

export function getRegionPageBySlug(slug: string): RegionPageConfig | undefined {
  return REGION_PAGES.find((r) => r.slug === slug);
}

/** 会社データの対応地域から、その地域のページを引く。「全国」には個別ページが無い。 */
export function getRegionPageByRegion(region: Region): RegionPageConfig | undefined {
  return REGION_PAGES.find((r) => r.region === region);
}
