import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import OrderStatusUpdater from "@/components/OrderStatusUpdater";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: { include: { product: { select: { slug: true } }, variant: { select: { sku: true } } } } },
  });

  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold mb-3">Customer Info</h2>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Name:</span> {order.fullName}</p>
            <p><span className="text-gray-500">Mobile:</span> {order.mobile}</p>
            <p><span className="text-gray-500">Address:</span> {order.address}</p>
            <p><span className="text-gray-500">City:</span> {order.city}</p>
            <p><span className="text-gray-500">Zone:</span> {order.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}</p>
            {order.orderNotes && <p><span className="text-gray-500">Notes:</span> {order.orderNotes}</p>}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>৳{order.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>৳{order.deliveryCharge.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total</span><span>৳{order.total.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="hidden sm:table w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Product</th>
              <th className="text-left px-4 py-3 font-semibold">SKU</th>
              <th className="text-left px-4 py-3 font-semibold">Size</th>
              <th className="text-left px-4 py-3 font-semibold">Price</th>
              <th className="text-left px-4 py-3 font-semibold">Qty</th>
              <th className="text-left px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">
                  <Link href={`/product/${item.product.slug}`} className="text-pink-600 hover:underline">{item.productName}</Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{item.variant?.sku || "—"}</td>
                <td className="px-4 py-3">{item.size}</td>
                <td className="px-4 py-3">৳{item.unitPrice.toLocaleString()}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3 font-semibold">৳{(item.unitPrice * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="sm:hidden divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="p-4">
              <Link href={`/product/${item.product.slug}`} className="font-medium text-sm text-pink-600 hover:underline">{item.productName}</Link>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                {item.variant?.sku && <span>SKU: {item.variant.sku}</span>}
                <span>Size: {item.size}</span>
                <span>Qty: {item.quantity}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-gray-500">৳{item.unitPrice.toLocaleString()} × {item.quantity}</span>
                <span className="font-semibold">৳{(item.unitPrice * item.quantity).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
