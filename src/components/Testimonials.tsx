"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "Fariha Rahman",
    avatar: "/bd headshot1.jpg",
    text: "GlowUp products transformed my skincare routine! My skin has never felt better.",
    rating: 5,
  },
  {
    name: "Lamisa binte Abdullah",
    avatar: "/bd headshoot2.jpeg",
    text: "Perfect for my daily routine! Noticed a visible difference in just a week. Highly recommend!",
    rating: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((p) => (p + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
            Testimonials
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Stars count={5} />
            <span className="text-sm font-semibold text-gray-700">4.8</span>
            <span className="text-sm text-gray-400">out of 5 · 10,239 reviews</span>
          </div>
        </div>

        {/* Cards carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {testimonials.map((t, i) => (
              <div key={i} className="w-full flex-shrink-0 px-2 sm:px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {[t, testimonials[(i + 1) % testimonials.length]].map((review, j) => (
                    <div
                      key={j}
                      className="bg-pink-50/60 border border-pink-100/60 rounded-2xl p-6 sm:p-8"
                    >
                      <div className="text-pink-400 text-4xl font-serif leading-none mb-3">&ldquo;</div>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-5">{review.text}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-200 overflow-hidden relative">
                          <Image src={review.avatar} alt={review.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{review.name}</p>
                          <Stars count={review.rating} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-8 h-2.5 bg-pink-500" : "w-2.5 h-2.5 bg-pink-200 hover:bg-pink-300"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
