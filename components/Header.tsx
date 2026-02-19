"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalQuantity } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-amber-50/90 backdrop-blur-md border-b border-amber-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🥜</span>
          <div>
            <p className="font-bold text-amber-900 text-base leading-tight tracking-tight group-hover:text-amber-700 transition-colors">
              Sam Sian
              <span className="text-amber-500"> Cashew Nuts</span>
            </p>
            <p className="text-amber-600/70 text-[10px] leading-none tracking-widest uppercase">
              Uttaradit, Thailand
            </p>
          </div>
        </Link>

        {/* ナビ */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-amber-800">
          <Link href="/" className="hover:text-amber-600 transition-colors">
            ホーム
          </Link>
          <Link
            href="/products"
            className="hover:text-amber-600 transition-colors"
          >
            商品一覧
          </Link>
          <Link
            href="/about"
            className="hover:text-amber-600 transition-colors"
          >
            私たちについて
          </Link>
          <Link
            href="/track"
            className="hover:text-amber-600 transition-colors"
          >
            注文確認
          </Link>
        </nav>

        {/* カートアイコン */}
        <Link href="/cart" className="relative p-2 group">
          <ShoppingCart
            size={24}
            className="text-amber-800 group-hover:text-amber-600 transition-colors"
          />
          {totalQuantity > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none animate-bounce">
              {totalQuantity > 99 ? "99+" : totalQuantity}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
