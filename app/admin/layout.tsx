"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "管理トップ", labelTh: "หน้าหลัก", icon: LayoutDashboard },
  { href: "/admin/products", label: "商品", labelTh: "สินค้า", icon: Package },
  { href: "/admin/sales", label: "売上記録", labelTh: "ยอดขาย", icon: BarChart3 },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-emerald-50/80">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-emerald-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav
            className="flex items-center gap-1"
            aria-label="管理メニュー"
          >
            {NAV_ITEMS.map(({ href, label, labelTh, icon: Icon }) => {
              const isActive =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{label}</span>
                  <span className="opacity-80 text-xs hidden sm:inline" aria-hidden>
                    {labelTh}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
