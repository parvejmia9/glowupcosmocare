import { prisma } from "@/lib/db";
import Link from "next/link";
import OrderStatusUpdater from "@/components/OrderStatusUpdater";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  returned: "bg-red-100 text-red-700",
  declined: "bg-gray-100 text-gray-700",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (statusFilter) where.status = statusFilter;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  const statuses = ["all", "pending", "confirmed", "shipped", "delivered", "returned", "declined"];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/orders" : `/admin/orders?status=${s}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition whitespace-nowrap ${
              (s === "all" && !statusFilter) || s === statusFilter
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >{s.charAt(0).toUpperCase() + s.slice(1)}</Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="hidden sm:table w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Order #</th>
              <th className="text-left px-4 py-3 font-semibold">Customer</th>
              <th className="text-left px-4 py-3 font-semibold">Total</th>
              <th className="text-left px-4 py-3 font-semibold">Items</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Update Status</th>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/admin/orders/${o.id}`} className="text-blue-600 hover:text-blue-800">{o.orderNumber}</Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.fullName}</p>
                  <p className="text-xs text-gray-400">{o.mobile}</p>
                </td>
                <td className="px-4 py-3 font-semibold">৳{o.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{o._count.items}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${statusColors[o.status] || ""}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusUpdater orderId={o.id} currentStatus={o.status} />
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>
            )}
          </tbody>
        </table>
        <div className="sm:hidden divide-y">
          {orders.map((o) => (
            <div key={o.id} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-blue-600">{o.orderNumber}</Link>
                <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${statusColors[o.status] || ""}`}>{o.status}</span>
              </div>
              <p className="font-medium text-sm">{o.fullName}</p>
              <p className="text-xs text-gray-400">{o.mobile}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-sm">৳{o.total.toLocaleString()}</span>
                <span className="text-xs text-gray-500">{o._count.items} items · {new Date(o.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-3">
                <OrderStatusUpdater orderId={o.id} currentStatus={o.status} />
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-400 text-sm">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
