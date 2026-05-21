"use client";

import { useState, useCallback } from "react";
import ReviewForm from "./ReviewForm";

export function ImageGallery({ images }: { images: string[] }) {
  const [main, setMain] = useState(images[0] || "");

  return (
    <>
      <div className="aspect-square bg-gradient-to-br from-sakura-50 to-purple-50 rounded-2xl flex items-center justify-center text-8xl overflow-hidden">
        {main ? (
          <img src={main} alt="" className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <span className="opacity-30">🧸</span>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setMain(img)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                img === main ? "border-sakura-500 ring-1 ring-sakura-500" : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function ProductTabs({
  description,
  specs,
  reviews: initialReviews,
  reviewCount: initialCount,
  productId,
  userId,
}: {
  description: string | null;
  specs: any;
  reviews: any[];
  reviewCount: number;
  productId: string;
  userId?: string;
}) {
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewCount, setReviewCount] = useState(initialCount);

  const refreshReviews = useCallback(async () => {
    const res = await fetch(`/api/reviews?productId=${productId}`);
    if (res.ok) {
      const data = await res.json();
      setReviews(data.reviews || data);
      setReviewCount(data.total || (Array.isArray(data) ? data.length : reviewCount));
    }
  }, [productId, reviewCount]);

  const tabs = [
    { key: "desc" as const, label: "商品详情" },
    { key: "specs" as const, label: "规格参数" },
    { key: "reviews" as const, label: `用户评价 (${reviewCount})` },
  ];

  return (
    <div className="mt-12 bg-white rounded-2xl border border-gray-50 overflow-hidden">
      <div className="flex border-b border-gray-50">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-3.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "text-sakura-500 border-b-2 border-sakura-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-8">
        {tab === "desc" && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {description || "暂无商品描述"}
          </p>
        )}

        {tab === "specs" && (
          <div>
            {specs && specs.length > 0 ? (
              <div className="space-y-3">
                {specs.map((group: any, i: number) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-gray-700 mb-1.5">{group.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((v: string, j: number) => (
                        <span
                          key={j}
                          className="inline-block px-3 py-1 text-xs bg-gray-50 border border-gray-100 rounded-md text-gray-600"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">暂无规格信息</p>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div>
            {userId && (
              <div className="mb-6 pb-6 border-b border-gray-50">
                <ReviewForm productId={productId} onSuccess={refreshReviews} />
              </div>
            )}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sakura-100 rounded-full flex items-center justify-center text-sm text-sakura-700 font-medium">
                        {review.user.avatar ? (
                          <img src={review.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          review.user.nickname?.[0] || "🌸"
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">{review.user.nickname}</span>
                        <div className="text-yellow-500 text-xs">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-300 ml-auto">
                        {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{review.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">暂无评价，快来第一个评价吧~</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
