export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(price: number): string {
  return `৳${price.toLocaleString("en-BD")}`;
}

export function effectivePrice(basePrice: number, discountPrice: number | null): number {
  return discountPrice && discountPrice > 0 ? discountPrice : basePrice;
}

export async function generateOrderNumber(): Promise<string> {
  const { prisma } = await import("@/lib/db");
  const lastOrder = await prisma.order.findFirst({
    orderBy: { id: "desc" },
    select: { orderNumber: true },
  });
  let next = 1;
  if (lastOrder?.orderNumber) {
    const parts = lastOrder.orderNumber.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) next = lastNum + 1;
  }
  return `GC-${String(next).padStart(4, "0")}`;
}
