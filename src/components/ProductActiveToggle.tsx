"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductActiveToggle({ productId, initialActive }: { productId: number; initialActive: boolean }) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const newVal = !active;
    setActive(newVal);
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: newVal }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${active ? "bg-green-500" : "bg-gray-300"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${active ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}
