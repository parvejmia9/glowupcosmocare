import Link from "next/link";
import Image from "next/image";

interface CategoryItem {
  name: string;
  slug: string;
  image: string | null;
}

export default function CategoryShowcase({ categories }: { categories: CategoryItem[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Georgia', serif" }}>
              Best Sellers
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              A clean, modern skincare destination for women who want simple routines, visible results, and products they can trust.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100"
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 280px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-pink-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">{cat.name}</span>
                  <span className="text-white/80 group-hover:translate-x-1 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
