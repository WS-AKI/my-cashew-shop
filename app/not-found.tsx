import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAudienceFromEnv } from "@/lib/audience";

export default function NotFound() {
  const audience = getAudienceFromEnv();

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <p className="text-8xl font-black text-amber-200 leading-none select-none mb-6">
          404
        </p>
        <h1 className="text-2xl font-bold text-amber-950 mb-2">
          {audience === "ja" ? "ページが見つかりませんでした" : "ไม่พบหน้าที่คุณต้องการ"}
        </h1>
        <p className="text-amber-800/55 text-sm mb-8 max-w-sm">
          {audience === "ja"
            ? "URLが間違っているか、ページが削除された可能性があります。"
            : "URL อาจไม่ถูกต้อง หรือหน้านี้ถูกลบไปแล้ว"}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 transition-colors"
          >
            {audience === "ja" ? "トップへ戻る" : "กลับหน้าแรก"}
          </Link>
          <Link
            href="/#products"
            className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-white text-amber-800 font-bold px-6 py-3 hover:bg-amber-50 transition-colors"
          >
            {audience === "ja" ? "商品を見る" : "ดูสินค้า"}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
