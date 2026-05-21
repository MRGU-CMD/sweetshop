"use client";

import { useState } from "react";

export default function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess?: () => void }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (content.length > 500) { setError("评价内容不能超过500字"); return; }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, content }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setSuccess(true);
      setContent("");
      onSuccess?.();
    } else {
      setError(data.error || "提交失败");
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
        <p className="text-sm text-green-600">评价提交成功！感谢你的反馈 🎉</p>
        <button onClick={() => setSuccess(false)} className="text-xs text-green-500 mt-2 hover:underline">再写一条</button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-700 mb-3">✍️ 写评价</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">评分</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">评价内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-sakura w-full"
            rows={3}
            placeholder="分享你的使用体验..."
            maxLength={500}
          />
          <p className="text-xs text-gray-300 mt-1">{content.length}/500</p>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={handleSubmit} disabled={submitting || !content} className="btn-sakura text-xs px-4 py-2">
          {submitting ? "提交中..." : "提交评价"}
        </button>
      </div>
    </div>
  );
}
