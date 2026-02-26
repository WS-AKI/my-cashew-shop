"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "注文管理",
    labelTh: "จัดการออเดอร์",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/products",
    label: "商品",
    labelTh: "สินค้า",
    icon: Package,
    exact: false,
  },
  {
    href: "/admin/sales",
    label: "売上記録",
    labelTh: "ยอดขาย",
    icon: BarChart3,
    exact: false,
  },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* トップバー */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* ブランド */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl select-none">🥜</span>
            <span className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
              Admin
              <span className="hidden sm:inline text-slate-400 font-normal text-xs ml-1">
                · ระบบจัดการ
              </span>
            </span>
          </div>

          {/* ナビ */}
          <nav className="flex items-center gap-1" aria-label="管理メニュー">
            {NAV_ITEMS.map(({ href, label, labelTh, icon: Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className={`text-xs ${isActive ? "text-white/70" : "text-slate-400"} hidden md:inline`}>
                    {labelTh}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
