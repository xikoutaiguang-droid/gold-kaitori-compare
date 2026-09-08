// GA4のgtag()はapp/layout.tsxでNEXT_PUBLIC_GA_MEASUREMENT_ID設定時のみ読み込まれる。
// 未設定環境(ローカル開発など)でも安全に呼べるよう、存在チェックしてから呼び出す。
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * 買取店への外部リンククリックを計測する。
 * - outbound_click: すべての外部リンククリック(アフィリエイト提携の有無に関わらず)。
 *   どの会社がよくクリックされているかが分かるので、提携申請の優先順位づけにも使える。
 * - affiliate_click: アフィリエイトリンク経由のクリックのみ(成果につながりうるクリック)。
 */
export function trackOutboundClick(params: {
  shopId: string;
  shopName: string;
  hasAffiliate: boolean;
  source: string;
}) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "outbound_click", {
    shop: params.shopId,
    shop_name: params.shopName,
    has_affiliate: params.hasAffiliate,
    source: params.source,
  });

  if (params.hasAffiliate) {
    window.gtag("event", "affiliate_click", {
      shop: params.shopId,
      shop_name: params.shopName,
      source: params.source,
    });
  }
}
