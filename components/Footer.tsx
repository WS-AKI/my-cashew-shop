import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-amber-950 text-amber-200 pt-12 pb-8 mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* ブランド */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥜</span>
              <div>
                <p className="font-bold text-white text-base leading-tight">
                  Sam Sian{" "}
                  <span className="text-amber-400">Cashew Nuts</span>
                </p>
                <p className="text-amber-500/70 text-[10px] uppercase tracking-widest">
                  Uttaradit, Thailand
                </p>
              </div>
            </div>
            <p className="text-amber-300/70 text-sm leading-relaxed">
              タイ・ウタラディット県産の最高品質
              <br />
              カシューナッツを産地直送でお届け。
            </p>
          </div>

          {/* ショップリンク */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">
              ショップ
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="text-amber-300/70 hover:text-amber-300 transition-colors"
                >
                  商品一覧
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-amber-300/70 hover:text-amber-300 transition-colors"
                >
                  カート
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout/success"
                  className="text-amber-300/70 hover:text-amber-300 transition-colors"
                >
                  振込方法
                </Link>
              </li>
            </ul>
          </div>

          {/* インフォリンク */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">
              インフォメーション
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-amber-300/70 hover:text-amber-300 transition-colors"
                >
                  私たちについて
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-amber-300/70 hover:text-amber-300 transition-colors"
                >
                  送料・お届けについて
                </Link>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300/70 hover:text-amber-300 transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-800 pt-6 text-center text-amber-500/60 text-xs">
          © {new Date().getFullYear()} Sam Sian Cashew Nuts. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
