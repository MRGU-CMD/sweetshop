"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  specInfo: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    images: string;
    stock: number;
    status: string;
  };
}

export default function CartClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchCart();
    }
  }, [status, router, fetchCart]);

  const updateQty = async (id: string, qty: number) => {
    const res = await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantity: qty }),
    });
    if (res.ok) fetchCart();
  };

  const removeItem = async (id: string) => {
    await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    fetchCart();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  };

  const selectedItems = items.filter((i) => selected.has(i.id));
  const total = selectedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    const ids = selectedItems.map((i) => i.id).join(",");
    router.push(`/checkout?items=${ids}`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">🛒 购物车</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-gray-400 mb-4">购物车为空</p>
          <Link href="/" className="btn-sakura inline-block text-sm">
            去逛逛
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-50">
            <div className="flex items-center px-6 py-3 bg-gray-50 text-xs text-gray-400 font-medium">
              <label className="flex items-center gap-3 w-10">
                <input
                  type="checkbox"
                  checked={selected.size === items.length && items.length > 0}
                  onChange={toggleAll}
                  className="accent-sakura-500"
                />
              </label>
              <span className="flex-1">商品</span>
              <span className="w-24 text-center">单价</span>
              <span className="w-28 text-center">数量</span>
              <span className="w-24 text-center">小计</span>
              <span className="w-16 text-center">操作</span>
            </div>

            {items.map((item) => {
              const imgList = JSON.parse(item.product.images || "[]") as string[];
              return (
                <div key={item.id} className="flex items-center px-6 py-4 border-b border-gray-50 last:border-0">
                  <label className="flex items-center gap-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="accent-sakura-500"
                    />
                  </label>
                  <div className="flex-1 flex items-center gap-3">
                    <Link href={`/product/${item.product.id}`} className="w-16 h-16 bg-gradient-to-br from-sakura-50 to-purple-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {imgList[0] ? (
                        <img src={imgList[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="opacity-40">🧸</span>
                      )}
                    </Link>
                    <div>
                      <Link href={`/product/${item.product.id}`} className="text-sm text-gray-700 hover:text-sakura-500 line-clamp-2">
                        {item.product.name}
                      </Link>
                      {item.specInfo && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.specInfo}</p>
                      )}
                    </div>
                  </div>
                  <span className="w-24 text-center text-sm text-sakura-500 font-semibold">
                    ¥{item.product.price}
                  </span>
                  <div className="w-28 flex justify-center">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-sakura-500 text-sm"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-sakura-500 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <span className="w-24 text-center text-sm font-semibold text-sakura-500">
                    ¥{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <div className="w-16 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-gray-300 hover:text-red-400"
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-0 mt-4 bg-white rounded-2xl border border-gray-50 px-6 py-4 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.size === items.length && items.length > 0}
                onChange={toggleAll}
                className="accent-sakura-500"
              />
              全选
            </label>
            <button
              onClick={() => selected.forEach((id) => removeItem(id))}
              className="text-sm text-gray-400 hover:text-red-400"
            >
              删除选中
            </button>
            <div className="flex-1 text-right">
              <span className="text-sm text-gray-400">
                已选 <span className="text-sakura-500 font-bold">{selected.size}</span> 件
              </span>
              <span className="ml-4 text-sm text-gray-500">
                合计：<span className="text-2xl font-bold text-sakura-500">¥{total.toFixed(2)}</span>
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={selected.size === 0}
              className="btn-sakura text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              去结算
            </button>
          </div>
        </>
      )}
    </div>
  );
}
