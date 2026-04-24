export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import TrustBadges from "@/components/TrustBadges";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";

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

async function getAboutText(): Promise<string> {
  const s = await prisma.siteSetting.findUnique({ where: { key: "about_text" } });
  return s?.value || "";
}

export default async function HomePage() {
  const [heroImages, featured, aboutText] = await Promise.all([
    getHeroImages(),
    getFeaturedProducts(),
    getAboutText(),
  ]);

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
      <WhyChooseUs />

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

      {/* Testimonials */}
      <Testimonials />

      {/* Our Story / About — split layout */}
      {aboutText && (
        <section className="py-16 sm:py-20 bg-gradient-to-br from-pink-50 via-white to-pink-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-pink-100">
                <Image
                  src={heroImages[0] || "/placeholder.png"}
                  alt="Our Story"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                  Hello! <span className="text-gray-900">This is <span className="font-extrabold">glowupcosmocare</span> —</span>
                </h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line mt-4 text-[15px]">
                  {aboutText.length > 300 ? aboutText.slice(0, 300) + "..." : aboutText}
                </div>
                <Link
                  href="/shop"
                  className="inline-block mt-6 px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-full text-sm transition-all shadow-md hover:shadow-lg"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
