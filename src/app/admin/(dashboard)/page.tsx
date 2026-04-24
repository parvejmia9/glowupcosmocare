import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  returned: "bg-red-100 text-red-700",
  declined: "bg-gray-100 text-gray-700",
};

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrders, pendingOrders, totalRevenue, activeProducts, recentOrders] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ["confirmed", "shipped", "delivered"] } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { _count: { select: { items: true } } } }),
  ]);

  const stats = [
    { label: "Today's Orders", value: todayOrders, color: "bg-blue-50 text-blue-700" },
    { label: "Pending Orders", value: pendingOrders, color: "bg-orange-50 text-orange-700" },
    { label: "Total Revenue", value: `৳${(totalRevenue._sum.total || 0).toLocaleString()}`, color: "bg-green-50 text-green-700" },
    { label: "Active Products", value: activeProducts, color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-xl p-6 ${stat.color}`}>
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
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
                <th className="text-left px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((o) => (
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
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
          <div className="sm:hidden divide-y">
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="block p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-blue-600">{o.orderNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${statusColors[o.status] || ""}`}>{o.status}</span>
                </div>
                <p className="font-medium text-sm">{o.fullName}</p>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span className="font-semibold text-gray-900">৳{o.total.toLocaleString()}</span>
                  <span>{o._count.items} items · {new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <p className="px-4 py-8 text-center text-gray-400 text-sm">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
