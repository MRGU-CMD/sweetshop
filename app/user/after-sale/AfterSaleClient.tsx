"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const typeLabels: Record<string, string> = { RETURN: "退货退款", REFUND: "仅退款", EXCHANGE: "换货" };
const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待处理", color: "text-orange-500" },
  APPROVED: { label: "已通过", color: "text-green-500" },
  REJECTED: { label: "已拒绝", color: "text-red-500" },
  COMPLETED: { label: "已完成", color: "text-gray-400" },
};

interface AfterSaleItem {
  id: string;
  orderId: string;
  orderItemId: string;
  type: string;
  reason: string | null;
  refundAmount: number | null;
  status: string;
  createdAt: string;
  order: { orderNo: string };
}

interface OrderItem {
  id: string;
  orderId: string;
  orderNo?: string;
  product: { id: string; name: string; price: number; images: string };
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNo: string;
  items: OrderItem[];
}

export default function AfterSaleClient({
  afterSales,
  orders,
}: {
  afterSales: AfterSaleItem[];
  orders: Order[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    orderId: "",
    orderItemId: "",
    type: "RETURN",
    reason: "",
    refundAmount: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const selectedOrder = orders.find((o) => o.id === form.orderId);

  const MAX_UPLOAD_SIZE = 3 * 1024 * 1024; // 3MB

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      alert(`图片过大（${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩到 3MB 以内后重试`);
      e.target.value = "";
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setImages((prev) => [...prev, data.url]);
    } else {
      const data = await res.json();
      alert(data.error || "上传失败");
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async () => {
    if (!form.orderId || !form.orderItemId || !form.type) return;
    setSubmitting(true);
    const res = await fetch("/api/after-sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: form.orderId,
        orderItemId: form.orderItemId,
        type: form.type,
        reason: form.reason,
        refundAmount: form.refundAmount ? parseFloat(form.refundAmount) : null,
        images,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setShowForm(false);
      router.refresh();
    }
  };

  if (showForm) {
    return (
      <>
        <div className="bg-white rounded-2xl border border-gray-50 p-6 flex-1">
          <h3 className="text-base font-bold text-gray-700 mb-4">📝 申请售后</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">选择订单</label>
              <select
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value, orderItemId: "" })}
                className="input-sakura"
              >
                <option value="">请选择订单</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNo}
                  </option>
                ))}
              </select>
            </div>
            {selectedOrder && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">选择商品</label>
                <select
                  value={form.orderItemId}
                  onChange={(e) => setForm({ ...form, orderItemId: e.target.value })}
                  className="input-sakura"
                >
                  <option value="">请选择商品</option>
                  {selectedOrder.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.product.name} × {item.quantity} (¥{item.unitPrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">售后类型</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-sakura"
              >
                <option value="RETURN">退货退款</option>
                <option value="REFUND">仅退款</option>
                <option value="EXCHANGE">换货</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">退款金额（可选）</label>
              <input
                type="number"
                value={form.refundAmount}
                onChange={(e) => setForm({ ...form, refundAmount: e.target.value })}
                className="input-sakura"
                placeholder="¥"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">申请原因</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="input-sakura"
                rows={3}
                placeholder="请描述问题..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">凭证图片（可选）</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((url) => (
                  <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(url)}
                      className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-bl-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-sakura-400 hover:text-sakura-400 cursor-pointer text-2xl transition-colors">
                  {uploading ? "..." : "+"}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
                <span className="text-xs text-gray-400 self-center">不超过 3MB</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.orderId || !form.orderItemId}
                className="btn-sakura text-sm"
              >
                {submitting ? "提交中..." : "提交申请"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-sakura-outline text-sm">
                取消
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <button onClick={() => setShowForm(true)} className="btn-sakura text-xs px-3 py-1.5">
        + 申请售后
      </button>
      {afterSales.length > 0 ? (
        <div className="space-y-3">
          {afterSales.map((as) => {
            const st = statusLabels[as.status] || { label: as.status, color: "text-gray-400" };
            return (
              <div key={as.id} className="bg-white rounded-xl border border-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{typeLabels[as.type]}</span>
                    <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                  </div>
                  <span className="text-xs text-gray-300">
                    {new Date(as.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  订单：{as.order.orderNo}
                  {as.refundAmount && ` | 退款金额：¥${as.refundAmount.toFixed(2)}`}
                </p>
                {as.reason && <p className="text-sm text-gray-600 mt-2">{as.reason}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-400 text-sm">暂无售后记录</p>
        </div>
      )}
    </>
  );
}
