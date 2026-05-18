"use client";

import { useState } from "react";

export default function FavoriteButton({
  productId,
  initialFavorited,
}: {
  productId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);

  const toggle = async () => {
    if (favorited) {
      await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" });
      setFavorited(false);
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      setFavorited(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
        favorited
          ? "border-sakura-300 bg-sakura-50 text-sakura-500"
          : "border-gray-200 text-gray-400 hover:border-sakura-300 hover:text-sakura-500"
      }`}
    >
      <span>{favorited ? "❤️" : "🤍"}</span>
      <span>{favorited ? "已收藏" : "收藏"}</span>
    </button>
  );
}
