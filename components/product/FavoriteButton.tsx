"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FavoriteButton({
  productId,
  initialFavorited,
}: {
  productId: string;
  initialFavorited: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);

  const toggle = async () => {
    setFavorited(!favorited);
    const method = favorited ? "DELETE" : "POST";
    const url = favorited ? `/api/favorites?productId=${productId}` : "/api/favorites";
    const body = favorited ? undefined : JSON.stringify({ productId });
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body,
    });
    if (!res.ok) {
      setFavorited(favorited);
      if (res.status === 401) router.push("/login");
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
