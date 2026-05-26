"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Footer from "@/components/layout/Footer";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get("orderNo") || "";
  const total = searchParams.get("total") || "0";
  const orderId = searchParams.get("orderId") || "";
  const payment = searchParams.get("payment") || "wechat";
  const paymentLabel = payment === "wechat" ? "微信支付" : payment === "alipay" ? "支付宝" : payment === "card" ? "银行卡" : "—";

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="max-w-md mx-auto px-4 py-16 text-center flex-1">
        <div className="bg-white rounded-2xl border border-gray-50 p-8 sm:p-10">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">下单成功！</h1>
          <p className="text-sm text-gray-400 mb-6">感谢您的购买，我们会尽快发货~</p>

          <div className="bg-sakura-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">订单编号</span>
              <span className="text-gray-700 font-medium truncate ml-2 max-w-[180px]">{orderNo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">支付方式</span>
              <span className="text-gray-700">{paymentLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">实付金额</span>
              <span className="text-sakura-500 font-bold text-lg">¥{parseFloat(total).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/user/orders/${orderId}`}
              className="flex-1 btn-sakura text-sm"
            >
              查看订单
            </Link>
            <Link
              href="/"
              className="flex-1 btn-sakura-outline text-sm"
            >
              继续购物
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function OrderSuccessClient() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">加载中...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
