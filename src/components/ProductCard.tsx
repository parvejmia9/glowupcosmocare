"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QuickAddModal from "@/components/QuickAddModal";

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  minPrice: number;
  badge: string | null;
  brandName: string;
  primaryImage: string | null;
}

export default function ProductCard({ id, name, slug, minPrice, badge, brandName, primaryImage }: ProductCardProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [orderNow, setOrderNow] = useState(false);

  return (
    <>
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col w-full">
        <Link href={`/product/${slug}`} className="block">
          <div className="relative overflow-hidden aspect-square bg-gray-50">
            <Image
              src={primaryImage || "/placeholder.png"}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {badge && (
              <span className={`absolute top-3 left-3 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm ${badge.toUpperCase() === "SALE" ? "bg-red-500" : badge.toUpperCase() === "NEW" ? "bg-emerald-500" : "bg-pink-600"}`}>
                {badge}
              </span>
            )}
          </div>
        </Link>
        <div className="p-4 flex flex-col flex-1">
          <Link href={`/product/${slug}`}>
            <h3 className="font-semibold text-[15px] text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">{name}</h3>
          </Link>
          {brandName && <p className="text-xs text-gray-400 mt-0.5">{brandName}</p>}
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-lg font-bold text-gray-900">{minPrice > 0 ? `৳${minPrice.toLocaleString()}` : "N/A"}</span>
          </div>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="w-full mt-auto pt-3 bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            Add to Cart
          </button>
        </div>
      </div>
      {showQuickAdd && (
        <QuickAddModal productId={id} showOrderNow={orderNow} onClose={() => {
          setShowQuickAdd(false);
          setOrderNow(false);
        }} />
      )}
    </>
  );
}
