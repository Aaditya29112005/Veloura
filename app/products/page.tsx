"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Check } from "lucide-react";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Component state derived from URL search parameters
  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "newest";
  const pageParam = parseInt(searchParams.get("page") || "1");

  // Local filters (applied upon submission)
  const [searchInput, setSearchInput] = useState(searchParam);
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("500");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Loaded DB data
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sizing & color lists
  const availableSizes = ["S", "M", "L", "XL"];
  const availableColors = ["Camel", "Black", "Charcoal", "Navy", "Tan", "Olive", "Cream", "Grey", "Off-White", "Indigo", "Khaki", "White"];

  // Re-fetch categories on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  // Sync state with URL changes
  useEffect(() => {
    setSearchInput(searchParam);
    
    // Sync price, sizes, and colors from URL search parameters
    setMinPrice(searchParams.get("minPrice") || "0");
    setMaxPrice(searchParams.get("maxPrice") || "500");
    setSelectedSizes(searchParams.getAll("size"));
    setSelectedColors(searchParams.getAll("color"));
    
    fetchProducts();
  }, [
    categoryParam, 
    searchParam, 
    sortParam, 
    pageParam,
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
    searchParams.getAll("size").join(","),
    searchParams.getAll("color").join(",")
  ]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (categoryParam) query.set("category", categoryParam);
      if (searchParam) query.set("search", searchParam);
      if (sortParam) query.set("sort", sortParam);
      if (pageParam) query.set("page", pageParam.toString());
      query.set("limit", "9");

      // Extract values from the URL query params to send exact request state
      const currentMinPrice = searchParams.get("minPrice") || "0";
      const currentMaxPrice = searchParams.get("maxPrice") || "500";
      const currentSizes = searchParams.getAll("size");
      const currentColors = searchParams.getAll("color");

      if (currentMinPrice && currentMinPrice !== "0") query.set("minPrice", currentMinPrice);
      if (currentMaxPrice && currentMaxPrice !== "500") query.set("maxPrice", currentMaxPrice);
      currentSizes.forEach((s) => query.append("size", s));
      currentColors.forEach((c) => query.append("color", c));

      const res = await fetch(`/api/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.totalCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // reset to page 1
    
    if (searchInput) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }

    if (minPrice && minPrice !== "0") {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }

    if (maxPrice && maxPrice !== "500") {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }

    router.push(`/products?${params.toString()}`);
    setShowMobileFilters(false);
  };

  // Immediate triggers for dropdowns
  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.push(`/products?${params.toString()}`);
  };

  const handleCategorySelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    router.push(`/products?${params.toString()}`);
  };

  const handlePageSelect = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSize = (size: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    
    const currentSizes = params.getAll("size");
    params.delete("size");
    
    const nextSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];
      
    nextSizes.forEach((s) => params.append("size", s));
    router.push(`/products?${params.toString()}`);
  };

  const toggleColor = (color: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    
    const currentColors = params.getAll("color");
    params.delete("color");
    
    const nextColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color];
      
    nextColors.forEach((c) => params.append("color", c));
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchInput("");
    setMinPrice("0");
    setMaxPrice("500");
    setSelectedSizes([]);
    setSelectedColors([]);
    router.push("/products");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow flex flex-col">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-8 gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide uppercase">
            {categoryParam ? categories.find((c) => c.slug === categoryParam)?.name : "All Collections"}
          </h1>
          <p className="text-zinc-500 text-xs font-light mt-1">
            Displaying {totalCount} unique fashion pieces.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search items..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <button onClick={applyFilters} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-400">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Menu */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-3 py-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 mr-2" />
            <select
              value={sortParam}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="newest" className="bg-zinc-950">Newest</option>
              <option value="price-asc" className="bg-zinc-950">Price: Low to High</option>
              <option value="price-desc" className="bg-zinc-950">Price: High to Low</option>
              <option value="name-asc" className="bg-zinc-950">Alphabetical</option>
            </select>
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center bg-zinc-900 border border-zinc-800 rounded-full p-2.5 text-zinc-300"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 flex-grow">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block space-y-6">
          
          {/* Categories list */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold mb-3">Categories</h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => handleCategorySelect("")}
                  className={`text-xs block text-left transition-colors w-full ${
                    !categoryParam ? "text-amber-400 font-semibold" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  All Items
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`text-xs block text-left transition-colors w-full ${
                      categoryParam === cat.slug ? "text-amber-400 font-semibold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {cat.name} ({cat._count?.products || 0})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sizing Filter */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold mb-3">Filter by Size</h3>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((sz) => {
                const active = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    onClick={() => toggleSize(sz)}
                    className={`text-xs border w-9 h-9 rounded-md flex items-center justify-center font-medium transition-all ${
                      active
                        ? "border-amber-400 text-amber-400 bg-amber-400/5 font-bold"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color filter */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold mb-3">Filter by Color</h3>
            <div className="flex flex-wrap gap-1.5">
              {availableColors.map((col) => {
                const active = selectedColors.includes(col);
                return (
                  <button
                    key={col}
                    onClick={() => toggleColor(col)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      active
                        ? "border-amber-400 text-amber-400 bg-amber-400/5 font-semibold"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price filter */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold mb-3">Price Range</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-1.5 px-2 text-xs text-white"
              />
              <span className="text-zinc-600 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-1.5 px-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={fetchProducts}
              className="w-full bg-white text-black font-semibold text-xs py-2 rounded-md hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="text-zinc-500 hover:text-white text-xs px-2"
            >
              Clear
            </button>
          </div>

        </aside>

        {/* Mobile Filters overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-40 bg-black/80 flex justify-end md:hidden">
            <div className="w-80 bg-zinc-950 p-6 overflow-y-auto h-full space-y-6 animate-in slide-in-from-right duration-250">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <span className="font-serif text-lg font-bold text-white uppercase tracking-wider">Filters</span>
                <button onClick={() => setShowMobileFilters(false)} className="text-zinc-500 hover:text-white">Close</button>
              </div>

              {/* Duplicate mobile filters */}
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { handleCategorySelect(""); setShowMobileFilters(false); }}
                    className={`text-xs px-3 py-1.5 rounded-full border ${!categoryParam ? "border-amber-400 text-amber-400 bg-amber-400/5 font-semibold" : "border-zinc-800 text-zinc-400"}`}
                  >
                    All Items
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { handleCategorySelect(cat.slug); setShowMobileFilters(false); }}
                      className={`text-xs px-3 py-1.5 rounded-full border ${categoryParam === cat.slug ? "border-amber-400 text-amber-400 bg-amber-400/5 font-semibold" : "border-zinc-800 text-zinc-400"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3">Sizes</h3>
                <div className="flex gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`text-xs border w-9 h-9 rounded-md flex items-center justify-center font-medium ${selectedSizes.includes(sz) ? "border-amber-400 text-amber-400 bg-amber-400/5" : "border-zinc-800 text-zinc-400"}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((col) => (
                    <button
                      key={col}
                      onClick={() => toggleColor(col)}
                      className={`text-[10px] px-3 py-1 rounded-full border ${selectedColors.includes(col) ? "border-amber-400 text-amber-400 bg-amber-400/5" : "border-zinc-800 text-zinc-400"}`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3">Price Range</h3>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-2 text-xs text-white" />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-2 text-xs text-white" />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={fetchProducts} className="w-full bg-white text-black font-semibold text-xs py-3 rounded-md hover:bg-zinc-200">Apply Filters</button>
                <button onClick={clearFilters} className="w-full border border-zinc-800 text-zinc-400 text-xs py-3 rounded-md">Clear</button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid (Shopper catalog items) */}
        <main className="md:col-span-3 flex flex-col justify-between">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-zinc-900 rounded-2xl aspect-[3/4]" />
                  <div className="h-4 bg-zinc-900 rounded w-2/3" />
                  <div className="h-3 bg-zinc-900 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-20">
              <span className="text-zinc-600 text-sm mb-2">No results matched your parameters.</span>
              <button onClick={clearFilters} className="text-amber-400 hover:underline text-xs font-semibold">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
              {products.map((product) => {
                const primaryImage = product.images.find((img: any) => img.isPrimary)?.url || product.images[0]?.url;
                return (
                  <div key={product.id} className="group relative flex flex-col bg-zinc-900/40 border border-zinc-900 hover:border-amber-400/30 rounded-2xl p-3 transition-all duration-300">
                    
                    {/* Image Box */}
                    <div className="relative rounded-xl overflow-hidden aspect-[3/4] mb-4 bg-zinc-900">
                      {product.stock <= 0 && (
                        <span className="absolute top-3 left-3 z-10 bg-red-650 text-white font-bold text-[9px] uppercase tracking-widest px-2 py-1 rounded">
                          Sold Out
                        </span>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-3 left-3 z-10 bg-amber-600 text-white font-bold text-[9px] uppercase tracking-widest px-2 py-1 rounded">
                          Low Stock
                        </span>
                      )}
                      
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="object-cover w-full h-full transition-transform duration-750 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-650">No Image</div>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <Link
                          href={`/products/${product.slug}`}
                          className="bg-white text-black font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-zinc-200 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="px-1 pb-2 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1">
                          {product.category?.name}
                        </span>
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-serif text-sm font-semibold text-zinc-100 hover:text-amber-400 transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-900">
                        <span className="text-sm font-semibold text-zinc-200">${product.price.toFixed(2)}</span>
                        <span className="text-[10px] text-zinc-500 font-light">{product.sizes.join(", ")}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-12 pt-6 border-t border-zinc-900">
              <button
                onClick={() => handlePageSelect(Math.max(1, pageParam - 1))}
                disabled={pageParam === 1}
                className="p-2 border border-zinc-800 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {[...Array(totalPages)].map((_, idx) => {
                const pgNum = idx + 1;
                return (
                  <button
                    key={pgNum}
                    onClick={() => handlePageSelect(pgNum)}
                    className={`w-9 h-9 text-xs rounded-md font-semibold transition-colors ${
                      pageParam === pgNum
                        ? "bg-white text-black"
                        : "border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    {pgNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageSelect(Math.min(totalPages, pageParam + 1))}
                disabled={pageParam === totalPages}
                className="p-2 border border-zinc-800 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-zinc-400 text-sm max-w-7xl mx-auto p-10">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
