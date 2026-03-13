import Link from "next/link";
import Image from "next/image";
import { LINE_OFFICIAL_QR_PATH } from "@/lib/shop-config";
import { getAudienceFromEnv } from "@/lib/audience";

const FOOTER_TEXT = {
  ja: {
    brandDesc: "タイ・ウタラディット県産の最高品質カシューナッツを産地直送でお届け。",
    shopHeading: "ショップ",
    products: "商品一覧",
    cart: "カート",
    track: "注文状況の確認",
    paymentMethod: "振込方法",
    infoHeading: "インフォメーション",
    about: "私たちについて",
    shipping: "送料・お届けについて",
    lineHeading: "公式LINE",
    lineQrAlt: "公式LINE 友だち追加用QRコード（スマホで読み取ってください）",
    lineScan: "スマホでQRを読み取って友だち追加・お問い合わせ",
    lineSlipNote: "銀行のスリップを送る時は、サイトからアップロードのほか、",
    lineSlipNoteStrong: "LINEで写真を送っていただくことも可能",
    lineSlipNoteSuffix: "です。",
  },
  th: {
    brandDesc: "เม็ดมะม่วงหิมพานต์คัดพิเศษจากอุตรดิตถ์ ส่งตรงจากแหล่งผลิต",
    shopHeading: "ร้านค้า",
    products: "สินค้าทั้งหมด",
    cart: "ตะกร้า",
    track: "ติดตามคำสั่งซื้อ",
    paymentMethod: "วิธีชำระเงิน",
    infoHeading: "ข้อมูล",
    about: "เกี่ยวกับเรา",
    shipping: "ค่าขนส่งและการจัดส่ง",
    lineHeading: "LINE ทางการ",
    lineQrAlt: "QR Code เพิ่มเพื่อน LINE ทางการ (สแกนด้วยสมาร์ทโฟน)",
    lineScan: "สแกน QR เพื่อเพิ่มเพื่อนและสอบถาม",
    lineSlipNote: "ส่งสลิปโอนเงินทาง LINE ได้เลย นอกจากอัปโหลดในเว็บไซต์ ",
    lineSlipNoteStrong: "ส่งรูปมาทาง LINE ได้เช่นกัน",
    lineSlipNoteSuffix: "",
  },
} as const;

export default function Footer() {
  const audience = getAudienceFromEnv();
  const t = FOOTER_TEXT[audience];

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
              {t.brandDesc}
            </p>
          </div>

          {/* ショップリンク */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">
              {t.shopHeading}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-amber-300/70 hover:text-amber-300 transition-colors">
                  {t.products}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-amber-300/70 hover:text-amber-300 transition-colors">
                  {t.cart}
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-amber-300/70 hover:text-amber-300 transition-colors">
                  {t.track}
                </Link>
              </li>
              <li>
                <Link href="/checkout/success" className="text-amber-300/70 hover:text-amber-300 transition-colors">
                  {t.paymentMethod}
                </Link>
              </li>
            </ul>
          </div>

          {/* インフォメーション */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">
              {t.infoHeading}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-amber-300/70 hover:text-amber-300 transition-colors">
                  {t.about}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-amber-300/70 hover:text-amber-300 transition-colors">
                  {t.shipping}
                </Link>
              </li>
            </ul>
          </div>

          {/* 公式LINE */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">
              {t.lineHeading}
            </h3>
            {LINE_OFFICIAL_QR_PATH && (
              <span className="relative block w-28 h-28 rounded-xl overflow-hidden bg-white border-2 border-amber-600/50 shadow-md">
                <Image
                  src={LINE_OFFICIAL_QR_PATH}
                  alt={t.lineQrAlt}
                  fill
                  sizes="112px"
                  className="object-contain"
                />
              </span>
            )}
            <p className="text-amber-300/80 text-sm mt-2 mb-1">{t.lineScan}</p>
            <p className="text-amber-400/90 text-xs leading-relaxed">
              {t.lineSlipNote}
              <strong className="text-amber-300">{t.lineSlipNoteStrong}</strong>
              {t.lineSlipNoteSuffix}
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
