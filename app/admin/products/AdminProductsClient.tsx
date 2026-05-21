"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  status: string;
  sales: number;
  source: string | null;
  images: string;
  categoryId: string;
  category: { id: string; name: string };
  createdAt: string;
}

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  originalPrice: 0,
  stock: 0,
  status: "ON",
  source: "",
  categoryId: "",
  images: [] as string[],
  imageInput: "",
};

export default function AdminProductsClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (categoryFilter) params.set("categoryId", categoryFilter);
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.products);
    setTotal(data.total);
    setLoading(false);
  }, [page, search, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    let images: string[] = [];
    try { images = JSON.parse(p.images); } catch {}
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      originalPrice: p.originalPrice || 0,
      stock: p.stock,
      status: p.status,
      source: p.source || "",
      categoryId: p.categoryId,
      images,
      imageInput: "",
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || "" });
    setShowForm(true);
  };

  const addImage = () => {
    if (form.imageInput.trim()) {
      setForm({ ...form, images: [...form.images, form.imageInput.trim()], imageInput: "" });
    }
  };

  const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      alert(`图片过大（${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩到 5MB 以内后重试`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setForm({ ...form, images: [...form.images, data.url] });
    } else {
      const data = await res.json();
      alert(data.error || "上传失败");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!form.name || !form.categoryId || !form.price) return;
    setSaving(true);

    const { imageInput, ...data } = form;
    if (editingId) {
      await fetch(`/api/admin/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    setSaving(false);
    setShowForm(false);
    router.refresh();
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该商品？")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
    fetchProducts();
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <h3 className="text-base font-bold text-gray-700 mb-4">
          {editingId ? "✏️ 编辑商品" : "➕ 新增商品"}
        </h3>
        <div className="grid grid-cols-2 gap-3 max-w-xl">
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">商品名称 *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-sakura" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">价格 *</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="input-sakura" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">原价</label>
            <input type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: parseFloat(e.target.value) || 0 })} className="input-sakura" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">库存</label>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="input-sakura" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">分类 *</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-sakura">
              <option value="">选择分类</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">状态</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-sakura">
              <option value="ON">上架</option>
              <option value="OFF">下架</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">作品来源</label>
            <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="input-sakura" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">描述</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-sakura" rows={3} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">图片</label>
            <div className="flex gap-2">
              <input type="text" value={form.imageInput} onChange={(e) => setForm({ ...form, imageInput: e.target.value })} className="input-sakura flex-1" placeholder="图片URL..." />
              <button onClick={addImage} className="btn-sakura-outline text-xs">添加URL</button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-sakura-outline text-xs">
                {uploading ? "上传中..." : "本地上传"}
              </button>
              <span className="text-xs text-gray-400 self-center">支持 JPG/PNG/GIF/WebP，单张不超过 5MB</span>
            </div>
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button
                      onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving} className="btn-sakura text-sm">
            {saving ? "保存中..." : "保存"}
          </button>
          <button onClick={() => setShowForm(false)} className="btn-sakura-outline text-sm">取消</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="搜索商品..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (() => { setPage(1); fetchProducts(); })()}
            className="input-sakura text-sm w-48"
          />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="input-sakura text-sm w-36"
          >
            <option value="">全部类别</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <button onClick={() => { setPage(1); fetchProducts(); }} className="btn-sakura-outline text-xs">搜索</button>
        </div>
        <button onClick={openNew} className="btn-sakura text-xs">+ 新增商品</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-50">
              <th className="py-3 px-4 font-medium">商品</th>
              <th className="py-3 px-4 font-medium">价格</th>
              <th className="py-3 px-4 font-medium">库存</th>
              <th className="py-3 px-4 font-medium">销量</th>
              <th className="py-3 px-4 font-medium">状态</th>
              <th className="py-3 px-4 font-medium">分类</th>
              <th className="py-3 px-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">加载中...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">暂无商品</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-700">{p.name}</td>
                  <td className="py-3 px-4 text-sakura-500 font-medium">¥{p.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-600">{p.stock}</td>
                  <td className="py-3 px-4 text-gray-600">{p.sales}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs ${p.status === "ON" ? "text-green-500" : "text-gray-300"}`}>
                      {p.status === "ON" ? "上架" : "下架"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{p.category.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-sakura-500 hover:underline">编辑</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:underline">删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 10 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(total / 10) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm ${
                page === i + 1 ? "bg-sakura-500 text-white" : "bg-white text-gray-600 border border-gray-100 hover:border-sakura-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
