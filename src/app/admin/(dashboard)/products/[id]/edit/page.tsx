import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditProductClient from "./client";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <EditProductClient
      categories={categories.map(c => ({ id: c.id, name: c.name }))}
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        badge: product.badge,
        categoryId: product.categoryId,
        isActive: product.isActive,
        brandName: product.brandName,
        images: product.images.map((img) => ({ id: img.id, path: img.imagePath })),
        variants: product.variants.map((v) => ({
          size: v.size,
          price: v.price,
          discountPrice: v.discountPrice,
          stockCount: v.stockCount,
          sku: v.sku,
        })),
      }}
    />
  );
}
