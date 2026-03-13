import Link from "next/link";
import { Truck, Package, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SHIPPING_DESCRIPTION, SHOP_TEXT } from "@/lib/shop-config";
import { getAudienceFromEnv } from "@/lib/audience";

const PAGE_TEXT = {
  ja: {
    pageTitle: "送料・お届けについて",
    shippingSection: "送料",
    deliverySection: "お届け",
    questionSection: "ご不明な点",
    shippingAutoNote: "会計時に自動で適用されます。",
    deliveryFrom: "タイ・ウタラディット県から直送しています。",
    deliveryDetail: "ご入金確認後、1〜2営業日以内に発送いたします。配送業者（Flash Express 等）でお届けします。",
    questionDetail: "送料・配送日などご不明な点は公式LINEよりお気軽にどうぞ。",
    cta: "商品を見る",
  },
  th: {
    pageTitle: "ค่าขนส่งและการจัดส่ง",
    shippingSection: "ค่าขนส่ง",
    deliverySection: "การจัดส่ง",
    questionSection: "มีข้อสงสัย?",
    shippingAutoNote: "คำนวณอัตโนมัติตอนชำระเงิน",
    deliveryFrom: "จัดส่งตรงจากสวนของเราที่จังหวัดอุตรดิตถ์",
    deliveryDetail: "จัดส่งภายใน 1–2 วันทำการหลังยืนยันการโอนเงิน ผ่านบริษัทขนส่ง (Flash Express เป็นต้น)",
    questionDetail: "หากมีข้อสงสัยเรื่องค่าขนส่งหรือวันจัดส่ง ทักหาเราทาง LINE ทางการได้เลย",
    cta: "ดูสินค้า",
  },
} as const;

export default function ShippingPage() {
  const audience = getAudienceFromEnv();
  const t = PAGE_TEXT[audience];
  const s = SHOP_TEXT.checkout;
  const sd = SHIPPING_DESCRIPTION;

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-extrabold text-amber-950 mb-1">
            {t.pageTitle}
          </h1>
          <p className="text-amber-600 text-sm">ค่าขนส่งและการจัดส่ง / Shipping</p>
        </div>

        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-amber-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck size={24} className="text-amber-500" />
              <h2 className="font-bold text-amber-950">{t.shippingSection}</h2>
            </div>
            <p className="text-amber-900 font-bold text-xl text-center py-3 mb-3 bg-amber-50 rounded-xl border border-amber-200">
              {s.shippingBasic50[audience]}
            </p>
            <p className="text-amber-700 font-medium text-center mb-3">
              {s.shippingFreeOver1000[audience]}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-4">
              {sd[audience]} {t.shippingAutoNote}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Package size={24} className="text-amber-500" />
              <h2 className="font-bold text-amber-950">{t.deliverySection}</h2>
            </div>
            <p className="text-amber-700 text-sm font-medium mb-2">
              {t.deliveryFrom}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t.deliveryDetail}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock size={24} className="text-amber-500" />
              <h2 className="font-bold text-amber-950">{t.questionSection}</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t.questionDetail}
            </p>
          </div>
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            {t.cta}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
