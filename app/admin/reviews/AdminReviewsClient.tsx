"use client";

import { useState, useEffect, useCallback } from "react";

export default function AdminReviewsClient() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (ratingFilter > 0) params.set("rating", String(ratingFilter));
    params.set("page", String(page));
    const res = await fetch(`/api/admin/reviews?${params}`);
    if (res.ok) {
      const data = await res.json();
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [ratingFilter, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条评价吗？")) return;
    setDeleting(id);
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchReviews();
    } else {
      const data = await res.json();
      alert(data.error || "删除失败");
    }
    setDeleting(null);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(Number(e.target.value)); setPage(1); }}
          className="input-sakura w-32"
        >
          <option value="0">全部评分</option>
          <option value="5">★★★★★</option>
          <option value="4">★★★★</option>
          <option value="3">★★★</option>
          <option value="2">★★</option>
          <option value="1">★</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">加载中...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-sm">暂无评价</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">用户</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">商品</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">评分</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">内容</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">时间</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-t border-gray-50">
                  <td className="px-4 py-3">{review.user?.nickname || "—"}</td>
                  <td className="px-4 py-3">{review.product?.name || "—"}</td>
                  <td className="px-4 py-3 text-yellow-500">
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[300px] truncate">{review.content || "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deleting === review.id}
                      className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100 disabled:opacity-50"
                    >
                      {deleting === review.id ? "..." : "删除"}
                    </button>
                  </td>
                </tr>
              ))}
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
