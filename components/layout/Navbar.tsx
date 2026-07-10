"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Heart, User, Search, LogOut, LayoutDashboard, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    // Detect scroll for navigation header shading transition
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Fetch categories for navbar
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Failed to load categories in nav", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass shadow-md shadow-black/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-serif tracking-widest text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              ATELIER
            </span>
          </Link>

          {/* Desktop Categories */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/products"
              className={`text-sm tracking-wide transition-colors ${
                pathname === "/products" ? "text-amber-400 font-medium" : "text-zinc-300 hover:text-white"
              }`}
            >
              All Products
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`text-sm tracking-wide transition-colors ${
                  pathname.includes(cat.slug) ? "text-amber-400 font-medium" : "text-zinc-300 hover:text-white"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-1.5 pl-4 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-400 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            
            {/* Admin Dashboard */}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                title="Admin Panel"
                className="p-2 text-zinc-300 hover:text-amber-400 transition-colors hidden sm:block"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              title="Saved Items"
              className="p-2 text-zinc-300 hover:text-amber-400 transition-colors"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              title="View Cart"
              className="p-2 text-zinc-300 hover:text-amber-400 transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/orders"
                  className="hidden md:flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 px-4 py-2 rounded-full transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-zinc-950 py-4 px-6 animate-in fade-in slide-in-from-top-5 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-4 pr-10 text-xs text-white"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <nav className="flex flex-col space-y-3">
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-300 hover:text-white"
            >
              All Products
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-300 hover:text-white"
              >
                {cat.name}
              </Link>
            ))}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
            {user && (
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-300 hover:text-white flex items-center space-x-1"
              >
                <User className="w-4 h-4" />
                <span>My Orders & Profile</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
