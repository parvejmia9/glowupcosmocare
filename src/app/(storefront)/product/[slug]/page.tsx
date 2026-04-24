export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailComponent from "@/components/ProductDetail";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true } });
  return {
    title: product ? `${product.name} – GlowUp CosmoCare` : "Product Not Found",
    description: product?.description?.slice(0, 155) || "",
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { size: "asc" } },
    },
  });
  if (!product) notFound();

  return (
    <ProductDetailComponent
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        badge: product.badge,
        brandName: product.brandName,
        images: product.images.map((img) => ({ id: img.id, path: img.imagePath })),
        variants: product.variants.map((v) => ({
          id: v.id,
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
