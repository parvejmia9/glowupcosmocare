"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AboutForm({ aboutText }: { aboutText: string }) {
  const router = useRouter();
  const [about, setAbout] = useState(aboutText);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const save = async () => {
    setLoading(true);
    setSuccess("");
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ about_text: about }),
    });
    setLoading(false);
    setSuccess("Saved!");
    setTimeout(() => setSuccess(""), 2000);
    router.refresh();
  };

  return (
    <div className="bg-white border rounded-xl p-6 max-w-lg mb-6">
      <h2 className="text-lg font-bold mb-4">About Section Text</h2>
      <textarea
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        rows={6}
        placeholder="Write about your beauty brand, mission, and products..."
        className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
      />
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={loading}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
          {loading ? "Saving..." : "Save"}
        </button>
        {success && <span className="text-green-600 text-sm">{success}</span>}
      </div>
    </div>
  );
}

export function DeliveryChargeForm({ deliveryInside, deliveryOutside }: { deliveryInside: string; deliveryOutside: string }) {
  const router = useRouter();
  const [inside, setInside] = useState(deliveryInside);
  const [outside, setOutside] = useState(deliveryOutside);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const save = async () => {
    setLoading(true);
    setSuccess("");
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        delivery_charge_inside: inside,
        delivery_charge_outside: outside,
      }),
    });
    setLoading(false);
    setSuccess("Saved!");
    setTimeout(() => setSuccess(""), 2000);
    router.refresh();
  };

  return (
    <div className="bg-white border rounded-xl p-6 max-w-lg mb-6">
      <h2 className="text-lg font-bold mb-4">Delivery Charges</h2>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Inside Dhaka (৳)</label>
          <input type="number" value={inside} onChange={(e) => setInside(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Outside Dhaka (৳)</label>
          <input type="number" value={outside} onChange={(e) => setOutside(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={loading}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
          {loading ? "Saving..." : "Save"}
        </button>
        {success && <span className="text-green-600 text-sm">{success}</span>}
      </div>
    </div>
  );
}
