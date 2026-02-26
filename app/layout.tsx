import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "ウタラディット産カシューナッツ | 日本語対応・タイ直送",
  description:
    "タイ・ウタラディット産の希少なオーガニックカシューナッツをローストしたてでお届け。一度食べたら止まらない濃厚な味わい。日本語対応で安心してお買い物いただけます。",
  keywords: [
    "タイ",
    "ウタラディット",
    "カシューナッツ",
    "オーガニック",
    "通販",
    "日本語",
  ],
  openGraph: {
    title: "ウタラディット産カシューナッツ | 日本語対応・タイ直送",
    description:
      "タイ・ウタラディット産の希少なオーガニックカシューナッツをローストしたてでお届け。一度食べたら止まらない濃厚な味わい。日本語対応で安心してお買い物いただけます。",
    locale: "ja_JP",
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
  return (
    <html lang="ja">
      <body className="antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
