"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort: number;
  _count: { products: number };
}

const emptyForm = { name: "", slug: "", icon: "", sort: 0 };
const MAX_UPLOAD_SIZE = 3 * 1024 * 1024;

export default function AdminCategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Batch selection
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedIds(new Set());
    setSelectAll(false);
    setExcludedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    if (selectAll) {
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
    const isAllSelected = selectAll && excludedIds.size === 0;
    if (isAllSelected) {
      setSelectAll(false);
      setSelectedIds(new Set());
      setExcludedIds(new Set());
    } else {
      setSelectAll(true);
      setExcludedIds(new Set());
    }
  };

  const deletableCategories = categories.filter((c) => c._count.products === 0);
  const selectedCount = selectAll ? Math.max(0, deletableCategories.length - excludedIds.size) : selectedIds.size;

  const handleBatchDelete = async () => {
    let ids: string[];
    if (selectAll) {
      ids = deletableCategories.filter((c) => !excludedIds.has(c.id)).map((c) => c.id);
    } else {
      ids = [...selectedIds];
    }
    if (ids.length === 0) return;
    if (!confirm(`确定删除选中的 ${ids.length} 个分类？此操作不可撤销。`)) return;
    setBatchDeleting(true);

    const res = await fetch("/api/admin/categories/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      const data = await res.json();
      toast(`已删除 ${data.deleted} 个分类`, "success");
      exitBatchMode();
      router.refresh();
    } else {
      const data = await res.json();
      toast(data.error || "批量删除失败", "error");
    }
    setBatchDeleting(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      toast(`图片过大（${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩到 3MB 以内后重试`, "error");
      e.target.value = "";
      return;
    }
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    if (res.ok) {
      const json = await res.json();
      setForm({ ...form, icon: json.url });
    } else {
      const json = await res.json();
      toast(json.error || "上传失败", "error");
    }
    setUploading(false);
    e.target.value = "";
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, icon: c.icon || "", sort: c.sort });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);

    const body: any = { name: form.name, slug: form.slug, icon: form.icon || null, sort: form.sort };

    if (editingId) {
      await fetch(`/api/admin/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setSaving(false);
    setShowForm(false);
    router.refresh();
  };

  const handleDelete = async (c: Category) => {
    if (c._count.products > 0) {
      toast(`该分类下有 ${c._count.products} 个商品，无法删除`, "error");
      return;
    }
    if (!confirm(`确定删除分类"${c.name}"？`)) return;

    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast(data.error || "删除失败", "error");
      return;
    }
    router.refresh();
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <h3 className="text-base font-bold text-gray-700 mb-4">
          {editingId ? "✏️ 编辑分类" : "➕ 新增分类"}
        </h3>
        <div className="grid grid-cols-2 gap-3 max-w-xl">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">名称 *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-sakura" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">标识 (slug) *</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-sakura" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">分类图标</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            {form.icon ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                <Image src={form.icon} alt="分类图标" fill className="object-cover" sizes="64px" />
                <button
                  onClick={() => setForm({ ...form, icon: "" })}
                  className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-bl-lg"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-sakura-400 hover:text-sakura-400 transition-colors text-2xl"
              >
                {uploading ? "..." : "+"}
              </button>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">排序</label>
            <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value) || 0 })} className="input-sakura" />
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
      <div className="flex justify-end mb-4 gap-2">
        {batchMode ? (
          <>
            <span className="text-xs text-gray-400 self-center">
              {selectAll ? `已选全部 ${selectedCount} 个` : `已选 ${selectedIds.size} 个`}
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
            <button onClick={openNew} className="btn-sakura text-xs">+ 新增分类</button>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-50">
              {batchMode && (
                <th className="py-3 px-4 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={(selectAll && excludedIds.size === 0) || (!selectAll && selectedIds.size > 0 && selectedIds.size === deletableCategories.length)}
                    onChange={handleSelectAll}
                    className="w-4 h-4 accent-sakura-500"
                  />
                </th>
              )}
              <th className="py-3 px-4 font-medium">图标</th>
              <th className="py-3 px-4 font-medium">名称</th>
              <th className="py-3 px-4 font-medium">标识</th>
              <th className="py-3 px-4 font-medium">排序</th>
              <th className="py-3 px-4 font-medium">商品数</th>
              <th className="py-3 px-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={batchMode ? 7 : 6} className="py-10 text-center text-gray-400">暂无分类</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${batchMode && (selectAll ? !excludedIds.has(c.id) : selectedIds.has(c.id)) ? "bg-sakura-50/50" : ""}`}>
                  {batchMode && (
                    <td className="py-3 px-4">
                      {c._count.products === 0 && (
                        <input
                          type="checkbox"
                          checked={selectAll ? !excludedIds.has(c.id) : selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="w-4 h-4 accent-sakura-500"
                        />
                      )}
                    </td>
                  )}
                  <td className="py-3 px-4">
                    {c.icon ? (
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                        <Image src={c.icon} alt={c.name} fill className="object-cover" sizes="32px" />
                      </div>
                    ) : "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{c.name}</td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-xs">{c.slug}</td>
                  <td className="py-3 px-4 text-gray-600">{c.sort}</td>
                  <td className="py-3 px-4 text-gray-600">{c._count.products}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-xs text-sakura-500 hover:underline">编辑</button>
                      <button onClick={() => handleDelete(c)} className="text-xs text-red-400 hover:underline">删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
