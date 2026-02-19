import Link from "next/link";
import { ChevronRight, Leaf, Sun, Heart, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 py-20 px-4 text-center">
          <span className="text-5xl mb-4 block">🌿</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 mb-4">
            私たちについて
          </h1>
          <p className="text-amber-700/70 text-sm">เกี่ยวกับเรา / About Us</p>
        </section>

        {/* Story */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-extrabold text-amber-950">
              Sam Sian Cashew Nuts
            </h2>
            <p className="text-amber-800/70 leading-relaxed">
              タイ北部ウタラディット県。豊かな自然と温暖な気候に恵まれたこの地で、
              私たちはカシューナッツを大切に育てています。
            </p>
            <p className="text-amber-800/70 leading-relaxed">
              ถั่วลิสงจากจังหวัดอุตรดิตถ์ ภาคเหนือของประเทศไทย
              เราดูแลต้นมะม่วงหิมพานต์ด้วยความรักและใส่ใจ
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-amber-100 p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Leaf size={24} className="text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800">自然の恵み</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                化学肥料に頼らず、ウタラディットの豊かな土壌と
                太陽の光で育ったカシューナッツです。
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-100 p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Sun size={24} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-800">丁寧な焙煎</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                素材本来の旨みを最大限に引き出すため、
                一つひとつ丁寧に焙煎しています。
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-100 p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <Heart size={24} className="text-rose-500" />
              </div>
              <h3 className="font-bold text-gray-800">産地直送</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                農園から直接お届けするので、いつでも新鮮。
                中間業者を通さない分、お求めやすい価格でご提供します。
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-100 p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MapPin size={24} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800">ウタラディット県</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                タイ北部に位置するウタラディット県は、
                高品質なカシューナッツの産地として知られています。
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              商品を見る
              <ChevronRight size={20} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
