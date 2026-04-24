"use client";

import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm">
      Delete
    </button>
  );
}
