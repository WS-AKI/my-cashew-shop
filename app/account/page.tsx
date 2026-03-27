import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Crown, Package, PackageCheck, UserRound } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAudienceFromEnv } from "@/lib/audience";

const COPY = {
  ja: {
    title: "マイページ",
    subtitle: "会員メニュー",
    vipTitle: "VIPルーム",
    vipDesc: "特典確認・限定商品の購入はこちら",
    trackTitle: "注文状況の確認",
    trackDesc: "注文番号から配送状況を確認できます",
    ordersTitle: "注文履歴",
    ordersDesc: "ログイン中のアカウントの注文一覧と進捗",
  },
  th: {
    title: "บัญชีของฉัน",
    subtitle: "เมนูสมาชิก",
    vipTitle: "ห้อง VIP",
    vipDesc: "ตรวจสอบสิทธิพิเศษและซื้อสินค้าพิเศษ",
    trackTitle: "ตรวจสอบสถานะคำสั่งซื้อ",
    trackDesc: "ติดตามสถานะได้ด้วยหมายเลขคำสั่งซื้อ",
    ordersTitle: "ประวัติคำสั่งซื้อ",
    ordersDesc: "รายการและความคืบหน้า (บัญชีที่ล็อกอิน)",
  },
} as const;

function MenuCard({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-amber-200/70 bg-white/80 px-4 py-4 transition hover:border-amber-300 hover:bg-white"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-950">{title}</p>
          <p className="truncate text-xs text-amber-900/55">{desc}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-amber-700/50 transition group-hover:text-amber-700/80" />
    </Link>
  );
}

export default function AccountPage() {
  const audience = getAudienceFromEnv();
  const t = COPY[audience];

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <section className="rounded-3xl border border-amber-200/70 bg-gradient-to-b from-white to-amber-50 p-6">
          <div className="mb-5 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-amber-700" />
            <p className="text-sm uppercase tracking-[0.2em] text-amber-800/45">{t.subtitle}</p>
          </div>
          <h1 className="mb-6 text-2xl font-semibold text-amber-950">{t.title}</h1>
          <div className="space-y-3">
            <MenuCard
              href="/account/vip"
              title={t.vipTitle}
              desc={t.vipDesc}
              icon={<Crown className="h-5 w-5" />}
            />
            <MenuCard
              href="/account/orders"
              title={t.ordersTitle}
              desc={t.ordersDesc}
              icon={<Package className="h-5 w-5" />}
            />
            <MenuCard
              href="/track"
              title={t.trackTitle}
              desc={t.trackDesc}
              icon={<PackageCheck className="h-5 w-5" />}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
