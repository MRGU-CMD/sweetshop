"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

export default function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: "cancel" | "receive" | "complete") => {
    setLoading(action);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      toast(data.error || "操作失败", "error");
      setLoading(null);
    }
  };

  return (
    <>
      {(status === "PENDING" || status === "PAID") && (
        <button
          onClick={() => handleAction("cancel")}
          disabled={loading !== null}
          className="text-xs px-4 py-2 border border-gray-200 text-gray-400 rounded-lg hover:border-red-300 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          {loading === "cancel" ? "处理中..." : "取消订单"}
        </button>
      )}
      {status === "SHIPPED" && (
        <button
          onClick={() => handleAction("receive")}
          disabled={loading !== null}
          className="btn-sakura text-xs px-4 py-2 disabled:opacity-50"
        >
          {loading === "receive" ? "处理中..." : "确认收货"}
        </button>
      )}
      {status === "RECEIVED" && (
        <button
          onClick={() => handleAction("complete")}
          disabled={loading !== null}
          className="btn-sakura text-xs px-4 py-2 disabled:opacity-50"
        >
          {loading === "complete" ? "处理中..." : "完成订单"}
        </button>
      )}
    </>
  );
}
