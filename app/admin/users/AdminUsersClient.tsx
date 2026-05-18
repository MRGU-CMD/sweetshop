"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  nickname: string;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">👥 用户管理</h1>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="搜索用户..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (() => { setPage(1); fetchUsers(); })()}
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400">加载中...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400">暂无用户</td></tr>
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
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "ADMIN" ? "bg-sakura-100 text-sakura-500" : "bg-gray-100 text-gray-500"}`}>
                      {u.role === "ADMIN" ? "管理员" : "用户"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{u._count.orders}</td>
                  <td className="py-3 px-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString("zh-CN")}</td>
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
    </div>
  );
}
