"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort: number;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  _count: { products: number };
}

const emptyForm = { name: "", slug: "", icon: "", sort: 0, parentId: "" };

export default function AdminCategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(categories);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const parentOptions = items.filter((c) => c.id !== editingId);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, icon: c.icon || "", sort: c.sort, parentId: c.parentId || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);

    const body: any = { name: form.name, slug: form.slug, icon: form.icon || null, sort: form.sort, parentId: form.parentId || null };

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
            <label className="text-xs text-gray-400 mb-1 block">图标 (emoji)</label>
            <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-sakura" placeholder="如: 🎀" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">排序</label>
            <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value) || 0 })} className="input-sakura" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">父级分类</label>
            <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="input-sakura">
              <option value="">无 (顶级分类)</option>
              {parentOptions.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
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
      <div className="flex justify-end mb-4">
        <button onClick={openNew} className="btn-sakura text-xs">+ 新增分类</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-50">
              <th className="py-3 px-4 font-medium">图标</th>
              <th className="py-3 px-4 font-medium">名称</th>
              <th className="py-3 px-4 font-medium">标识</th>
              <th className="py-3 px-4 font-medium">排序</th>
              <th className="py-3 px-4 font-medium">父级</th>
              <th className="py-3 px-4 font-medium">商品数</th>
              <th className="py-3 px-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">暂无分类</td></tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-lg">{c.icon || "—"}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{c.name}</td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-xs">{c.slug}</td>
                  <td className="py-3 px-4 text-gray-600">{c.sort}</td>
                  <td className="py-3 px-4 text-gray-400">{c.parent?.name || "—"}</td>
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
