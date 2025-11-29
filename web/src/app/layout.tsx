import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniPass · 一次扫描，通行全网",
  description: "基于电子护照 + ZK 的匿名真人层，提供一次验证、永久匿名的注册体验。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

