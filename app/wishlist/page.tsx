"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, [user]);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        toast.success("Removed from wishlist");
        fetchWishlist(); // reload
      }
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = async (product: any) => {
    const size = product.sizes?.[0] || "M";
    const color = product.colors?.[0] || "Black";

    const res = await addToCart(product.id, 1, size, color, product);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`${product.name} added to cart!`);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 w-full flex-grow text-center space-y-6">
        <Heart className="w-12 h-12 text-zinc-650 mx-auto" />
        <h2 className="font-serif text-2xl text-zinc-350">My Saved Items</h2>
        <p className="text-zinc-550 text-xs leading-relaxed max-w-xs mx-auto">
          Please sign in to save items to your wishlist, check availability, and sync them across all your devices.
        </p>
        <div className="pt-4">
          <Link
            href="/login?redirect=/wishlist"
            className="inline-flex items-center text-black bg-white hover:bg-zinc-200 font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all"
          >
            <span>Sign In to Continue</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex-grow flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-xs tracking-wider uppercase font-medium">Loading saved garments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      
      <div className="border-b border-zinc-900 pb-8 mb-10">
        <h1 className="font-serif text-3xl font-bold tracking-wide uppercase">My Wishlist</h1>
        <p className="text-zinc-500 text-xs font-light mt-1">
          Your curated catalog of saved items. Add them to your bag to check out.
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-zinc-850 rounded-2xl space-y-4">
          <Heart className="w-10 h-10 text-zinc-650 mx-auto" />
          <h2 className="font-serif text-lg text-zinc-350">Your Wishlist is Empty</h2>
          <p className="text-zinc-550 text-xs max-w-sm mx-auto">
            Tap the heart icon on any product page to save it here for later.
          </p>
          <div className="pt-2">
            <Link href="/products" className="inline-flex items-center text-amber-400 hover:underline text-xs font-semibold">
              Browse Collection <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const product = item.product;
            const primaryImg = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-zinc-900/30 border border-zinc-900 hover:border-amber-400/20 rounded-2xl p-3 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative rounded-xl overflow-hidden aspect-[3/4] mb-3 bg-zinc-900">
                  {primaryImg ? (
                    <img src={primaryImg} alt={product.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-750">No Image</div>
                  )}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full text-zinc-400 hover:text-red-400 hover:scale-105 transition-all"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-serif text-sm font-bold text-zinc-200 hover:text-amber-400 transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <span className="text-sm font-semibold text-zinc-400 block mt-1">${product.price.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="w-full mt-4 flex items-center justify-center space-x-1.5 bg-white hover:bg-zinc-250 text-black py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{product.stock <= 0 ? "Out of Stock" : "Add to Bag"}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
