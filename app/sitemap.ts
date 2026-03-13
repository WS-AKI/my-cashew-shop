import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/shop-config";

/**
 * Google Search Console 用の sitemap。
 * NEXT_PUBLIC_SITE_URL（ビルド時環境変数）を base URL に使用する。
 * cashew-ja.pages.dev と cashew-th.pages.dev はそれぞれ独立してビルドされるため、
 * 各プロジェクトの NEXT_PUBLIC_SITE_URL に本番 URL を設定すれば別々にインデックスされる。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "");

  const routes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/shipping`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  return routes;
}

