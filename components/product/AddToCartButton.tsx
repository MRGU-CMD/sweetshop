"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTransition } from "@/components/TransitionProvider";
import { useToast } from "@/components/ui/Toast";

export default function AddToCartButton({
  productId,
  stock,
  specs,
}: {
  productId: string;
  stock: number;
  specs?: { name: string; values: string[] }[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { startLoading } = useTransition();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const specInfo = Object.values(selectedSpecs).filter(Boolean).join(" / ");

  const addToCart = async () => {
    if (!session) {
      startLoading("前往登录...");
      router.push("/login");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, specInfo: specInfo || undefined }),
      });
      if (res.ok) {
        toast("已加入购物车", "success", {
          label: "去购物车",
          onClick: () => router.push("/cart"),
        });
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "添加失败，请重试", "error");
      }
    } catch {
      toast("网络错误，请重试", "error");
    }
    setAdding(false);
  };

  const buyNow = async () => {
    if (!session) {
      startLoading("前往登录...");
      router.push("/login");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, specInfo: specInfo || undefined }),
      });
      if (res.ok) {
        const item = await res.json();
        startLoading("前往结算...");
        router.push(`/checkout?items=${item.id}`);
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "操作失败，请重试", "error");
      }
    } catch {
      toast("网络错误，请重试", "error");
    }
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      {/* Specs selector */}
      {specs && specs.length > 0 && specs.map((group) => (
        <div key={group.name} className="flex items-center gap-2">
          <span className="text-sm text-gray-400 w-10">{group.name}</span>
          <div className="flex flex-wrap gap-1.5">
            {group.values.map((v) => (
              <button
                key={v}
                onClick={() => setSelectedSpecs({ ...selectedSpecs, [group.name]: v })}
                className={`text-xs px-3 py-1 rounded-full border transition-colors focus-visible:outline-none ${
                  selectedSpecs[group.name] === v
                    ? "border-sakura-500 bg-sakura-50 text-sakura-500"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">数量</span>
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-sakura-500 disabled:opacity-30"
            aria-label="减少数量"
          >
            −
          </button>
          <span className="w-12 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            disabled={quantity >= stock}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-sakura-500 disabled:opacity-30"
            aria-label="增加数量"
          >
            +
          </button>
        </div>
        <span className="text-xs text-gray-300">库存 {stock} 件</span>
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
