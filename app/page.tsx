import { Suspense } from "react";
import type { Metadata } from "next";
import { Leaf, Truck, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarouselDynamic from "@/components/home/HeroCarouselDynamic";
import AnnouncementPopup from "@/components/home/AnnouncementPopup";
import HeroTextClient from "@/app/_components/HeroTextClient";
import ProductsGrid from "@/app/_components/ProductsGrid";
import ProductsGridSkeleton from "@/app/_components/ProductsGridSkeleton";
import { getAudienceFromEnv } from "@/lib/audience";
import { getSupabaseAnonClient } from "@/lib/supabase/anon-client";
import { fetchProductsPublicForAudience } from "@/lib/products-fetch";
import type { Product } from "@/types";

/**
 * ISR: 60 秒ごとに Supabase を再取得。
 * 1000 人同時アクセスでも DB クエリは最大 1 分に 2 回。
 * runtime = "edge" は Swiper で TypeError になるため使わない（API のみ）。
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Samsian Cashew Nuts - タイ産高級カシューナッツ / Premium Thai Cashews",
  description:
    "タイ・ウタラディット産の高品質カシューナッツを産地直送。Samsian Cashew Nuts 公式ストアで、単品・セット・VIP特典をチェック。",
  openGraph: {
    title: "Samsian Cashew Nuts - タイ産高級カシューナッツ / Premium Thai Cashews",
    description:
      "From Uttaradit, Thailand. Premium roasted cashews for Japan & Thailand customers.",
    images: [
      // TODO: 後で本番用 OGP 画像へ差し替え
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Samsian Cashew Nuts" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Samsian Cashew Nuts - Premium Thai Cashews",
    description: "Premium roasted Thai cashews with bilingual shopping support.",
    images: ["/og-image.jpg"],
  },
};

const PAGE_TEXT = {
  ja: {
    heroTitle1: "タイ・ウタラディット県の大地で、",
    heroTitle2: "大切に育てました。",
    heroSub:
      "豊かな自然と温かい気候に恵まれたウタラディットの大地で育ったカシューナッツを、産地直送でお届けします。一度食べたら忘れられない、本物の味をぜひ。",
    cta: "商品を見る",
    ctaAbout: "私たちについて",
    features: [
      {
        title: "ウタラディット産プレミアム",
        desc: "タイ・ウタラディット県産の厳選されたカシューナッツのみを使用。",
      },
      {
        title: "品質保証",
        desc: "毎ロット品質検査済み。鮮度にこだわり真空パックでお届け。",
      },
      {
        title: "迅速発送",
        desc: "ご入金確認後、1〜2営業日以内に発送いたします。",
      },
    ],
    productsLabel: "Our Products",
    productsHeading: "人気商品ラインナップ",
    productsSub:
      "全商品、タイ・ウタラディット県産を使用。素材本来の旨みを引き出すために、丁寧に焙煎しています。",
    navAria: "商品セクションへジャンプ",
    single: "単品",
    set: "詰め合わせ",
  },
  th: {
    heroTitle1: "ปลูกด้วยความรัก",
    heroTitle2: "บนแผ่นดินอุตรดิตถ์",
    heroSub:
      "เม็ดมะม่วงหิมพานต์จากสวนของเราที่จังหวัดอุตรดิตถ์ ส่งตรงถึงมือคุณ รสชาติเข้มข้น อร่อยจนหยุดไม่ได้",
    cta: "ดูสินค้า",
    ctaAbout: "เกี่ยวกับเรา",
    features: [
      {
        title: "พรีเมียมจากอุตรดิตถ์",
        desc: "ใช้เม็ดมะม่วงหิมพานต์คัดพิเศษจากจังหวัดอุตรดิตถ์เท่านั้น",
      },
      {
        title: "รับประกันคุณภาพ",
        desc: "ตรวจสอบคุณภาพทุกล็อต บรรจุในบรรจุภัณฑ์สุญญากาศเพื่อความสดใหม่",
      },
      {
        title: "จัดส่งรวดเร็ว",
        desc: "จัดส่งภายใน 1–2 วันทำการหลังยืนยันการชำระเงิน",
      },
    ],
    productsLabel: "Our Products",
    productsHeading: "สินค้าแนะนำ",
    productsSub: "ทุกชิ้นใช้มะม่วงหิมพานต์จากอุตรดิตถ์ คั่วสดเพื่อรักษารสชาติแท้ๆ",
    navAria: "ไปยังหมวดสินค้า",
    single: "เดี่ยว",
    set: "เซ็ต",
  },
} as const;

type AnnouncementRow = {
  id: string;
  title_ja: string | null;
  body_ja: string | null;
  title_th: string | null;
  body_th: string | null;
  image_url: string | null;
  display_start: string | null;
  display_end: string | null;
  is_active: boolean;
};

export default async function HomePage() {
  const audience = getAudienceFromEnv();
  const t = PAGE_TEXT[audience];
  // Cookie 不要の公開クライアント（ISR キャッシュ対応）
  const supabase = getSupabaseAnonClient();
  const nowIso = new Date().toISOString();

  const [annResult, productsResult] = await Promise.all([
    supabase
      .from("announcements")
      .select("id,title_ja,body_ja,title_th,body_th,image_url,display_start,display_end,is_active")
      .eq("is_active", true)
      .or(`display_start.is.null,display_start.lte.${nowIso}`)
      .or(`display_end.is.null,display_end.gte.${nowIso}`)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<AnnouncementRow>(),
    fetchProductsPublicForAudience(audience).then(
      (p): { ok: true; products: Product[] } | { ok: false; message: string } => ({
        ok: true as const,
        products: p,
      }),
      (err): { ok: true; products: Product[] } | { ok: false; message: string } => ({
        ok: false as const,
        message: err instanceof Error ? err.message : String(err),
      }),
    ),
  ]);

  const announcement = annResult.data ?? null;
  const initialProducts = productsResult.ok ? productsResult.products : undefined;
  const productsLoadError = productsResult.ok ? undefined : productsResult.message;
  const popupTitle = audience === "ja" ? announcement?.title_ja : announcement?.title_th;
  const popupBody = audience === "ja" ? announcement?.body_ja : announcement?.body_th;
  const popupData = announcement && popupTitle && popupBody
    ? {
        id: announcement.id,
        title: popupTitle,
        body: popupBody,
        imageUrl: announcement.image_url,
        from: announcement.display_start ?? undefined,
        until: announcement.display_end ?? undefined,
      }
    : null;

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <HeroCarouselDynamic />

      <main className="flex-1">
        {/* ─── ヒーローセクション（JP/EN 言語切り替え対応） ────── */}
        <HeroTextClient />

        {/* ─── 特徴セクション ──────────────────────────────────── */}
        <section className="bg-amber-900 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[Leaf, ShieldCheck, Truck].map((Icon, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="bg-amber-700 rounded-xl p-3 flex-shrink-0">
                  <Icon size={22} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{t.features[i].title}</h3>
                  <p className="text-amber-300/70 text-sm leading-relaxed">{t.features[i].desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 商品一覧セクション（Supabase 本番データ） ─────────── */}
        <section id="products" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">
              {t.productsLabel}
            </span>
            <h2 className="text-3xl font-extrabold text-amber-950 mt-2 mb-3">
              {t.productsHeading}
            </h2>
            <p className="text-amber-700/60 max-w-md mx-auto text-sm leading-relaxed mb-6">
              {t.productsSub}
            </p>
            <nav className="flex flex-wrap justify-center gap-2" aria-label={t.navAria}>
              <a
                href="#single"
                className="px-4 py-2 rounded-full bg-amber-200 text-amber-900 text-sm font-bold hover:bg-amber-300 transition-colors"
              >
                {t.single}
              </a>
              <a
                href="#set"
                className="px-4 py-2 rounded-full bg-orange-200 text-orange-900 text-sm font-bold hover:bg-orange-300 transition-colors"
              >
                {t.set}
              </a>
            </nav>
          </div>

          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid
              initialProducts={initialProducts}
              productsLoadError={productsLoadError}
            />
          </Suspense>
        </section>
      </main>

      <Footer />

      {popupData ? (
        <AnnouncementPopup
          id={popupData.id}
          title={popupData.title}
          body={popupData.body}
          imageUrl={popupData.imageUrl}
          displayPeriod={{
            from: popupData.from,
            until: popupData.until,
          }}
          suppressDurationDays={7}
          openDelayMs={700}
          dismissCheckboxLabel={
            audience === "ja" ? "今後このメッセージを表示しない" : "ไม่แสดงข้อความนี้อีก"
          }
          closeButtonLabel={audience === "ja" ? "閉じる" : "ปิด"}
          overlayDismissAriaLabel={
            audience === "ja" ? "オーバーレイを閉じる" : "ปิดหน้าต่างแจ้งเตือน"
          }
        />
      ) : null}
    </div>
  );
}
