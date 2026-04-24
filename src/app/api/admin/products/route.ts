import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { uploadToR2 } from "@/lib/r2";
import path from "path";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: { images: true, variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${slugify(name)}-${suffix}`;
      suffix++;
    }

    const product = await prisma.product.create({
      data: { name, slug, description, badge, categoryId, isActive, brandName },
    });

    const MAX_IMAGES = 3;
    const images = formData.getAll("images") as File[];
    const validImages = images.filter((f) => f.size > 0).slice(0, MAX_IMAGES);
    if (validImages.length > 0) {
      for (let i = 0; i < validImages.length; i++) {
        const file = validImages[i];
        const ext = path.extname(file.name).toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;

        const key = `products/${product.id}/${product.id}_${i + 1}_${Date.now()}${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const contentType = file.type || "image/jpeg";
        const publicUrl = await uploadToR2(key, buffer, contentType);

        await prisma.productImage.create({
          data: {
            productId: product.id,
            imagePath: publicUrl,
            sortOrder: i,
            isPrimary: i === 0,
          },
        });
      }
    }

    const variantSizes = formData.getAll("variant_size") as string[];
    const variantPrices = formData.getAll("variant_price") as string[];
    const variantDiscountPrices = formData.getAll("variant_discount_price") as string[];
    const variantStocks = formData.getAll("variant_stock") as string[];
    const variantSkus = formData.getAll("variant_sku") as string[];

    for (let i = 0; i < variantSizes.length; i++) {
      if (!variantSizes[i]) continue;
      const dp = variantDiscountPrices[i] ? Number(variantDiscountPrices[i]) : null;
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: variantSizes[i],
          price: Number(variantPrices[i]) || 0,
          discountPrice: dp && dp > 0 ? dp : null,
          stockCount: Number(variantStocks[i]) || 0,
          sku: variantSkus[i] || "",
        },
      });
    }

    const full = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, variants: true },
    });

    return NextResponse.json({ product: full }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
