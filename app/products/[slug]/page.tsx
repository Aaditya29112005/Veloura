"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Heart, Star, ShoppingBag, ArrowLeft, RotateCcw, Truck, X } from "lucide-react";

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug: string };
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  // Core Data
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form selections
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Live Visitors & AI Review Summaries
  const [visitorCount, setVisitorCount] = useState(14);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [loadingTryOn, setLoadingTryOn] = useState(false);

  const fetchReviewsSummary = async (prodId: string) => {
    setLoadingAiSummary(true);
    try {
      const res = await fetch(`/api/ai/reviews-summary?productId=${prodId}`);
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiSummary(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next < 5 ? 5 : next > 35 ? 35 : next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Load product data
  const loadProduct = async () => {
    try {
      const res = await fetch(`/api/products/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        setActiveImage(data.images.find((img: any) => img.isPrimary)?.url || data.images[0]?.url || "");
        
        // Auto-select first size/color if available
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);

        // Load related items
        fetchRelatedProducts(data.category?.slug, data.id);
        
        // Check if wishlisted
        checkWishlistStatus(data.id);

        // Fetch AI reviews summary
        fetchReviewsSummary(data.id);
      } else {
        toast.error("Product not found");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (catSlug: string, currentId: string) => {
    try {
      const res = await fetch(`/api/products?category=${catSlug}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        // Exclude current product
        setRelatedProducts((data.products || []).filter((p: any) => p.id !== currentId).slice(0, 4));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkWishlistStatus = async (prodId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        const isInWishlist = data.some((item: any) => item.productId === prodId);
        setWishlisted(isInWishlist);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug, user]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.stock <= 0) {
      toast.error("This item is currently out of stock");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }

    setAddingToCart(true);
    const res = await addToCart(product.id, 1, selectedSize, selectedColor, product);
    setAddingToCart(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`${product.name} added to cart`);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to save items to your wishlist");
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setWishlisted(data.active);
        toast.success(data.message);
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to submit a review");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setReviewComment("");
        loadProduct(); // Reload to fetch fresh reviews list
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (err) {
      toast.error("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex-grow flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-xs tracking-wider uppercase font-medium">Curating garment details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex-grow text-center space-y-4">
        <h2 className="font-serif text-2xl text-zinc-300">Garment Not Found</h2>
        <p className="text-zinc-500 text-sm">We could not find the product model you are looking for.</p>
        <Link href="/products" className="inline-flex items-center text-amber-400 hover:underline text-xs font-semibold">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Collections
        </Link>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = product.reviews?.length > 0 
    ? (product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      
      {/* Back button */}
      <Link href="/products" className="inline-flex items-center text-zinc-500 hover:text-white text-xs font-semibold mb-8 group transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" /> Back to Collections
      </Link>

      {/* Main product column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-zinc-900 border border-zinc-900">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-650">No Image Available</div>
            )}
          </div>
          
          {/* Thumbnails list */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative w-20 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 border bg-zinc-900 ${
                    activeImage === img.url ? "border-amber-400" : "border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <img src={img.url} alt="thumbnail" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
          {/* Virtual Try-On Trigger */}
          <button
            onClick={() => setIsTryOnOpen(true)}
            className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2.5 print:hidden cursor-pointer"
          >
            <span>📷</span>
            <span>Virtual Try-On (AR Mockup)</span>
          </button>
        </div>

        {/* Right Column: Garment Information details */}
        <div className="space-y-6">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 block">
              {product.category?.name}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
              {product.name}
            </h1>
            
            {/* Rating Stars Summary */}
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-2xl font-serif text-zinc-200">${product.price.toFixed(2)}</span>
              {avgRating && (
                <div className="flex items-center space-x-1.5 border-l border-zinc-800 pl-4">
                  <div className="flex text-amber-450">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(parseFloat(avgRating)) ? "fill-amber-450 text-amber-450" : "text-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-400">{avgRating} ({product.reviews.length} reviews)</span>
                </div>
              )}
            </div>
            {/* Live activity indicators */}
            <div className="flex flex-wrap gap-2.5 pt-3.5 text-[9px] uppercase tracking-wider font-bold text-zinc-400 print:hidden">
              <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-850 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>{visitorCount} people viewing this item</span>
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <div className="flex items-center space-x-1.5 bg-red-950/20 border border-red-900/30 text-red-400 px-3 py-1 rounded-full animate-pulse">
                  <span>Only {product.stock} left in stock</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-b border-zinc-900 py-4 text-xs font-light text-zinc-400 leading-relaxed">
            {product.description}
          </div>

          {/* Sustainability Score Gauge */}
          {product.sustainabilityScore && (
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4.5 flex items-center justify-between gap-4 print:hidden">
              <div className="space-y-1 max-w-xs">
                <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold block">Sustainability Index</span>
                <h4 className="text-xs font-semibold text-zinc-300">Eco-Score: A ({product.sustainabilityScore}/100)</h4>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {product.ecoBadges?.map((badge: string, idx: number) => (
                    <span key={idx} className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-medium">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-zinc-800 bg-zinc-950 flex-shrink-0">
                <div className="absolute inset-0.5 rounded-full border border-emerald-400/20" />
                <span className="text-xs font-serif font-bold text-emerald-400">{product.sustainabilityScore}%</span>
              </div>
            </div>
          )}

          {/* Sizing selection */}
          {product.sizes?.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Select Size</span>
                <span className="text-[10px] text-zinc-650 cursor-pointer hover:underline">Size Guide</span>
              </div>
              <div className="flex gap-2">
                {product.sizes.map((sz: string) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-10 h-10 text-xs font-medium rounded-lg border transition-all ${
                      selectedSize === sz
                        ? "border-amber-400 text-amber-400 bg-amber-400/5 font-bold"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-650"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selection */}
          {product.colors?.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-2 block">Select Color</span>
              <div className="flex gap-2">
                {product.colors.map((col: string) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`text-xs px-4 py-2 font-medium rounded-full border transition-all ${
                      selectedColor === col
                        ? "border-amber-400 text-amber-400 bg-amber-400/5 font-semibold"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-650"
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
              
              {selectedColor && product.colorHarmonies?.length > 0 && (
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 mt-3 text-xs space-y-1 print:hidden">
                  <div className="text-[9px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
                    Color Harmony AI Suggestions
                  </div>
                  <p className="text-zinc-500 font-light leading-relaxed">
                    Pairs perfectly with: <strong className="text-zinc-350">{product.colorHarmonies.filter((c: string) => c !== selectedColor).slice(0, 3).join(", ")}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Inventory details */}
          <div className="flex items-center space-x-3 pt-2 text-xs">
            <span className="font-medium text-zinc-400">Stock Availability:</span>
            {product.stock <= 0 ? (
              <span className="text-red-500 font-semibold uppercase tracking-wider text-[10px]">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-500 font-semibold uppercase tracking-wider text-[10px] animate-pulse">
                Low Stock (Only {product.stock} left)
              </span>
            ) : (
              <span className="text-green-500 font-semibold uppercase tracking-wider text-[10px]">{product.stock} In Stock</span>
            )}
          </div>

          {/* Checkout & Wishlist action buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock <= 0}
              className="flex-grow flex items-center justify-center space-x-2 text-black bg-white hover:bg-zinc-200 py-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{addingToCart ? "Adding to Cart..." : "Add to Cart"}</span>
            </button>

            <button
              onClick={toggleWishlist}
              className={`p-4 border rounded-xl hover:border-zinc-650 transition-colors cursor-pointer ${
                wishlisted ? "border-amber-400 text-amber-400 bg-amber-400/5" : "border-zinc-800 text-zinc-400"
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
          </div>

          {/* Policy Badges */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-900">
            <div className="flex items-start space-x-2.5">
              <Truck className="w-4 h-4 text-zinc-500 mt-0.5" />
              <div className="text-[10px] text-zinc-500">
                <p className="font-semibold text-zinc-450">Complimentary Shipping</p>
                <p className="font-light">Carbon-neutral deliveries on orders &gt; $50.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <RotateCcw className="w-4 h-4 text-zinc-500 mt-0.5" />
              <div className="text-[10px] text-zinc-500">
                <p className="font-semibold text-zinc-450">Exquisite Packaging</p>
                <p className="font-light">Arrives in recycled dust bags and gift box.</p>
              </div>
            </div>
          </div>

          {/* Product DNA Panel */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4 print:hidden">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <span>💡</span>
              <span>Product DNA Profile</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                <span className="text-[8px] uppercase tracking-wider text-zinc-550 block font-bold">Trending Score</span>
                <span className="text-xs font-semibold text-zinc-350 block mt-0.5">High ({product.viewsCount || 42}/100)</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                <span className="text-[8px] uppercase tracking-wider text-zinc-550 block font-bold">Popularity Index</span>
                <span className="text-xs font-semibold text-zinc-350 block mt-0.5">Top 15% ({product.purchasedCount || 10} sales)</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                <span className="text-[8px] uppercase tracking-wider text-zinc-550 block font-bold">Return Risk</span>
                <span className="text-xs font-semibold text-zinc-350 block mt-0.5">{product.returnRisk || "Low"} (Fitted drape)</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                <span className="text-[8px] uppercase tracking-wider text-zinc-550 block font-bold">Stock Health</span>
                <span className="text-xs font-semibold text-green-400 block mt-0.5">Stable ({product.stock} units)</span>
              </div>
            </div>
            
            <div className="border-t border-zinc-850 pt-3 text-[11px] text-zinc-500 leading-relaxed font-light">
              <span className="font-semibold text-zinc-400">AI Recommendation:</span> Perfect for capsule minimalist setups. Tonal coordination suggests pairing with neutral linen coordinates.
            </div>
          </div>

          {/* Complete the Look Section */}
          {relatedProducts.length > 0 && (
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-3.5 print:hidden">
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <span>👗</span>
                <span>Complete the Look</span>
              </div>
              <p className="text-zinc-500 text-xs font-light">Stylists suggest layering this garment with these matching items from our collections:</p>
              <div className="grid grid-cols-2 gap-3">
                {relatedProducts.slice(0, 2).map((p: any) => {
                  const primaryImg = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url;
                  return (
                    <div key={p.id} className="flex items-center space-x-2.5 bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                      <img src={primaryImg} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                      <div className="min-w-0 flex-grow">
                        <Link href={`/products/${p.slug}`} className="text-[11px] font-semibold text-zinc-300 hover:text-amber-400 block truncate">
                          {p.name}
                        </Link>
                        <span className="text-[10px] text-zinc-550">${p.price.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reviews Tab/Section */}
      <section className="border-t border-zinc-900 pt-12 mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="font-serif text-2xl font-bold tracking-wide uppercase">Customer Reviews</h2>
          {aiSummary && (
            <button
              onClick={() => setShowAiSummary(!showAiSummary)}
              className="inline-flex items-center space-x-2 bg-amber-400/5 hover:bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs px-4 py-2 rounded-full transition-all cursor-pointer"
            >
              <span>✨</span>
              <span>{showAiSummary ? "Hide AI Summary" : "Show AI Review Summarizer"}</span>
            </button>
          )}
        </div>

        {/* AI Summary Card */}
        {showAiSummary && aiSummary && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="md:col-span-2 space-y-3">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <span>🤖</span> AI-Generated Review Consensus
              </h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                {aiSummary.summary}
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                <span>📏 Fit Assessment:</span>
                <span className="bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full text-[10px]">
                  {aiSummary.fitRecommendation}
                </span>
              </div>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider text-green-400 font-bold block">Frequent Pros</span>
                <ul className="text-zinc-500 text-xs space-y-1 list-disc list-inside font-light">
                  {aiSummary.pros.map((p: string, idx: number) => <li key={idx}>{p}</li>)}
                </ul>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider text-red-400 font-bold block">Frequent Cons</span>
                <ul className="text-zinc-500 text-xs space-y-1 list-disc list-inside font-light">
                  {aiSummary.cons.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Submit Review Column */}
          <div className="lg:col-span-1 bg-zinc-900/30 border border-zinc-900 rounded-xl p-6 h-fit">
            <h3 className="font-serif text-lg font-bold text-white mb-4 uppercase tracking-wider">Leave a Review</h3>
            {user ? (
              <form onSubmit={submitReview} className="space-y-4">
                
                {/* Rating selection */}
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-2">Rating</span>
                  <div className="flex gap-1.5 text-amber-450">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-amber-450 text-amber-450" : "text-zinc-700"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-2">Comment</span>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="Write details about product fit, material quality, and delivery..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-white text-black font-semibold text-xs py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>

              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-zinc-500 text-xs mb-3">Please sign in to submit a review.</p>
                <Link
                  href={`/login?redirect=/products/${slug}`}
                  className="text-xs font-semibold text-amber-400 hover:underline"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Reviews list Column */}
          <div className="lg:col-span-2 space-y-4">
            {product.reviews?.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-xs">No reviews submitted yet. Be the first to share your thoughts.</p>
              </div>
            ) : (
              product.reviews.map((rev: any) => (
                <div key={rev.id} className="border-b border-zinc-900 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-zinc-200">{rev.user.name}</span>
                      <span className="text-[10px] text-zinc-550 ml-3">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex text-amber-450">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rev.rating ? "fill-amber-450 text-amber-450" : "text-zinc-700"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs font-light">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* Related Products Recommendations */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-zinc-900 pt-12">
          <h2 className="font-serif text-2xl font-bold tracking-wide uppercase mb-8 text-center md:text-left">Complementary Garments</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const primaryImg = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url;
              return (
                <div key={p.id} className="group relative flex flex-col bg-zinc-900/30 border border-zinc-900 hover:border-amber-400/20 rounded-xl p-3 transition-all duration-300">
                  <div className="relative rounded-lg overflow-hidden aspect-[3/4] mb-3 bg-zinc-900">
                    <img src={primaryImg} alt={p.name} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Link href={`/products/${p.slug}`} className="bg-white text-black font-semibold text-[10px] uppercase tracking-wider px-4 py-2 rounded-full">
                        Details
                      </Link>
                    </div>
                  </div>
                  <Link href={`/products/${p.slug}`} className="font-serif text-xs font-semibold text-zinc-200 hover:text-amber-400 transition-colors truncate block">
                    {p.name}
                  </Link>
                  <span className="text-xs text-zinc-450 mt-1">${p.price.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Virtual Try-On Modal */}
      {isTryOnOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-6 relative text-center">
            <button
              onClick={() => {
                setIsTryOnOpen(false);
                setSelfieImage(null);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">Virtual Try-On AR</h3>
              <p className="text-zinc-500 text-xs font-light max-w-xs mx-auto leading-relaxed mt-1">
                Upload your portrait photo to overlay the selected garment outline.
              </p>
            </div>

            {/* Try-On Display Area */}
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] max-w-[240px] mx-auto bg-zinc-950 border border-zinc-800 flex items-center justify-center">
              {selfieImage ? (
                <>
                  <img src={selfieImage} alt="User selfie" className="object-cover w-full h-full" />
                  {/* Garment outline overlay */}
                  <img 
                    src={activeImage} 
                    alt="Garment overlay" 
                    className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-80 scale-90 translate-y-6 pointer-events-none" 
                  />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/75 text-[8px] uppercase tracking-widest text-amber-400 font-bold py-1 px-2.5 rounded-full">
                    AR Try-On Prototype v1.0
                  </div>
                </>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                    📷
                  </div>
                  <p className="text-[10px] text-zinc-550 max-w-[150px] mx-auto font-light">No image uploaded. Use simulated portraits below.</p>
                </div>
              )}
              {loadingTryOn && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-zinc-400 animate-pulse font-medium uppercase tracking-wider">
                  Analyzing body mesh lines...
                </div>
              )}
            </div>

            {/* Simulated portraits / Custom Upload */}
            <div className="space-y-4">
              <span className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold block">Simulated Models</span>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setLoadingTryOn(true);
                    setTimeout(() => {
                      setSelfieImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80");
                      setLoadingTryOn(false);
                    }, 1200);
                  }}
                  className="bg-zinc-950 border border-zinc-800 hover:border-amber-400 text-[10px] px-3.5 py-2 rounded-xl text-zinc-350 cursor-pointer"
                >
                  Model A (Feminine)
                </button>
                <button
                  onClick={() => {
                    setLoadingTryOn(true);
                    setTimeout(() => {
                      setSelfieImage("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80");
                      setLoadingTryOn(false);
                    }, 1200);
                  }}
                  className="bg-zinc-950 border border-zinc-800 hover:border-amber-400 text-[10px] px-3.5 py-2 rounded-xl text-zinc-350 cursor-pointer"
                >
                  Model B (Masculine)
                </button>
              </div>

              <div className="border-t border-zinc-850 pt-4 flex flex-col items-center">
                <label className="bg-white hover:bg-zinc-200 text-black text-[10px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer">
                  Upload Custom Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLoadingTryOn(true);
                        const reader = new FileReader();
                        reader.onload = () => {
                          setSelfieImage(reader.result as string);
                          setLoadingTryOn(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
