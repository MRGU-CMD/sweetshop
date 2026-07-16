"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { regionData, type RegionItem } from "@/lib/regions";
import { useToast } from "@/components/ui/Toast";
import { AddressesIcon } from "@/components/user/UserIcons";

interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  zipCode: string | null;
  isDefault: boolean;
}

const emptyAddress = {
  name: "",
  phone: "",
  province: "",
  city: "",
  district: "",
  detail: "",
  zipCode: "",
  isDefault: false,
};

export default function AddressesClient({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);

  const selectedProvince = useMemo(() => regionData.find((p) => p.name === form.province), [form.province]);
  const selectedCity = useMemo(() => selectedProvince?.children?.find((c: RegionItem) => c.name === form.city), [selectedProvince, form.city]);
  // 直辖市 / 特别行政区：children 直接是区级，没有下级城市
  const isDirectMunicipality = useMemo(() => {
    if (!selectedProvince?.children?.length) return false;
    return !selectedProvince.children.some((c: RegionItem) => c.children);
  }, [selectedProvince]);
  const cityHasDistricts = useMemo(() => !!(selectedCity?.children?.length), [selectedCity]);

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      zipCode: addr.zipCode || "",
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyAddress);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.detail || !form.province) {
      toast("请填写完整的收货信息", "error");
      return;
    }
    setSaving(true);

    try {
      const res = await fetch(editingId ? `/api/addresses?id=${editingId}` : "/api/addresses", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast(editingId ? "地址已更新" : "地址已添加", "success");
        setShowForm(false);
        router.refresh();
      } else {
        toast("保存失败，请重试", "error");
      }
    } catch {
      toast("网络错误，请重试", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("地址已删除", "success");
        router.refresh();
      }
    } catch {
      toast("删除失败", "error");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        toast("已设为默认地址", "success");
        router.refresh();
      }
    } catch {
      toast("操作失败", "error");
    }
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <h3 className="text-base font-bold text-gray-700 mb-4">
          {editingId ? "编辑地址" : "新增地址"}
        </h3>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">收货人 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-sakura"
              placeholder="姓名"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">手机号 *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-sakura"
              placeholder="手机号"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">省份 *</label>
            <select
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value, city: "", district: "" })}
              className="input-sakura"
            >
              <option value="">请选择省份</option>
              {regionData.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* 直辖市/特别行政区：省份 → 区（两级） */}
          {isDirectMunicipality ? (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">区</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value, district: "" })}
                className="input-sakura"
                disabled={!selectedProvince}
              >
                <option value="">请选择区</option>
                {selectedProvince?.children?.map((c: RegionItem) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            /* 普通省份：城市（必选） */
            <div>
              <label className="text-xs text-gray-400 mb-1 block">城市</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value, district: "" })}
                className="input-sakura"
                disabled={!selectedProvince?.children}
              >
                <option value="">请选择城市</option>
                {selectedProvince?.children?.map((c: RegionItem) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 第三级：区/县（有数据才显示） */}
          {!isDirectMunicipality && cityHasDistricts && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">区/县</label>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="input-sakura"
              >
                <option value="">请选择区县</option>
                {selectedCity!.children!.map((d: RegionItem) => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
          {!isDirectMunicipality && !cityHasDistricts && (
            <div />
          )}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">邮编</label>
            <input
              type="text"
              value={form.zipCode}
              onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              className="input-sakura"
              placeholder="邮编"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">详细地址 *</label>
            <input
              type="text"
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              className="input-sakura"
              placeholder="街道、门牌号等"
            />
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="accent-sakura-500"
              />
              <span className="text-gray-600">设为默认地址</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving} className="btn-sakura text-sm">
            {saving ? "保存中..." : "保存"}
          </button>
          <button onClick={() => setShowForm(false)} className="btn-sakura-outline text-sm">
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={openNew} className="btn-sakura text-xs px-3 py-1.5 mb-4">
        + 新增地址
      </button>

      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-xl border p-4 ${
                addr.isDefault ? "border-sakura-300 bg-sakura-50/30" : "border-gray-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{addr.name}</span>
                    <span className="text-sm text-gray-400">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-sakura-500 text-white px-1.5 py-0.5 rounded">默认</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {addr.province} {addr.city} {addr.district} {addr.detail}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-gray-400 hover:text-sakura-500"
                    >
                      设为默认
                    </button>
                  )}
                  <button onClick={() => openEdit(addr)} className="text-xs text-gray-400 hover:text-sakura-500">
                    编辑
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="text-xs text-gray-300 hover:text-red-500">
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 text-center">
          <div className="text-gray-300 mb-3 flex justify-center"><AddressesIcon className="w-10 h-10" /></div>
          <p className="text-gray-400 text-sm">暂无收货地址</p>
        </div>
      )}
    </div>
  );
}
