import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "社群桥 - 社群资源匹配平台",
  description: "让社群资源流动起来，把群体力量激发出来",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}