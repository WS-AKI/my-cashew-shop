import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAudienceFromEnv } from "@/lib/audience";
import { fetchProductsPublicForAudience } from "@/lib/products-fetch";
import type { Product } from "@/types";
import ProductsPageHeaderClient from "@/app/products/ProductsPageHeaderClient";
import ProductsCatalogClient from "@/app/products/ProductsCatalogClient";

/** ISR: 60 秒ごとに再取得。1000 人同時アクセスでも DB クエリは 1 分に 1 回。 */
export const revalidate = 60;

export default async function ProductsPage() {
  const audience = getAudienceFromEnv();

  let initialProducts: Product[] | undefined;
  let productsLoadError: string | undefined;
  try {
    initialProducts = await fetchProductsPublicForAudience(audience);
  } catch (err) {
    productsLoadError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* 見出し・説明・ナビは Client Component で言語切り替え対応 */}
        <ProductsPageHeaderClient />

        <ProductsCatalogClient
          products={initialProducts ?? []}
          audience={audience}
          productsLoadError={productsLoadError}
        />
      </main>
      <Footer />
    </div>
  );
}
