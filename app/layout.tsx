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
  metadataBase: new URL("https://192.org.cn"),
  title: {
    default: "SweetShop 樱花动漫商城",
    template: "%s | SweetShop",
  },
  description: "发现你喜爱的动漫周边好物 — 手办、服饰、漫画、游戏周边，尽在SweetShop。正品保证，满299包邮，7天无理由退换。",
  keywords: ["动漫周边", "手办", "服饰", "漫画", "游戏周边", "樱花", "SweetShop"],
  authors: [{ name: "SweetShop" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "SweetShop 樱花动漫商城",
    title: "SweetShop 樱花动漫商城",
    description: "发现你喜爱的动漫周边好物 — 手办、服饰、漫画、游戏周边，尽在SweetShop",
    url: "https://192.org.cn",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "SweetShop 樱花动漫商城",
    description: "发现你喜爱的动漫周边好物 — 手办、服饰、漫画、游戏周边",
  },
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
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-sakura-500 focus:rounded-lg focus:shadow-lg focus:text-sm"
        >
          跳到主要内容
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
