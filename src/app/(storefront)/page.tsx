export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import TrustBadges from "@/components/TrustBadges";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import Pagination from "@/components/Pagination";

const PRODUCTS_PER_PAGE = 12;

async function getHeroImages(): Promise<string[]> {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["hero_image_1", "hero_image_2", "hero_image_3"] } },
  });
  return ["hero_image_1", "hero_image_2", "hero_image_3"]
    .map((key) => settings.find((s) => s.key === key)?.value)
    .filter((v): v is string => !!v && v.length > 0);
}

async function getFeaturedProducts() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "featured_product_ids" },
  });
  if (!setting?.value) return [];
  const ids = setting.value
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id));
  if (ids.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: { orderBy: { price: "asc" } },
    },
  });
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const categorySlug = params.category || "";

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  const productWhere = {
    isActive: true,
    ...(selectedCategory ? { categoryId: selectedCategory.id } : {}),
  };

  const [heroImages, featured, totalCount, allProducts] = await Promise.all([
    getHeroImages(),
    getFeaturedProducts(),
    prisma.product.count({ where: productWhere }),
    prisma.product.findMany({
      where: productWhere,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        variants: { orderBy: { price: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const paginationParams: Record<string, string> = {};
  if (categorySlug) paginationParams.category = categorySlug;

  return (
    <div>
      {/* Hero */}
      {heroImages.length > 0 ? (
        <HeroCarousel images={heroImages} />
      ) : (
        <div className="relative bg-gradient-to-br from-pink-100 via-pink-50 to-white py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Georgia', serif" }}>
              Glow naturally.<br />Feel beautiful every day.
            </h1>
            <p className="text-lg text-gray-600 mb-8">High-performance skincare designed for real results.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/shop" className="px-8 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-full text-sm transition-all shadow-lg hover:shadow-xl">
                Shop Best Sellers
              </Link>
              <Link href="/shop" className="px-8 py-3.5 border-2 border-gray-900 text-gray-900 font-semibold rounded-full text-sm hover:bg-gray-900 hover:text-white transition-all">
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <TrustBadges />

      {/* Why GlowUp */}
      {/* <WhyChooseUs /> */}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 sm:py-20 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                Featured Products
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
              {featured.map((p) => (
                <div key={p.id} className="w-[calc(50%-10px)] sm:w-[calc(25%-18px)] max-w-[280px] flex">
                <ProductCard
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  minPrice={(() => { const v = p.variants[0]; return v ? (v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price) : 0; })()}
                  badge={p.badge}
                  brandName={p.brandName}
                  primaryImage={p.images[0]?.imagePath || null}
                />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products / Category Products */}
      <section id="products" className="py-16 sm:py-20 scroll-mt-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Georgia', serif" }}>
              {selectedCategory ? selectedCategory.name : "All Products"}
            </h2>
            {selectedCategory && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 text-pink-700 text-sm font-medium rounded-full">
                  {selectedCategory.name}
                  <Link href="/#products" className="hover:text-pink-900 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Link>
                </span>
              </div>
            )}
          </div>
          {allProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {allProducts.map((p) => (
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
              <Pagination currentPage={page} totalPages={totalPages} basePath="/" searchParams={paginationParams} />
            </>
          ) : (
            <p className="text-center text-gray-500">No products found in this category.</p>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}
