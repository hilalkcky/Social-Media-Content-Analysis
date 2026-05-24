import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "AI Yorum Analizi",
  description: "Yapay zeka destekli yorum analiz sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-[#0b1220] text-white overflow-x-hidden">
        <Navbar />

        <main>
          {children}
        </main>
      </body>
    </html>
  );
}