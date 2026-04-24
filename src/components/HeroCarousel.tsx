"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface HeroCarouselProps {
  images: string[];
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const count = images.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [count, next]);

  if (count === 0) return null;

  return (
    <div className="group relative w-full h-[520px] sm:h-[600px] lg:h-[720px] overflow-hidden bg-gray-100">
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <Image src={src} alt={`Hero ${i + 1}`} fill className="object-cover" sizes="100vw" priority={i === 0} />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent" />

      {/* Hero content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-lg" style={{ fontFamily: "'Georgia', serif" }}>
              Glow naturally.<br />
              Feel beautiful every day.
            </h1>
            <p className="text-base sm:text-lg text-white/90 mb-8 drop-shadow">
              High-performance skincare designed for real results.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Shop Best Sellers
              </Link>
              <Link
                href="/shop"
                className="px-8 py-3.5 border-2 border-white text-white font-semibold rounded-full text-sm hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel controls */}
      {count > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + count) % count)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
