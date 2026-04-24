import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { size: "asc" } },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      images: product.images.map((img) => ({ id: img.id, imagePath: img.imagePath })),
      variants: product.variants.map((v) => ({ id: v.id, size: v.size, price: v.price, discountPrice: v.discountPrice, stockCount: v.stockCount })),
    },
  });
}
