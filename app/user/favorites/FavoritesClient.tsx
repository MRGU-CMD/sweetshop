"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FavoriteItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice: number | null;
    sales: number;
    images: string;
  };
}

export default function FavoritesClient({ favorites }: { favorites: FavoriteItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(favorites);

  const removeFavorite = async (productId: string) => {
    await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((f) => f.product.id !== productId));
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-20 text-center">
        <p className="text-5xl mb-4">💝</p>
        <p className="text-gray-400">暂无收藏</p>
        <Link href="/" className="text-sakura-500 text-sm mt-2 inline-block hover:underline">
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((fav) => {
        const imgList = JSON.parse(fav.product.images || "[]") as string[];
        const discount = fav.product.originalPrice
          ? Math.round((1 - fav.product.price / fav.product.originalPrice) * 100)
          : 0;
        return (
          <div
            key={fav.id}
            className="bg-white rounded-xl border border-gray-50 overflow-hidden group hover:shadow-md transition-shadow"
          >
            <Link href={`/product/${fav.product.id}`} className="block relative">
              <div className="aspect-square bg-gradient-to-br from-sakura-50 to-purple-50 flex items-center justify-center text-5xl relative">
                {imgList[0] ? (
                  <Image src={imgList[0]} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
                ) : (
                  <span className="opacity-30">🧸</span>
                )}
              </div>
              {discount > 0 && (
                <span className="absolute top-2 left-2 bg-sakura-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFavorite(fav.product.id);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-sm hover:bg-sakura-500 hover:text-white transition-colors shadow-sm"
              >
                ❤️
              </button>
            </Link>
            <div className="p-3">
              <Link
                href={`/product/${fav.product.id}`}
                className="text-xs text-gray-700 line-clamp-2 hover:text-sakura-500 transition-colors"
              >
                {fav.product.name}
              </Link>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-bold text-sakura-500">¥{fav.product.price.toFixed(2)}</span>
                {fav.product.originalPrice && (
                  <span className="text-xs text-gray-300 line-through">¥{fav.product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              <p className="text-xs text-gray-300 mt-1">已售 {fav.product.sales}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
