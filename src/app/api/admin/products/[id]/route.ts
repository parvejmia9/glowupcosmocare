import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { uploadToR2, deleteFromR2, getKeyFromUrl } from "@/lib/r2";
import path from "path";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);

  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const badge = (formData.get("badge") as string) || null;
    const categoryIdRaw = formData.get("category_id") as string;
    const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;
    const isActive = formData.get("is_active") !== "false";
    const brandName = (formData.get("brand_name") as string) || "";

    let slug = slugify(name);
    let suffix = 2;
    while (true) {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (!existing || existing.id === productId) break;
      slug = `${slugify(name)}-${suffix}`;
      suffix++;
    }

    await prisma.product.update({
      where: { id: productId },
      data: { name, slug, description, badge, categoryId, isActive, brandName },
    });

    // Delete images FIRST so the count is accurate for new uploads
    const deleteImages = formData.get("delete_images") as string;
    if (deleteImages) {
      const ids = deleteImages.split(",").map(Number).filter(Boolean);
      const imagesToDelete = await prisma.productImage.findMany({ where: { id: { in: ids } } });
      for (const img of imagesToDelete) {
        try { await deleteFromR2(getKeyFromUrl(img.imagePath)); } catch {}
      }
      await prisma.productImage.deleteMany({ where: { id: { in: ids } } });
    }

    const MAX_IMAGES = 3;
    const images = formData.getAll("images") as File[];
    if (images.length > 0 && images[0].size > 0) {
      const existingCount = await prisma.productImage.count({ where: { productId } });
      const remaining = Math.max(0, MAX_IMAGES - existingCount);
      const validImages = images.slice(0, remaining);

      for (let i = 0; i < validImages.length; i++) {
        const file = validImages[i];
        const ext = path.extname(file.name).toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;

        const key = `products/${productId}/${productId}_${existingCount + i + 1}_${Date.now()}${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const contentType = file.type || "image/jpeg";
        const publicUrl = await uploadToR2(key, buffer, contentType);

        await prisma.productImage.create({
          data: {
            productId,
            imagePath: publicUrl,
            sortOrder: existingCount + i,
            isPrimary: existingCount === 0 && i === 0,
          },
        });
      }
    }

    const variantSizes = formData.getAll("variant_size") as string[];
    const variantPrices = formData.getAll("variant_price") as string[];
    const variantDiscountPrices = formData.getAll("variant_discount_price") as string[];
    const variantStocks = formData.getAll("variant_stock") as string[];
    const variantSkus = formData.getAll("variant_sku") as string[];

    const incomingSizes = new Set<string>();
    for (let i = 0; i < variantSizes.length; i++) {
      const size = variantSizes[i];
      if (!size) continue;
      incomingSizes.add(size);
      const dp = variantDiscountPrices[i] ? Number(variantDiscountPrices[i]) : null;
      await prisma.productVariant.upsert({
        where: { productId_size: { productId, size } },
        update: {
          price: Number(variantPrices[i]) || 0,
          discountPrice: dp && dp > 0 ? dp : null,
          stockCount: Number(variantStocks[i]) || 0,
          sku: variantSkus[i] || "",
        },
        create: {
          productId,
          size,
          price: Number(variantPrices[i]) || 0,
          discountPrice: dp && dp > 0 ? dp : null,
          stockCount: Number(variantStocks[i]) || 0,
          sku: variantSkus[i] || "",
        },
      });
    }

    // Only delete variants that have no order items referencing them
    const removedVariants = await prisma.productVariant.findMany({
      where: { productId, size: { notIn: [...incomingSizes] } },
      include: { _count: { select: { orderItems: true } } },
    });
    const deletableIds = removedVariants.filter((v) => v._count.orderItems === 0).map((v) => v.id);
    if (deletableIds.length > 0) {
      await prisma.productVariant.deleteMany({ where: { id: { in: deletableIds } } });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true, variants: true },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);

  try {
    const images = await prisma.productImage.findMany({ where: { productId } });
    for (const img of images) {
      try { await deleteFromR2(getKeyFromUrl(img.imagePath)); } catch {}
    }

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { isActive } = await request.json();
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { isActive: Boolean(isActive) },
    });
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Toggle product error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
