import { prisma } from "@/lib/db";
import Link from "next/link";
import DeleteProductButton from "@/components/DeleteProductButton";
import ProductActiveToggle from "@/components/ProductActiveToggle";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { images: { where: { isPrimary: true }, take: 1 }, category: true, variants: { orderBy: { price: "asc" } }, _count: { select: { variants: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          + Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="hidden sm:table w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Product</th>
              <th className="text-left px-4 py-3 font-semibold">Brand</th>
              <th className="text-left px-4 py-3 font-semibold">Category</th>
              <th className="text-left px-4 py-3 font-semibold">Price</th>
              <th className="text-left px-4 py-3 font-semibold">Variants</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.brandName || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{p.category?.name || "—"}</td>
                <td className="px-4 py-3">
                  {p.variants.length > 0 ? (
                    <span className="font-semibold">৳{(p.variants[0].discountPrice && p.variants[0].discountPrice > 0 ? p.variants[0].discountPrice : p.variants[0].price).toLocaleString()}{p.variants.length > 1 ? "+" : ""}</span>
                  ) : (
                    <span className="text-gray-400">No variants</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{p._count.variants}</td>
                <td className="px-4 py-3">
                  <ProductActiveToggle productId={p.id} initialActive={p.isActive} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</Link>
                  <DeleteProductButton id={p.id} name={p.name} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No products yet</td></tr>
            )}
          </tbody>
        </table>
        <div className="sm:hidden divide-y">
          {products.map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.brandName || "No brand"} · {p.category?.name || "No category"}</p>
                  <div className="mt-1">
                    {p.variants.length > 0 ? (
                      <span className="font-semibold text-sm">৳{(p.variants[0].discountPrice && p.variants[0].discountPrice > 0 ? p.variants[0].discountPrice : p.variants[0].price).toLocaleString()}{p.variants.length > 1 ? "+" : ""}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">No variants</span>
                    )}
                  </div>
                </div>
                <ProductActiveToggle productId={p.id} initialActive={p.isActive} />
              </div>
              <div className="flex items-center gap-3 mt-3 text-sm">
                <Link href={`/admin/products/${p.id}/edit`} className="text-blue-600 hover:text-blue-800">Edit</Link>
                <DeleteProductButton id={p.id} name={p.name} />
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-400 text-sm">No products yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
