import Link from "next/link";
import { Truck, Package, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SHIPPING_DESCRIPTION } from "@/lib/shop-config";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-extrabold text-amber-950 mb-1">
            送料・お届けについて
          </h1>
          <p className="text-amber-600 text-sm">ค่าขนส่งและการจัดส่ง / Shipping</p>
        </div>

        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-amber-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Truck size={24} className="text-amber-500" />
              <h2 className="font-bold text-amber-950">送料</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {SHIPPING_DESCRIPTION.ja}
              会計時に重量に応じて自動で加算されます。
            </p>
            <p className="text-gray-500 text-xs mt-2" lang="th">
              {SHIPPING_DESCRIPTION.th} — คำนวณอัตโนมัติตอนชำระเงิน
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Package size={24} className="text-amber-500" />
              <h2 className="font-bold text-amber-950">お届け</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              ご入金確認後、1〜2営業日以内に発送いたします。配送業者（Flash Express 等）でお届けします。
            </p>
            <p className="text-gray-500 text-xs mt-2" lang="th">
              จัดส่งภายใน 1–2 วันทำการหลังยืนยันการโอน
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock size={24} className="text-amber-500" />
              <h2 className="font-bold text-amber-950">ご不明な点</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              送料・配送日などご不明な点は公式LINEよりお気軽にどうぞ。
            </p>
          </div>
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            商品を見る
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
