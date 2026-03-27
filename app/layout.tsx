import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AudienceProvider } from "@/context/AudienceContext";
import { AuthSessionProvider } from "@/context/AuthSessionContext";
import { LanguageProvider } from "@/context/LanguageContext";
import TierCelebrationModal from "@/components/loyalty/TierCelebrationModal";
import AuthNoticeToast from "@/components/auth/AuthNoticeToast";
import { getAudienceFromEnv } from "@/lib/audience";

const SITE_TITLE = "Samsian Cashew Nuts - タイ産高級カシューナッツ / Premium Thai Cashews";
const SITE_DESCRIPTION =
  "タイ・ウタラディット産カシューナッツを直送。Samsian Cashew Nuts 公式ストア。Roasted fresh in Thailand, shipped with care to Japan and Thailand customers.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://cashew-shop.example.com";
// TODO: 本番公開後にブランド用 OGP 画像へ差し替え（例: /og-image-samsian.jpg）
const OGP_IMAGE_PATH = "/og-image.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Samsian Cashew Nuts",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Samsian Cashew Nuts",
    "Premium Thai Cashews",
    "タイ産カシューナッツ",
    "เม็ดมะม่วงหิมพานต์",
    "Uttaradit cashew",
    "Thai snacks",
  ],
  openGraph: {
    type: "website",
    siteName: "Samsian Cashew Nuts",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "ja_JP",
    alternateLocale: ["th_TH", "en_US"],
    images: [
      {
        url: OGP_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Samsian Cashew Nuts - Premium Thai Cashews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OGP_IMAGE_PATH],
  },
  verification: {
    google: "C3vNaRlA4kk3jyUqJW8L9l3ZBIM5YumvUZKpnGxZz08",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const audience = getAudienceFromEnv();
  return (
    <html lang={audience === "ja" ? "ja" : "th"}>
      <body className="antialiased">
        <AudienceProvider audience={audience}>
          <AuthSessionProvider>
            <LanguageProvider>
              <CartProvider>{children}</CartProvider>
              <TierCelebrationModal />
              <Suspense fallback={null}>
                <AuthNoticeToast />
              </Suspense>
            </LanguageProvider>
          </AuthSessionProvider>
        </AudienceProvider>
      </body>
    </html>
  );
}
