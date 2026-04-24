"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["pending", "confirmed", "shipped", "delivered", "returned", "declined"];

export default function OrderStatusUpdater({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = async () => {
    if (status === currentStatus) return;
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <select value={status} onChange={(e) => setStatus(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm">
        {statuses.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
      <button onClick={update} disabled={loading || status === currentStatus}
        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
        {loading ? "..." : "Update"}
      </button>
    </div>
  );
}
