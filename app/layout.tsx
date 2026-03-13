import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AudienceProvider } from "@/context/AudienceContext";
import { getAudienceFromEnv } from "@/lib/audience";

export function generateMetadata(): Metadata {
  const audience = getAudienceFromEnv();
  return {
    title:
      audience === "ja"
        ? "ウタラディット産カシューナッツ | 日本語対応・タイ直送"
        : "เม็ดมะม่วงหิมพานต์อุตรดิตถ์ | Sam Sian Cashew Nuts",
    description:
      audience === "ja"
        ? "タイ・ウタラディット産の希少なオーガニックカシューナッツをローストしたてでお届け。一度食べたら止まらない濃厚な味わい。日本語対応で安心してお買い物いただけます。"
        : "เม็ดมะม่วงหิมพานต์คั่วสดจากอุตรดิตถ์ ส่งตรงจากแหล่งผลิต รสชาติเข้มข้น อร่อยจนหยุดไม่ได้",
    keywords:
      audience === "ja"
        ? ["タイ", "ウタラディット", "カシューナッツ", "オーガニック", "通販", "日本語"]
        : ["เม็ดมะม่วงหิมพานต์", "อุตรดิตถ์", "คั่ว", "ออร์แกนิค", "สั่งออนไลน์"],
    openGraph: {
      title:
        audience === "ja"
          ? "ウタラディット産カシューナッツ | 日本語対応・タイ直送"
          : "เม็ดมะม่วงหิมพานต์อุตรดิตถ์ | Sam Sian Cashew Nuts",
      description:
        audience === "ja"
          ? "タイ・ウタラディット産の希少なオーガニックカシューナッツをローストしたてでお届け。一度食べたら止まらない濃厚な味わい。日本語対応で安心してお買い物いただけます。"
          : "เม็ดมะม่วงหิมพานต์คั่วสดจากอุตรดิตถ์ ส่งตรงจากแหล่งผลิต รสชาติเข้มข้น",
      locale: audience === "ja" ? "ja_JP" : "th_TH",
    },
    verification: {
      google: "C3vNaRlA4kk3jyUqJW8L9l3ZBIM5YumvUZKpnGxZz08",
    },
  };
}

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
          <CartProvider>{children}</CartProvider>
        </AudienceProvider>
      </body>
    </html>
  );
}
