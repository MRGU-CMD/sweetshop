"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const addToCart = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setAdding(true);
    setMessage("");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    setAdding(false);
    if (res.ok) {
      setMessage("已加入购物车");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const buyNow = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setAdding(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    setAdding(false);
    if (res.ok) {
      const item = await res.json();
      router.push(`/checkout?items=${item.id}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">数量</span>
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-sakura-500 disabled:opacity-30"
          >
            −
          </button>
          <span className="w-12 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            disabled={quantity >= stock}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-sakura-500 disabled:opacity-30"
          >
            +
          </button>
        </div>
        <span className="text-xs text-gray-300">库存 {stock} 件</span>
        {message && <span className="text-xs text-green-500">{message}</span>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={addToCart}
          disabled={adding}
          className="flex-1 btn-sakura-outline text-sm"
        >
          {adding ? "..." : "加入购物车"}
        </button>
        <button
          onClick={buyNow}
          disabled={adding}
          className="flex-1 btn-sakura text-sm"
        >
          {adding ? "..." : "立即购买"}
        </button>
      </div>
    </div>
  );
}
