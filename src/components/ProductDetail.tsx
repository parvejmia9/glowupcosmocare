"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

interface Variant {
  id: number;
  size: string;
  price: number;
  discountPrice: number | null;
  stockCount: number;
  sku: string;
}

interface ProductProps {
  product: {
    id: number;
    name: string;
    description: string;
    badge: string | null;
    brandName: string;
    images: { id: number; path: string }[];
    variants: Variant[];
  };
}

export default function ProductDetail({ product }: ProductProps) {
  const { add, setCartOpen } = useCart();
  const router = useRouter();

  const allSizes = useMemo(() => [...new Set(product.variants.map((v) => v.size))], [product.variants]);
  const [selectedSize, setSelectedSize] = useState(allSizes[0] || "");
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.images[0]?.path || "/placeholder.png");
  const [addedMsg, setAddedMsg] = useState("");

  const selectedVariant = product.variants.find((v) => v.size === selectedSize);
  const price = selectedVariant
    ? selectedVariant.discountPrice && selectedVariant.discountPrice > 0
      ? selectedVariant.discountPrice
      : selectedVariant.price
    : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }
    if (selectedVariant.stockCount <= 0) {
      alert("Out of stock");
      return;
    }
    add({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      size: selectedVariant.size,
      price,
      image: product.images[0]?.path || "/placeholder.png",
      qty,
    });
    setAddedMsg("Added to cart!");
    setTimeout(() => setAddedMsg(""), 2000);
    setCartOpen(true);
  };

  const handleOrderNow = () => {
    if (!selectedVariant || selectedVariant.stockCount <= 0) return;
    add({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      size: selectedVariant.size,
      price,
      image: product.images[0]?.path || "/placeholder.png",
      qty,
    });
    setCartOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-square">
            {product.badge && (
              <span className={`absolute top-4 left-4 z-10 text-white text-xs font-bold px-3 py-1 rounded ${product.badge.toUpperCase() === "SALE" ? "bg-red-500" : "bg-pink-600"}`}>
                {product.badge}
              </span>
            )}
            <Image src={selectedImage} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.path)}
                  className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 relative ${selectedImage === img.path ? "ring-2 ring-pink-500" : "ring-1 ring-gray-200"}`}
                >
                  <Image src={img.path} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">{product.name}</h1>
          {product.brandName && <p className="text-gray-500 text-sm mb-3">{product.brandName}</p>}

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold text-pink-700">৳{price.toLocaleString()}</span>
            {selectedVariant?.discountPrice && selectedVariant.discountPrice > 0 && (
              <span className="text-lg text-gray-400 line-through">৳{selectedVariant.price.toLocaleString()}</span>
            )}
          </div>

          {/* Variant Selector */}
          {allSizes.length > 0 && (
            <div className="mb-4">
              <label className="block font-semibold text-sm mb-2">Select Variant:</label>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[48px] h-10 border rounded-lg text-sm font-medium transition cursor-pointer ${selectedSize === s ? "bg-pink-600 text-white border-pink-600" : "bg-white text-gray-700 border-gray-300 hover:border-pink-400"}`}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Stock indicator */}
          {selectedVariant && (
            <p className={`text-sm mb-4 ${selectedVariant.stockCount > 0 ? "text-green-600" : "text-red-500"}`}>
              {selectedVariant.stockCount > 0 ? `${selectedVariant.stockCount} in stock` : "Out of stock"}
            </p>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => qty > 1 && setQty(qty - 1)} className="w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-50 cursor-pointer">−</button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => selectedVariant && qty < selectedVariant.stockCount && setQty(qty + 1)} disabled={!selectedVariant || qty >= selectedVariant.stockCount} className="w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stockCount <= 0}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-semibold text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >+ Add To Cart</button>
          </div>
          {/* <button
            onClick={handleOrderNow}
            disabled={!selectedVariant || selectedVariant.stockCount <= 0}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >Order Now</button> */}
          {addedMsg && <p className="text-green-600 text-sm mb-4">{addedMsg}</p>}

          {product.description && (
            <div className="border-t pt-6 mt-6 text-gray-700 whitespace-pre-line">{product.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
