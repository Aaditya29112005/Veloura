"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, PlaneTakeoff, Award } from "lucide-react";

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch a subset of products to feature on homepage
    fetch("/api/products?limit=4")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.products)) {
          setTrendingProducts(data.products);
        }
      })
      .catch((err) => console.error("Error loading home products", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Editorial Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 scale-105"
          style={{ 
            backgroundImage: "linear-gradient(to bottom, rgba(9,9,11,0.2) 0%, rgba(9,9,11,0.85) 90%), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80')" 
          }}
        />
        
        {/* Hero Content */}
        <div className="relative max-w-5xl mx-auto px-4 text-center z-10 space-y-6">
          <div className="inline-flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-full px-4.5 py-1.5 text-[10px] uppercase tracking-widest text-amber-400 font-semibold mb-2">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Autumn/Winter Collection 2026</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight uppercase">
            Timeless Design.<br />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Modern Silhouettes.
            </span>
          </h1>
          
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
            Crafted from raw Japanese selvedge denim, pure Mongolian cashmere, and Italian double-faced wool. Curated collections built to endure.
          </p>
          
          <div className="pt-6">
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 text-black bg-white hover:bg-zinc-200 font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-full transition-all hover:scale-105"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Scroll indicator overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-500 text-[10px] uppercase tracking-widest animate-bounce">
          Scroll down to discover
        </div>
      </section>

      {/* 2. Visual Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-semibold tracking-wide uppercase">Shop by Category</h2>
          <div className="h-0.5 w-12 bg-amber-400 mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Outerwear */}
          <Link href="/products?category=outerwear" className="group relative h-96 overflow-hidden rounded-2xl block">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "linear-gradient(to top, rgba(9,9,11,0.9) 10%, rgba(9,9,11,0) 60%), url('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=80')" }}
            />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-serif text-xl font-bold text-white mb-1">Outerwear</h3>
              <p className="text-zinc-400 text-xs font-light">Tailored coats, jackets, and shearling.</p>
            </div>
          </Link>

          {/* Card 2: Knitwear */}
          <Link href="/products?category=knitwear" className="group relative h-96 overflow-hidden rounded-2xl block">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "linear-gradient(to top, rgba(9,9,11,0.9) 10%, rgba(9,9,11,0) 60%), url('https://images.unsplash.com/photo-1574164904299-3a102b110380?w=500&auto=format&fit=crop&q=80')" }}
            />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-serif text-xl font-bold text-white mb-1">Knitwear</h3>
              <p className="text-zinc-400 text-xs font-light">Italian merino wool and soft cashmeres.</p>
            </div>
          </Link>

          {/* Card 3: Shirts */}
          <Link href="/products?category=tops-shirts" className="group relative h-96 overflow-hidden rounded-2xl block">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "linear-gradient(to top, rgba(9,9,11,0.9) 10%, rgba(9,9,11,0) 60%), url('https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&auto=format&fit=crop&q=80')" }}
            />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-serif text-xl font-bold text-white mb-1">Tops & Shirts</h3>
              <p className="text-zinc-400 text-xs font-light">Mulberry silk blouses and Oxford cottons.</p>
            </div>
          </Link>

          {/* Card 4: Bottoms */}
          <Link href="/products?category=bottoms" className="group relative h-96 overflow-hidden rounded-2xl block">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "linear-gradient(to top, rgba(9,9,11,0.9) 10%, rgba(9,9,11,0) 60%), url('https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop&q=80')" }}
            />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-serif text-xl font-bold text-white mb-1">Bottoms</h3>
              <p className="text-zinc-400 text-xs font-light">Pleated trousers and Japanese selvedge denim.</p>
            </div>
          </Link>

        </div>
      </section>

      {/* 3. Featured / Trending Products Grid */}
      <section className="bg-zinc-900 border-t border-b border-zinc-800 py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4 text-center sm:text-left">
            <div>
              <h2 className="font-serif text-3xl font-semibold tracking-wide uppercase">Trending Arrivals</h2>
              <p className="text-zinc-400 text-xs font-light mt-1">Curated picks from our most popular pieces.</p>
            </div>
            <Link
              href="/products"
              className="text-xs uppercase tracking-wider font-bold text-amber-400 hover:text-white transition-colors flex items-center space-x-1.5"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-zinc-800 rounded-2xl h-80 w-full" />
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => {
                const primaryImage = product.images.find((img: any) => img.isPrimary)?.url || product.images[0]?.url;
                return (
                  <div key={product.id} className="group relative flex flex-col bg-zinc-950 border border-zinc-850 rounded-2xl p-3 hover:border-amber-400/40 transition-all duration-300">
                    
                    {/* Image Area */}
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

                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <Link
                          href={`/products/${product.slug}`}
                          className="bg-white text-black font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-zinc-200 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="px-1 pb-2 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1">
                          {product.category?.name}
                        </span>
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-serif text-sm font-semibold text-zinc-100 hover:text-amber-400 transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-900">
                        <span className="text-sm font-semibold text-zinc-200">${product.price.toFixed(2)}</span>
                        <span className="text-[10px] text-zinc-500 font-light">{product.colors.join(", ")}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 4. Atelier Values / Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="text-center p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 mb-2">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-white uppercase tracking-wider">Premium Fibers</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">
              We exclusively use Mongolian cashmere, long-staple cotton, and certified fine wools. Built for durability.
            </p>
          </div>

          <div className="text-center p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-white uppercase tracking-wider">Secure Logistics</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">
              All deliveries are tracked and insured. Verified token access guards checkout sessions and customer data.
            </p>
          </div>

          <div className="text-center p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 mb-2">
              <PlaneTakeoff className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-white uppercase tracking-wider">Free Global Delivery</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">
              Enjoy free carbon-neutral shipping and returns on all international orders exceeding fifty dollars.
            </p>
          </div>

          <div className="text-center p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-white uppercase tracking-wider">Limited Iterations</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">
              We operate in small production runs to avoid waste. Each item is individually numbered and tracked.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
