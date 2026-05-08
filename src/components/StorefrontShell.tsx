"use client";

import { CartProvider } from "@/lib/cart-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function StorefrontShell({ children, categories }: { children: React.ReactNode; categories: Category[] }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <CartDrawer />
    </CartProvider>
  );
}
