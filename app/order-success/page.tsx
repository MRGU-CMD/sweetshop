import { Suspense } from "react";
import Header from "@/components/layout/Header";
import OrderSuccessClient from "./OrderSuccessClient";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">加载中...</div>}>
        <OrderSuccessClient />
      </Suspense>
    </div>
  );
}
