"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
}

export default function FeaturedProductsManager({ products, currentIds }: { products: Product[]; currentIds: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>(
    currentIds ? currentIds.split(",").map(Number).filter(Boolean) : []
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const toggle = (id: number) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const save = async () => {
    setLoading(true);
    setSuccess("");
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured_product_ids: selected.join(",") }),
    });
    setLoading(false);
    setSuccess("Saved!");
    setTimeout(() => setSuccess(""), 2000);
    router.refresh();
  };

  return (
    <div className="bg-white border rounded-xl p-6 max-w-lg mb-6">
      <h2 className="text-lg font-bold mb-2">Featured Products</h2>
      <p className="text-sm text-gray-500 mb-4">Select up to 4 products to showcase on the homepage.</p>

      <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
        {products.map((p) => (
          <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={() => toggle(p.id)}
              disabled={!selected.includes(p.id) && selected.length >= 4}
              className="accent-pink-600"
            />
            <span className="text-sm">{p.name}</span>
          </label>
        ))}
        {products.length === 0 && (
          <p className="px-3 py-4 text-center text-gray-400 text-sm">No active products</p>
        )}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button onClick={save} disabled={loading}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
          {loading ? "Saving..." : "Save Featured"}
        </button>
        {success && <span className="text-green-600 text-sm">{success}</span>}
        <span className="text-xs text-gray-400 ml-auto">{selected.length}/4 selected</span>
      </div>
    </div>
  );
}
