import type { Metadata } from "next";
import { ZCOOL_XiaoWei, ZCOOL_QingKe_HuangYou } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const zcoolXiaoWei = ZCOOL_XiaoWei({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-zcool-xiaowei",
  display: "swap",
});

const zcoolQingKe = ZCOOL_QingKe_HuangYou({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-zcool-qingke",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SweetShop 樱花动漫商城",
  description: "发现你喜爱的动漫周边好物 — 手办、服饰、漫画、游戏周边，尽在SweetShop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${zcoolXiaoWei.variable} ${zcoolQingKe.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><Providers>{children}</Providers></body>
    </html>
  );
}
