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
                <Image src={form.icon} alt="" fill className="object-cover" sizes="64px" />
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
              <th className="py-3 px-4 font-medium">商品数</th>
              <th className="py-3 px-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">暂无分类</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    {c.icon ? (
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                        <Image src={c.icon} alt="" fill className="object-cover" sizes="32px" />
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
