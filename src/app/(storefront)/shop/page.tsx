export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 12;

interface ShopPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const categorySlug = params.category || "";

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  const where = {
    isActive: true,
    ...(selectedCategory ? { categoryId: selectedCategory.id } : {}),
  };

  const [totalCount, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { images: { where: { isPrimary: true }, take: 1 }, variants: { orderBy: { price: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const sp: Record<string, string> = {};
  if (categorySlug) sp.category = categorySlug;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Shop</h1>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/shop"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${!categorySlug ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >All</Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${categorySlug === cat.slug ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >{cat.name}</Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              minPrice={(() => { const v = p.variants[0]; return v ? (v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price) : 0; })()}
              badge={p.badge}
              brandName={p.brandName}
              primaryImage={p.images[0]?.imagePath || null}
            />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath="/shop" searchParams={sp} />
    </div>
  );
}
