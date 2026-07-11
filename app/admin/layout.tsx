"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, ShoppingCart, Users, Receipt, Tag, ArrowLeft, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Security fallback if middleware has delay
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-center p-6 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h1 className="font-serif text-2xl text-white uppercase tracking-wider">Access Denied</h1>
        <p className="text-zinc-500 text-xs max-w-xs mx-auto">
          This area is restricted to system administrators only.
        </p>
        <Link href="/" className="text-amber-400 hover:underline text-xs font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products Catalog", icon: ShoppingCart },
    { href: "/admin/orders", label: "Order Fulfilment", icon: Receipt },
    { href: "/admin/coupons", label: "Discount Coupons", icon: Tag },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex-shrink-0">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <span className="font-serif font-bold text-lg tracking-widest bg-gradient-to-r from-amber-250 to-amber-500 bg-clip-text text-transparent">
              VELOURA
            </span>
            <span className="text-[9px] block text-zinc-550 uppercase tracking-widest font-semibold mt-0.5">Control Panel</span>
          </div>
          <Link href="/" className="md:hidden p-1 bg-zinc-950 rounded border border-zinc-850 text-zinc-500 hover:text-white" title="View Store">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-amber-400 text-black shadow-lg shadow-amber-400/10"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-850"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-8 border-t border-zinc-850/50 mt-6">
            <Link
              href="/"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-zinc-550 hover:text-white hover:bg-zinc-850"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0" />
              <span>Back to Storefront</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Admin View Container */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>

    </div>
  );
}
