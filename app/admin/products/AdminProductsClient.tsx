"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

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
  const { toast } = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Batch selection state
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

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

  // Reset selection when filters/search/page change (but keep individual IDs valid)
  useEffect(() => {
    setSelectAll(false);
  }, [search, categoryFilter]);

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedIds(new Set());
    setSelectAll(false);
    setExcludedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    if (selectAll) {
      // In select-all mode: toggle exclusion
      setExcludedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedIds(new Set());
      setExcludedIds(new Set());
    } else {
      setSelectAll(true);
      setSelectedIds(new Set(products.map((p) => p.id)));
      setExcludedIds(new Set());
    }
  };

  const selectedCount = selectAll ? Math.max(0, total - excludedIds.size) : selectedIds.size;

  const handleBatchDelete = async () => {
    if (selectedCount === 0) return;
    if (!confirm(`确定删除 ${selectedCount} 个商品？此操作不可撤销。`)) return;
    setBatchDeleting(true);

    const body: Record<string, unknown> = { selectAll };
    if (selectAll) {
      // Send filter criteria so the API deletes all matching products
      if (search) body.search = search;
      if (categoryFilter) body.categoryId = categoryFilter;
      if (excludedIds.size > 0) body.excludedIds = [...excludedIds];
    } else {
      body.ids = [...selectedIds];
    }

    const res = await fetch("/api/admin/products/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      toast(`已删除 ${data.deleted} 个商品`, "success");
      exitBatchMode();
      router.refresh();
      fetchProducts();
    } else {
      const data = await res.json();
      toast(data.error || "批量删除失败", "error");
    }
    setBatchDeleting(false);
  };

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
      toast(`图片过大（${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩到 5MB 以内后重试`, "error");
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
      toast(data.error || "上传失败", "error");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!form.name || !form.categoryId || !form.price) return;
    if (form.price <= 0) {
      toast("价格必须大于0", "error");
      return;
    }
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
                  <div key={i} className="relative w-16 h-16 group">
                    <Image src={url} alt="" fill className="object-cover rounded-lg" sizes="64px" />
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
      {/* Toolbar */}
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
        <div className="flex items-center gap-2">
          {batchMode ? (
            <>
              <span className="text-xs text-gray-400">
                {selectAll
                  ? excludedIds.size > 0
                    ? `已选 ${total - excludedIds.size} 件（已排除 ${excludedIds.size} 件）`
                    : `已选全部 ${total} 件`
                  : `已选 ${selectedIds.size} 件`}
              </span>
              <button
                onClick={handleBatchDelete}
                disabled={selectedCount === 0 || batchDeleting}
                className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {batchDeleting ? "删除中..." : "删除选中"}
              </button>
              <button onClick={exitBatchMode} className="btn-sakura-outline text-xs">取消</button>
            </>
          ) : (
            <>
              <button onClick={() => setBatchMode(true)} className="btn-sakura-outline text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                批量操作
              </button>
              <button onClick={openNew} className="btn-sakura text-xs">+ 新增商品</button>
            </>
          )}
        </div>
      </div>

      {/* Select all bar shown in batch mode */}
      {batchMode && (
        <div className="bg-sakura-50 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-sakura-500 transition-colors">
            <input
              type="checkbox"
              checked={(selectAll && excludedIds.size === 0) || (!selectAll && selectedIds.size > 0 && selectedIds.size === total)}
              onChange={handleSelectAll}
              className="w-4 h-4 accent-sakura-500"
            />
            全选所有 {total} 件商品
          </label>
          {!((selectAll && excludedIds.size === 0) || (!selectAll && selectedIds.size > 0 && selectedIds.size === total)) && (
            <span className="text-xs text-gray-400">
              （勾选此项会选中符合当前筛选条件的所有商品，不受翻页影响）
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-50">
              {batchMode && <th className="py-3 px-4 font-medium w-10"></th>}
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
              <tr><td colSpan={batchMode ? 8 : 7} className="py-10 text-center text-gray-400">加载中...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={batchMode ? 8 : 7} className="py-10 text-center text-gray-400">暂无商品</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${batchMode && (selectAll ? !excludedIds.has(p.id) : selectedIds.has(p.id)) ? "bg-sakura-50/50" : ""}`}>
                  {batchMode && (
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectAll ? !excludedIds.has(p.id) : selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="w-4 h-4 accent-sakura-500"
                      />
                    </td>
                  )}
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
