"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

interface Variant {
  id: number;
  size: string;
  price: number;
  discountPrice: number | null;
  stockCount: number;
}

interface QuickAddProps {
  productId: number;
  onClose: () => void;
  showOrderNow?: boolean;
}

export default function QuickAddModal({ productId, onClose, showOrderNow }: QuickAddProps) {
  const { add, setCartOpen } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<{
    id: number;
    name: string;
    image: string;
    variants: Variant[];
  } | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          setProduct({
            id: data.product.id,
            name: data.product.name,
            image: data.product.images?.[0]?.imagePath || "/placeholder.png",
            variants: data.product.variants,
          });
          if (data.product.variants.length > 0) {
            setSelectedSize(data.product.variants[0].size);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const sizes = useMemo(() => {
    if (!product) return [];
    return [...new Set(product.variants.map((v) => v.size))];
  }, [product]);

  const selectedVariant = product?.variants.find((v) => v.size === selectedSize);

  const price = selectedVariant
    ? selectedVariant.discountPrice && selectedVariant.discountPrice > 0
      ? selectedVariant.discountPrice
      : selectedVariant.price
    : 0;

  const stockCount = selectedVariant?.stockCount ?? 0;

  const handleAdd = () => {
    if (!product || !selectedVariant || stockCount <= 0) return;
    add({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      size: selectedVariant.size,
      price,
      image: product.image,
      qty,
    });
    onClose();
    if (!showOrderNow) setCartOpen(true);
  };

  const handleOrderNow = () => {
    if (!product || !selectedVariant || stockCount <= 0) return;
    add({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      size: selectedVariant.size,
      price,
      image: product.image,
      qty,
    });
    onClose();
    setCartOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-pink-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <h3 className="text-base font-bold">Select Variant</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition text-lg"
          >×</button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading...</div>
        ) : !product || product.variants.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No variants available</div>
        ) : (
          <>
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 text-center">
              <div className="relative w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
              </div>
              <p className="font-bold text-gray-900">{product.name}</p>
              <p className="text-pink-600 font-bold text-lg mt-1">৳{price.toLocaleString()}</p>
            </div>

            <div className="px-5 py-5 flex-1 overflow-y-auto">
              <p className="text-center font-bold text-gray-900 mb-4">Choose Variant</p>
              <div className="flex flex-wrap justify-center gap-3 mb-5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSize(s); setQty(1); }}
                    className={`min-w-[52px] text-center px-4 py-2.5 rounded-lg text-sm font-bold transition border-2 cursor-pointer ${
                      selectedSize === s
                        ? "bg-pink-600 text-white border-pink-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-pink-300"
                    }`}
                  >{s}</button>
                ))}
              </div>

              {selectedVariant && (
                <p className={`text-sm font-medium text-center mt-3 ${stockCount > 0 ? "text-green-600" : "text-red-500"}`}>
                  {stockCount > 0 ? `${stockCount} in stock` : "Out of stock"}
                </p>
              )}

              {/* Quantity selector */}
              {selectedVariant && stockCount > 0 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => qty > 1 && setQty(qty - 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-lg hover:bg-gray-50 cursor-pointer"
                  >−</button>
                  <span className="w-10 text-center font-bold text-gray-900">{qty}</span>
                  <button
                    onClick={() => qty < stockCount && setQty(qty + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-lg hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={qty >= stockCount}
                  >+</button>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-gray-100 shrink-0">
              {showOrderNow ? (
                <button
                  onClick={handleOrderNow}
                  disabled={!selectedVariant || selectedVariant.stockCount <= 0}
                  className="w-full bg-pink-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-pink-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >Order Now</button>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={!selectedVariant || selectedVariant.stockCount <= 0}
                  className="w-full bg-pink-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-pink-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >Add to Cart</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
