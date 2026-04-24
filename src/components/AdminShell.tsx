"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="font-bold text-lg text-pink-300">GlowUp CosmoCare</Link>
              <div className="hidden sm:flex gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                      pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >{link.label}</Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="hidden sm:inline text-xs text-gray-400 hover:text-white" target="_blank">View Store ↗</Link>
              <button onClick={handleLogout} className="hidden sm:inline text-xs text-gray-400 hover:text-white">Logout</button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden p-1.5 rounded hover:bg-gray-800 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute top-0 right-0 h-full w-64 bg-gray-900 text-white shadow-2xl animate-slide-in-right flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-gray-800">
              <span className="font-bold text-pink-300">GlowUp</span>
              <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded hover:bg-gray-800 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 px-3 py-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >{link.label}</Link>
              ))}
            </div>
            <div className="border-t border-gray-800 px-5 py-4 space-y-3">
              <Link href="/" className="block text-sm text-gray-400 hover:text-white" target="_blank" onClick={() => setMenuOpen(false)}>View Store ↗</Link>
              <button onClick={handleLogout} className="block text-sm text-gray-400 hover:text-white">Logout</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
