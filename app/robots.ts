import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/shop-config";

/**
 * Google Search Console 等向けの robots.txt。
 * 全クローラーに公開ページを許可し、sitemap の場所を明示して巡回を促進する。
 */
export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/checkout", "/order-success", "/track", "/cart", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
