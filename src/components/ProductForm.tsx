"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProductData {
  id: number;
  name: string;
  slug: string;
  description: string;

  badge: string | null;
  categoryId: number | null;
  isActive: boolean;
  brandName: string;
  images: { id: number; path: string }[];
  variants: { size: string; price: number; discountPrice: number | null; stockCount: number; sku: string }[];
}

interface CategoryData {
  id: number;
  name: string;
}

export default function ProductForm({ categories, product, isActive }: { categories: CategoryData[]; product?: ProductData; isActive: boolean }) {
  const router = useRouter();
  const isEdit = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");

  const [badge, setBadge] = useState(product?.badge || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId?.toString() || "");
  const [brandName, setBrandName] = useState(product?.brandName || "");

  // Variants — each row: size + price + discount price + stock
  const [variants, setVariants] = useState<{ size: string; price: string; discountPrice: string; stockCount: string; sku: string }[]>(
    product?.variants?.map((v) => ({ size: v.size, price: v.price.toString(), discountPrice: v.discountPrice?.toString() || "", stockCount: v.stockCount.toString(), sku: v.sku })) || [{ size: "", price: "0", discountPrice: "", stockCount: "0", sku: "" }]
  );

  const addVariant = () => setVariants([...variants, { size: "", price: "0", discountPrice: "", stockCount: "0", sku: "" }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: string, value: string) => {
    const updated = [...variants];
    updated[i] = { ...updated[i], [field]: value };
    setVariants(updated);
  };

  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_IMAGES = 3;
  const existingImages = product?.images.filter((img) => !deleteImageIds.includes(img.id)) || [];
  const totalImages = existingImages.length + previewFiles.length;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const remaining = MAX_IMAGES - totalImages;
      if (remaining <= 0) return;
      const newFiles = Array.from(files).slice(0, remaining);
      setPreviewFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePreviewFile = (index: number) => {
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);

    if (badge) formData.set("badge", badge);
    if (categoryId) formData.set("category_id", categoryId);
    formData.set("is_active", isActive ? "true" : "false");
    formData.set("brand_name", brandName);

    for (const file of previewFiles) {
      formData.append("images", file);
    }

    if (deleteImageIds.length > 0) {
      formData.set("delete_images", deleteImageIds.join(","));
    }

    for (const v of variants) {
      if (!v.size) continue;
      formData.append("variant_size", v.size);
      formData.append("variant_price", v.price);
      formData.append("variant_discount_price", v.discountPrice || "");
      formData.append("variant_stock", v.stockCount);
      formData.append("variant_sku", v.sku);
    }

    try {
      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-6 max-w-3xl">
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

      <div>
        <label className="block text-base font-bold text-gray-800 mb-1">Product Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter product name"
          className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-base font-bold text-gray-800 mb-1">Brand Name</label>
        <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Garnier, CeraVe"
          className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-base font-bold text-gray-800 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Product description"
          className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-base font-bold text-gray-800 mb-1">Badge</label>
        <input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. Sale, New"
          className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-base font-bold text-gray-800 mb-1">Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm">
          <option value="">No Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Images */}
      <div>
        <label className="block text-base font-bold text-gray-800 mb-2">Product Images <span className="text-xs font-normal text-gray-400">(max {MAX_IMAGES})</span></label>
        <div className="flex gap-3 flex-wrap">
          {existingImages.map((img) => (
            <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
              <Image src={img.path} alt="" fill className="object-cover" sizes="96px" />
              <button type="button" onClick={() => setDeleteImageIds([...deleteImageIds, img.id])}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">×</span>
              </button>
            </div>
          ))}
          {previewFiles.map((file, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removePreviewFile(i)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">×</span>
              </button>
            </div>
          ))}
          {totalImages < MAX_IMAGES && (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] font-medium">Add Image</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFilesSelected}
          className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none" />
      </div>

      {/* Variants */}
      <div>
        <label className="block text-base font-bold text-gray-800 mb-2">Variants *</label>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[11px] text-gray-400 mb-1">Variant (e.g. 50ml, 2 pc)</label>
                <input value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)}
                  placeholder="e.g. 50ml, 1 set, 2 pc" className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="w-28">
                <label className="block text-[11px] text-gray-400 mb-1">Price (৳)</label>
                <input type="number" min="0" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)}
                  placeholder="0" className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="w-28">
                <label className="block text-[11px] text-gray-400 mb-1">Discount (৳)</label>
                <input type="number" min="0" value={v.discountPrice} onChange={(e) => updateVariant(i, "discountPrice", e.target.value)}
                  placeholder="Optional" className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="w-28">
                <label className="block text-[11px] text-gray-400 mb-1">Stock</label>
                <input type="number" min="0" value={v.stockCount} onChange={(e) => updateVariant(i, "stockCount", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="w-28">
                <label className="block text-[11px] text-gray-400 mb-1">SKU</label>
                <input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)}
                  placeholder="Optional" className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              {variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(i)}
                  className="text-red-500 hover:text-red-700 text-sm pb-2">✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addVariant}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Variant</button>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50">
          {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm border hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
