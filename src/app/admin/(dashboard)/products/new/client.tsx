"use client";

import { useState } from "react";
import ProductForm from "@/components/ProductForm";

export default function NewProductClient({ categories }: { categories: { id: number; name: string }[] }) {
  const [isActive, setIsActive] = useState(true);

  return (
    <div>
      <div className="max-w-3xl flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">New Product</h1>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold tracking-wide ${isActive ? "text-green-600" : "text-gray-400"}`}>
            {isActive ? "Active" : "Inactive"}
          </span>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span className={`pointer-events-none inline-block h-[22px] w-[22px] rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
              isActive ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
        </div>
      </div>
      <ProductForm categories={categories} isActive={isActive} />
    </div>
  );
}
