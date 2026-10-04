import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";

/**
 * クロールは全部許可している。
 *
 * AIの回答エンジン向けのクローラ(ChatGPT・Claude・Perplexity・Googleの学習用など)を
 * 名前で並べているのは、禁止するためではなく、許可が成り行きではないことを
 * はっきりさせるため。当サイトの中身は各社の公表値と法令の原文を突き合わせたもので、
 * 回答に引かれて出典として示されることは、こちらの目的と矛盾しない。
 *
 * 当サイト自身が他社のサイトを取得する側でもあるので、相手のrobots.txtに従うのと
 * 同じように、こちらの意思もこの1枚に書いておく。
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
