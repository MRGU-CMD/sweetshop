"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { useTransition } from "@/components/TransitionProvider";
import { regionData, type RegionItem } from "@/lib/regions";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: { id: string; name: string; price: number; images: string };
}

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  zipCode: string;
  isDefault: boolean;
}

function emptyAddress() {
  return { name: "", phone: "", province: "", city: "", district: "", detail: "", zipCode: "" };
}

export default function CheckoutClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startLoading } = useTransition();

  const [step, setStep] = useState(1);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useSaved, setUseSaved] = useState(true);

  const [address, setAddress] = useState(emptyAddress());

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("wechat");

  const fetchItems = useCallback(async () => {
    const ids = searchParams.get("items");
    if (!ids) return;
    const itemIds = ids.split(",");
    const res = await fetch("/api/cart");
    if (res.ok) {
      const allItems = await res.json();
      setItems(allItems.filter((i: CartItem) => itemIds.includes(i.id)));
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") fetchItems();
  }, [status, router, fetchItems]);

  // Fetch saved addresses
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/addresses")
        .then((r) => r.json())
        .then((addrs: SavedAddress[]) => {
          setSavedAddresses(addrs);
          if (addrs.length > 0) {
            const def = addrs.find((a) => a.isDefault) || addrs[0];
            setSelectedAddressId(def.id);
            setAddress({
              name: def.name,
              phone: def.phone,
              province: def.province || "",
              city: def.city || "",
              district: def.district || "",
              detail: def.detail,
              zipCode: def.zipCode || "",
            });
            setUseSaved(true);
          }
        })
        .catch(() => {});
    }
  }, [status]);

  const selectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setUseSaved(true);
    setAddress({
      name: addr.name,
      phone: addr.phone,
      province: addr.province || "",
      city: addr.city || "",
      district: addr.district || "",
      detail: addr.detail,
      zipCode: addr.zipCode || "",
    });
  };

  const clearAddress = () => {
    setSelectedAddressId(null);
    setUseSaved(false);
    setAddress(emptyAddress());
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const [addressError, setAddressError] = useState("");

  // Region cascade
  const selectedProvince = useMemo(() => regionData.find((p) => p.name === address.province), [address.province]);
  const selectedCity = useMemo(() => selectedProvince?.children?.find((c: RegionItem) => c.name === address.city), [selectedProvince, address.city]);

  const handleNext = () => {
    if (step === 1) {
      if (!address.name || !address.phone || !address.detail || !address.province) {
        setAddressError("请填写收货人、手机号、省份和详细地址");
        return;
      }
      setAddressError("");
    }
    setStep(step + 1);
  };

  const handleSubmitOrder = async () => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItemIds: items.map((i) => i.id),
        address,
        paymentMethod,
      }),
    });

    if (res.ok) {
      const order = await res.json();
      startLoading("下单成功...");
      router.push(`/order-success?orderId=${order.id}&orderNo=${order.orderNo}&total=${total}&payment=${paymentMethod}`);
    }
  };

  if (status === "loading" || loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">加载中...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">没有需要结算的商品</p>
        <Link href="/cart" className="text-sakura-500 text-sm mt-2 inline-block hover:underline">
          返回购物车
        </Link>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "确认地址" },
    { num: 2, label: "选择支付" },
    { num: 3, label: "确认提交" },
  ];

  const paymentMethods = [
    { value: "wechat", label: "微信支付", icon: "💚", color: "#07c160" },
    { value: "alipay", label: "支付宝", icon: "💙", color: "#1677ff" },
    { value: "card", label: "银行卡", icon: "💳", color: "#333" },
  ];

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full">
        <h1 className="text-xl font-bold text-gray-800 mb-6">📋 订单结算</h1>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex items-center gap-1 sm:gap-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                    step >= s.num
                      ? "bg-sakura-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={`text-xs sm:text-sm font-medium ${step >= s.num ? "text-sakura-500" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 ${step > s.num ? "bg-sakura-500" : "bg-gray-100"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main */}
          <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-50 p-6">
            {/* Step 1: Address */}
            {step === 1 && (
              <div>
                <h2 className="text-base font-bold text-gray-700 mb-4">📍 收货地址</h2>

                {/* Saved addresses */}
                {savedAddresses.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">已保存的地址</span>
                      <button
                        onClick={clearAddress}
                        className={`text-xs transition-colors ${
                          useSaved ? "text-sakura-500 hover:underline" : "text-gray-400"
                        }`}
                      >
                        + 使用新地址
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          onClick={() => selectSavedAddress(addr)}
                          className={`block p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            useSaved && selectedAddress?.id === addr.id
                              ? "border-sakura-500 bg-sakura-50"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="savedAddress"
                              checked={useSaved && selectedAddress?.id === addr.id}
                              onChange={() => selectSavedAddress(addr)}
                              className="accent-sakura-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{addr.name}</span>
                            <span className="text-xs text-gray-400">{addr.phone}</span>
                            {addr.isDefault && (
                              <span className="text-xs text-sakura-500 bg-sakura-50 px-1.5 py-0.5 rounded">默认</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 ml-6">
                            {addr.province} {addr.city} {addr.district} {addr.detail}
                          </p>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {addressError && (
                  <p className="text-xs text-red-500 mb-3">{addressError}</p>
                )}

                {/* Address form */}
                {(savedAddresses.length === 0 || !useSaved) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">收货人 *</label>
                      <input
                        type="text"
                        value={address.name}
                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                        className="input-sakura"
                        placeholder="姓名"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">手机号 *</label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        className="input-sakura"
                        placeholder="手机号"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">省份 *</label>
                      <select
                        value={address.province}
                        onChange={(e) => setAddress({ ...address, province: e.target.value, city: "", district: "" })}
                        className="input-sakura"
                      >
                        <option value="">请选择省份</option>
                        {regionData.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">城市</label>
                      <select
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value, district: "" })}
                        className="input-sakura"
                        disabled={!selectedProvince?.children}
                      >
                        <option value="">请选择城市</option>
                        {selectedProvince?.children?.map((c: RegionItem) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">区/县</label>
                      <select
                        value={address.district}
                        onChange={(e) => setAddress({ ...address, district: e.target.value })}
                        className="input-sakura"
                        disabled={!selectedCity?.children}
                      >
                        <option value="">请选择区县</option>
                        {selectedCity?.children?.map((d: RegionItem) => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">邮编</label>
                      <input
                        type="text"
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                        className="input-sakura"
                        placeholder="邮编"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-400 mb-1 block">详细地址 *</label>
                      <input
                        type="text"
                        value={address.detail}
                        onChange={(e) => setAddress({ ...address, detail: e.target.value })}
                        className="input-sakura"
                        placeholder="街道、门牌号等"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div>
                <h2 className="text-base font-bold text-gray-700 mb-4">💳 支付方式</h2>
                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <label
                      key={pm.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === pm.value
                          ? "border-sakura-500 bg-sakura-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.value}
                        checked={paymentMethod === pm.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-sakura-500"
                      />
                      <span className="text-lg">{pm.icon}</span>
                      <span className="text-sm font-medium" style={{ color: pm.color }}>
                        {pm.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div>
                <h2 className="text-base font-bold text-gray-700 mb-4">✅ 确认订单</h2>
                <div className="bg-sakura-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">收货人：</span>
                    {address.name} {address.phone}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">地址：</span>
                    {address.province} {address.city} {address.district} {address.detail}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">支付方式：</span>
                    {paymentMethods.find((p) => p.value === paymentMethod)?.label}
                  </p>
                </div>

                {/* Items */}
                <div className="mt-4 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 flex-1 truncate">{item.product.name}</span>
                      <span className="text-gray-400">×{item.quantity}</span>
                      <span className="text-sakura-500 font-medium">
                        ¥{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-50">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="btn-sakura-outline text-sm"
                >
                  ← 上一步
                </button>
              ) : (
                <Link href="/cart" className="btn-sakura-outline text-sm">
                  ← 返回购物车
                </Link>
              )}
              {step < 3 ? (
                <button onClick={handleNext} className="btn-sakura text-sm flex items-center gap-1">
                  下一步 →
                </button>
              ) : (
                <button onClick={handleSubmitOrder} className="btn-sakura text-sm">
                  确认下单
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-50 p-5 lg:sticky lg:top-20">
            <h3 className="text-sm font-bold text-gray-700 mb-4">订单汇总</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>商品总额</span>
                <span>¥{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>运费</span>
                <span className="text-green-500">免运费</span>
              </div>
            </div>
            <div className="border-t border-gray-50 mt-4 pt-4 flex justify-between">
              <span className="text-sm font-bold">实付金额</span>
              <span className="text-xl font-bold text-sakura-500">¥{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
  );
}
