"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

import { AFTER_SALE_STATUS_LABELS, AFTER_SALE_TYPE_LABELS } from "@/lib/constants";

const afterSaleBadgeColors: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-600",
  APPROVED: "bg-blue-100 text-blue-600",
  REJECTED: "bg-red-100 text-red-600",
  COMPLETED: "bg-green-100 text-green-600",
};

export default function AdminAfterSaleClient() {
  const { toast } = useToast();
  const [afterSales, setAfterSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAfterSales = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    const res = await fetch(`/api/admin/after-sale?${params}`);
    if (res.ok) {
      const data = await res.json();
      setAfterSales(data.afterSales);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => {
    fetchAfterSales();
  }, [fetchAfterSales]);

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id);
    const reply = replyText[id] || "";
    const res = await fetch("/api/admin/after-sale", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, reply }),
    });
    if (res.ok) {
      setReplyText((prev) => { const n = { ...prev }; delete n[id]; return n; });
      fetchAfterSales();
    } else {
      const data = await res.json();
      toast(data.error || "操作失败", "error");
    }
    setActionLoading(null);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-sakura w-36"
        >
          <option value="">全部状态</option>
          <option value="PENDING">待处理</option>
          <option value="APPROVED">已审批</option>
          <option value="REJECTED">已拒绝</option>
          <option value="COMPLETED">已完成</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">加载中...</p>
      ) : afterSales.length === 0 ? (
        <p className="text-gray-400 text-sm">暂无售后单</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">用户</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">订单号</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">类型</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">原因</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">金额</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">状态</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">时间</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {afterSales.map((item) => {
                const statusLabel = AFTER_SALE_STATUS_LABELS[item.status] || item.status;
                const statusColor = afterSaleBadgeColors[item.status] || "bg-gray-100 text-gray-600";
                return (
                  <tr key={item.id} className="border-t border-gray-50">
                    <td className="px-4 py-3">{item.user?.nickname || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{item.order?.orderNo || "—"}</td>
                    <td className="px-4 py-3">{AFTER_SALE_TYPE_LABELS[item.type] || item.type}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{item.reason || "—"}</td>
                    <td className="px-4 py-3">{item.refundAmount ? `¥${item.refundAmount}` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "PENDING" && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="回复内容..."
                            value={replyText[item.id] || ""}
                            onChange={(e) => setReplyText({ ...replyText, [item.id]: e.target.value })}
                            className="text-xs border border-gray-200 rounded px-2 py-1 w-28"
                          />
                          <button
                            onClick={() => handleAction(item.id, "approve")}
                            disabled={actionLoading === item.id}
                            className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 disabled:opacity-50"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleAction(item.id, "reject")}
                            disabled={actionLoading === item.id}
                            className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            拒绝
                          </button>
                        </div>
                      )}
                      {item.status === "APPROVED" && (
                        <button
                          onClick={() => handleAction(item.id, "complete")}
                          disabled={actionLoading === item.id}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          完成
                        </button>
                      )}
                      {(item.status === "REJECTED" || item.status === "COMPLETED") && (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm ${p === page ? "bg-sakura-500 text-white" : "bg-white text-gray-600 hover:bg-sakura-50"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
