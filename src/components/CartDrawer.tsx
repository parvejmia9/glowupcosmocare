"use client";

import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, remove, updateQty, subtotal } = useCart();
  const router = useRouter();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">
            Your Cart ({items.reduce((s, i) => s + i.qty, 0)})
          </h2>
          <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                    <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.size}</p>
                    <p className="font-bold text-sm mt-1">৳{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.variantId, item.qty - 1)}
                        className="w-7 h-7 border rounded flex items-center justify-center text-sm hover:bg-gray-50"
                      >−</button>
                      <span className="text-sm w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.variantId, item.qty + 1)}
                        className="w-7 h-7 border rounded flex items-center justify-center text-sm hover:bg-gray-50"
                      >+</button>
                      <button
                        onClick={() => remove(item.variantId)}
                        className="ml-auto text-red-500 text-xs hover:text-red-700"
                      >Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-6 py-4">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Subtotal</span>
              <span className="font-bold">৳{subtotal().toLocaleString()}</span>
            </div>
            <button
              onClick={() => { setCartOpen(false); router.push("/checkout"); }}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
