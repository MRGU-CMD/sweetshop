"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OrdersIcon } from "@/components/admin/AdminIcons";
import { useToast } from "@/components/ui/Toast";

interface Order {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: number;
  paymentMethod: string | null;
  logisticsCompany: string | null;
  trackingNo: string | null;
  createdAt: string;
  user: { nickname: string; email: string | null; phone: string | null };
  items: { id: string; productId: string; quantity: number; unitPrice: number }[];
}

import { ORDER_STATUS } from "@/lib/constants";

const statusOptions = ["PAID", "SHIPPED", "RECEIVED", "COMPLETED", "CANCELLED"];

export default function AdminOrdersClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [logisticsCompany, setLogisticsCompany] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders);
    setTotal(data.total);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openEdit = (o: Order) => {
    setEditingId(o.id);
    setEditStatus(o.status);
    setLogisticsCompany(o.logisticsCompany || "");
    setTrackingNo(o.trackingNo || "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, status: editStatus, logisticsCompany, trackingNo }),
      });
      if (res.ok) {
        toast("订单已更新", "success");
        setEditingId(null);
        router.refresh();
        fetchOrders();
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "更新失败", "error");
      }
    } catch {
      toast("网络错误，请重试", "error");
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><OrdersIcon /> 订单管理</h1>

      <div className="flex items-center gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-sakura text-sm w-32"
        >
          <option value="">全部状态</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-50">
              <th className="py-3 px-4 font-medium">订单号</th>
              <th className="py-3 px-4 font-medium">用户</th>
              <th className="py-3 px-4 font-medium">金额</th>
              <th className="py-3 px-4 font-medium">状态</th>
              <th className="py-3 px-4 font-medium">物流</th>
              <th className="py-3 px-4 font-medium">时间</th>
              <th className="py-3 px-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">加载中...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">暂无订单</td></tr>
            ) : (
              orders.map((o) => {
                const st = ORDER_STATUS[o.status] || { label: o.status, color: "text-gray-400" };
                return (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{o.orderNo}</td>
                    <td className="py-3 px-4 text-gray-600">{o.user.nickname}</td>
                    <td className="py-3 px-4 text-sakura-500 font-medium">¥{o.totalAmount.toFixed(2)}</td>
                    <td className={`py-3 px-4 ${st.color}`}>{st.label}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {o.logisticsCompany || "—"}{o.trackingNo ? ` | ${o.trackingNo}` : ""}
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(o.createdAt).toLocaleDateString("zh-CN")}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => openEdit(o)} className="text-xs text-sakura-500 hover:underline">管理</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {total > 10 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(total / 10) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm ${
                page === i + 1 ? "bg-sakura-500 text-white" : "bg-white text-gray-600 border border-gray-100 hover:border-sakura-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setEditingId(null)}>
          <div className="bg-white rounded-2xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-700 mb-4">📝 订单管理</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">订单状态</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="input-sakura">
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS[s]?.label || s}</option>
                  ))}
                </select>
              </div>
              {editStatus === "SHIPPED" && (
                <>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">物流公司</label>
                    <input type="text" value={logisticsCompany} onChange={(e) => setLogisticsCompany(e.target.value)} className="input-sakura" placeholder="如：顺丰速运" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">运单号</label>
                    <input type="text" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} className="input-sakura" placeholder="SF1234567890" />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setEditingId(null)} className="btn-sakura-outline text-sm">取消</button>
              <button onClick={handleSave} disabled={saving} className="btn-sakura text-sm">
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
