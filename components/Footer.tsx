import Link from "next/link";
import Image from "next/image";
import { LINE_OFFICIAL_URL, LINE_OFFICIAL_QR_PATH } from "@/lib/shop-config";

export default function Footer() {
  return (
    <footer className="bg-amber-950 text-amber-200 pt-12 pb-8 mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
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
                  href="/track"
                  className="text-amber-300/70 hover:text-amber-300 transition-colors"
                >
                  注文状況の確認
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

          {/* インフォメーション */}
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
            </ul>
          </div>

          {/* 公式LINE（QR・スリップ案内） */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">
              公式LINE
            </h3>
            {LINE_OFFICIAL_QR_PATH && (
              <a
                href={LINE_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-amber-950 rounded-xl"
                aria-label="公式LINEを開く"
              >
                <span className="relative block w-28 h-28 rounded-xl overflow-hidden bg-white border-2 border-amber-600/50 shadow-md">
                  <Image
                    src={LINE_OFFICIAL_QR_PATH}
                    alt="公式LINE 友だち追加用QRコード"
                    fill
                    sizes="112px"
                    className="object-contain"
                  />
                </span>
              </a>
            )}
            <p className="text-amber-300/80 text-sm mt-2 mb-1">
              お問い合わせはLINEでどうぞ。
            </p>
            <p className="text-amber-400/90 text-xs leading-relaxed">
              銀行のスリップを送る時は、サイトからアップロードのほか、<strong className="text-amber-300">LINEで写真を送っていただくことも可能</strong>です。
            </p>
          </div>
        </div>

        <div className="border-t border-amber-800 pt-6 text-center text-amber-500/60 text-xs">
          © {new Date().getFullYear()} Sam Sian Cashew Nuts. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
