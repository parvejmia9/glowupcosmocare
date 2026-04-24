import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

const STOCK_RESTORE_STATUSES = ["returned", "declined"];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { status } = await request.json();
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "returned", "declined"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;
    const newStatus = status;

    // Use a transaction for stock changes
    await prisma.$transaction(async (tx) => {
      // Restore stock: transitioning TO declined/returned from a non-declined/returned status
      if (STOCK_RESTORE_STATUSES.includes(newStatus) && !STOCK_RESTORE_STATUSES.includes(oldStatus)) {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockCount: { increment: item.quantity } },
          });
        }
      }

      // Re-decrement stock: transitioning FROM declined/returned back to an active status
      if (STOCK_RESTORE_STATUSES.includes(oldStatus) && !STOCK_RESTORE_STATUSES.includes(newStatus)) {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockCount: { decrement: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id: Number(id) },
        data: { status: newStatus },
      });
    });

    return NextResponse.json({ message: "Status updated" });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
