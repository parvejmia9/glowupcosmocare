"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "" });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm({ name: "" });
      load();
      router.refresh();
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => { setEditId(null); setForm({ name: "" }); setShowForm(true); }}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >+ Add Category</button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6 max-w-md">
          <h2 className="text-lg font-bold mb-4">{editId ? "Edit Category" : "New Category"}</h2>
          <div className="space-y-3">
            <input
              placeholder="Category Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button onClick={save} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">Save</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="hidden sm:table w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold">Slug</th>
              <th className="text-left px-4 py-3 font-semibold">Products</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                <td className="px-4 py-3 text-gray-500">{cat._count?.products ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { setEditId(cat.id); setForm({ name: cat.name }); setShowForm(true); }}
                    className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                  >Edit</button>
                  <button onClick={() => remove(cat.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No categories yet</td></tr>
            )}
          </tbody>
        </table>
        <div className="sm:hidden divide-y">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat._count?.products ?? 0} products</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setEditId(cat.id); setForm({ name: cat.name }); setShowForm(true); }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >Edit</button>
                  <button onClick={() => remove(cat.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-400 text-sm">No categories yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
