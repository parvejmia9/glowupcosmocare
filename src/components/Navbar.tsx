"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { items, setCartOpen } = useCart();
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/glowupcosmocare logo.png" alt="GlowUp CosmoCare" width={160} height={48} className="h-12" style={{ width: 'auto' }} priority />
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className={`relative text-[15px] font-medium transition-colors duration-200 ${pathname === "/" ? "text-pink-600" : "text-gray-600 hover:text-pink-600"} after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-pink-500 after:transition-all after:duration-300 ${pathname === "/" ? "after:w-full" : "after:w-0 hover:after:w-full"}`}
            >Our Story</Link>
            <Link
              href="/shop"
              className={`relative text-[15px] font-medium transition-colors duration-200 ${pathname === "/shop" ? "text-pink-600" : "text-gray-600 hover:text-pink-600"} after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-pink-500 after:transition-all after:duration-300 ${pathname === "/shop" ? "after:w-full" : "after:w-0 hover:after:w-full"}`}
            >Shop</Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-full text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-pink-600 text-white text-[10px] min-w-5 h-5 rounded-full flex items-center justify-center font-bold px-1">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
