import Header from "@/components/layout/Header";
import CheckoutClient from "./CheckoutClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">加载中...</div>}>
        <CheckoutClient />
      </Suspense>
    </div>
  );
}
