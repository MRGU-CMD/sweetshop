"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

interface User {
  id: string;
  nickname: string;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersClient({ currentUserRole }: { currentUserRole: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const { toast } = useToast();

  const isOwner = currentUserRole === "OWNER";

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users);
    setTotal(data.total);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const changeRole = async (id: string, role: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    if (res.ok) {
      fetchUsers();
    } else {
      const data = await res.json();
      toast(data.error || "操作失败", "error");
    }
  };

  const transferOwnership = async (targetId: string) => {
    setTransferring(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    if (res.ok) {
      toast("站主权限已转交，你现在是普通管理员了", "info");
      window.location.reload();
    } else {
      const data = await res.json();
      toast(data.error || "转交失败", "error");
      setTransferring(false);
    }
  };

  const roleBadge = (role: string) => {
    if (role === "OWNER") {
      return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">站主</span>;
    }
    if (role === "ADMIN") {
      return <span className="text-xs px-2 py-0.5 rounded-full bg-sakura-100 text-sakura-500">管理员</span>;
    }
    return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">用户</span>;
  };

  const adminsOnly = users.filter((u) => u.role === "ADMIN");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">👥 用户管理</h1>
        {isOwner && (
          <button
            onClick={() => setShowTransferModal(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors font-medium"
          >
            转交站主权限
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="搜索用户..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (setPage(1), fetchUsers())}
          className="input-sakura text-sm w-48"
        />
        <button onClick={() => { setPage(1); fetchUsers(); }} className="btn-sakura-outline text-xs">搜索</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-50">
              <th className="py-3 px-4 font-medium">用户</th>
              <th className="py-3 px-4 font-medium">联系方式</th>
              <th className="py-3 px-4 font-medium">角色</th>
              <th className="py-3 px-4 font-medium">订单数</th>
              <th className="py-3 px-4 font-medium">注册时间</th>
              <th className="py-3 px-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">加载中...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">暂无用户</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <span className="text-gray-700 font-medium">{u.nickname}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">
                    <div>{u.email || "—"}</div>
                    <div>{u.phone || "—"}</div>
                  </td>
                  <td className="py-3 px-4">{roleBadge(u.role)}</td>
                  <td className="py-3 px-4 text-gray-600">{u._count.orders}</td>
                  <td className="py-3 px-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString("zh-CN")}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      {u.role === "OWNER" ? (
                        <span className="text-xs text-gray-300">—</span>
                      ) : u.role === "ADMIN" ? (
                        isOwner && (
                          <button
                            onClick={() => { if (confirm("确定取消该用户的管理员权限？")) changeRole(u.id, "USER"); }}
                            className="text-xs px-2 py-1 rounded bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                          >
                            取消管理员
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => { if (confirm("确定将该用户提升为管理员？")) changeRole(u.id, "ADMIN"); }}
                          className="text-xs px-2 py-1 rounded bg-sakura-50 text-sakura-500 hover:bg-sakura-100 transition-colors"
                        >
                          设为管理员
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
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

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTransferModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-gray-700 mb-2">转交站主权限</h3>
            <p className="text-sm text-gray-400 mb-4">
              选择一个管理员来接收站主权限。转交后你将变成普通管理员。
            </p>
            {adminsOnly.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">暂无可转交的管理员</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {adminsOnly.map((admin) => (
                  <button
                    key={admin.id}
                    disabled={transferring}
                    onClick={() => {
                      if (confirm(`确定将站主权限转交给"${admin.nickname}"？\n\n转交后你将失去站主身份。`)) {
                        transferOwnership(admin.id);
                      }
                    }}
                    className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50 transition-all disabled:opacity-50"
                  >
                    <span className="text-sm font-medium text-gray-700">{admin.nickname}</span>
                    <span className="text-xs text-gray-400 ml-2">{admin.email || admin.phone || ""}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowTransferModal(false)}
              className="mt-4 w-full py-2 text-sm text-gray-400 border border-gray-200 rounded-xl hover:text-gray-500 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
