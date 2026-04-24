"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface DeliveryCharges {
  inside_dhaka: number;
  outside_dhaka: number;
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [charges, setCharges] = useState<DeliveryCharges>({ inside_dhaka: 70, outside_dhaka: 120 });
  const [zone, setZone] = useState<"inside_dhaka" | "outside_dhaka">("inside_dhaka");
  const [form, setForm] = useState({ fullName: "", mobile: "", address: "", city: "", orderNotes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/delivery")
      .then((r) => r.json())
      .then((d) => {
        if (d.inside_dhaka !== undefined) setCharges(d);
      })
      .catch(() => {});
  }, []);

  const sub = subtotal();
  const deliveryCharge = charges[zone];
  const total = sub + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) { setError("Cart is empty"); return; }
    if (!form.fullName.trim() || !form.mobile.trim() || !form.address.trim() || !form.city.trim()) {
      setError("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          mobile: form.mobile,
          address: form.address,
          city: form.city,
          deliveryZone: zone,
          orderNotes: form.orderNotes,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Order failed"); setSubmitting(false); return; }
      clear();
      setSuccess(data.orderNumber);
    } catch {
      setError("Something went wrong");
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Order Placed!</h2>
          <p className="text-green-600 mb-4">Your order <strong>{success}</strong> has been placed successfully.</p>
          <p className="text-sm text-gray-500 mb-6">We will contact you to confirm delivery.</p>
          <button onClick={() => router.push("/shop")} className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 mb-6">Your cart is empty.</p>
        <button onClick={() => router.push("/shop")} className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition">
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border rounded-lg px-4 py-2.5" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number *</label>
            <input type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full border rounded-lg px-4 py-2.5" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Address *</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="w-full border rounded-lg px-4 py-2.5" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full border rounded-lg px-4 py-2.5" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Zone *</label>
            <select value={zone} onChange={(e) => setZone(e.target.value as "inside_dhaka" | "outside_dhaka")} className="w-full border rounded-lg px-4 py-2.5">
              <option value="inside_dhaka">Inside Dhaka (৳{charges.inside_dhaka})</option>
              <option value="outside_dhaka">Outside Dhaka (৳{charges.outside_dhaka})</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Order Notes</label>
            <textarea value={form.orderNotes} onChange={(e) => setForm({ ...form, orderNotes: e.target.value })} rows={2} className="w-full border rounded-lg px-4 py-2.5" placeholder="Color preference, special instructions…" />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
            💳 Payment Method: <strong>Cash on Delivery</strong>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-bold text-lg transition disabled:opacity-50">
            {submitting ? "Placing Order…" : `Place Order – ৳${total.toLocaleString()}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="border rounded-xl p-5 sticky top-24">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 items-center">
                  <div className="w-12 h-14 relative shrink-0 rounded overflow-hidden bg-gray-100">
                    <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.size} × {item.qty}</p>
                  </div>
                  <span className="text-sm font-semibold">৳{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>৳{sub.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>৳{deliveryCharge.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>৳{total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
