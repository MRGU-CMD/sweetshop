import Header from "@/components/layout/Header";
import CartClient from "./CartClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">加载中...</div>}>
        <CartClient />
      </Suspense>
    </div>
  );
}
