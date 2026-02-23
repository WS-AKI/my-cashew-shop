import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Sam Sian Cashew Nuts | タイ・ウタラディット産カシューナッツ専門店",
  description:
    "タイ・ウタラディット県の大地で大切に育てたカシューナッツを、産地直送でお届けします。",
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
