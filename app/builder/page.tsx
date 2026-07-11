"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ShoppingBag, Plus, X, Award, Eye, Heart } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/CartContext";

export default function OutfitBuilderPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active selections in canvas slots
  const [slots, setSlots] = useState<{
    outerwear: any | null;
    top: any | null;
    bottom: any | null;
    accessory: any | null;
  }>({
    outerwear: null,
    top: null,
    bottom: null,
    accessory: null,
  });

  const [activeCategory, setActiveCategory] = useState<string>("tops");

  // Fetch products
  useEffect(() => {
    fetch("/api/products?limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error("Error loading builder items", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectProduct = (product: any, categorySlug: string) => {
    if (categorySlug === "outerwear") {
      setSlots((prev) => ({ ...prev, outerwear: product }));
      toast.success(`Outerwear set: ${product.name}`);
    } else if (categorySlug === "tops") {
      setSlots((prev) => ({ ...prev, top: product }));
      toast.success(`Top set: ${product.name}`);
    } else if (categorySlug === "bottoms") {
      setSlots((prev) => ({ ...prev, bottom: product }));
      toast.success(`Bottom set: ${product.name}`);
    } else {
      setSlots((prev) => ({ ...prev, accessory: product }));
      toast.success(`Accessory set: ${product.name}`);
    }
  };

  const clearSlot = (slotKey: "outerwear" | "top" | "bottom" | "accessory") => {
    setSlots((prev) => ({ ...prev, [slotKey]: null }));
  };

  // Calculations
  const selectedItems = Object.values(slots).filter(Boolean);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

  // Color Harmony AI logic
  const colorsUsed = selectedItems.map((item) => item.colors?.[0] || "");
  const hasClash = colorsUsed.includes("Olive") && colorsUsed.includes("Red"); // Mock clash criteria
  const harmonyStatus = hasClash 
    ? "Clashing colors detected (Olive + Red). Stylists recommend neutral pairing."
    : selectedItems.length >= 2 
      ? "Colors harmonize beautifully. Solid luxury palette." 
      : "Select more garments to calculate color harmonies.";

  // Add All to Bag
  const [addingAll, setAddingAll] = useState(false);
  const handleAddAll = async () => {
    if (selectedItems.length === 0) return;
    setAddingAll(true);
    try {
      for (const item of selectedItems) {
        await addToCart(item.id, 1, "M", item.colors?.[0] || "Black", item);
      }
      toast.success("Bespoke outfit combination added to your shopping bag!");
      // Reset slots
      setSlots({ outerwear: null, top: null, bottom: null, accessory: null });
    } catch (err) {
      toast.error("Failed to add outfit items to bag");
    } finally {
      setAddingAll(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const cat = p.category?.slug || "";
    if (activeCategory === "tops") return cat === "tops";
    if (activeCategory === "bottoms") return cat === "bottoms";
    if (activeCategory === "outerwear") return cat === "outerwear";
    return cat !== "tops" && cat !== "bottoms" && cat !== "outerwear";
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      
      {/* Title */}
      <div className="text-center space-y-2 mb-12">
        <div className="inline-flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-full px-4 py-1 text-[10px] uppercase tracking-widest text-amber-400 font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Bespoke Wardrobe Creation</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-white">Interactive Outfit Builder</h1>
        <p className="text-zinc-550 text-xs font-light max-w-md mx-auto leading-relaxed">
          Select pieces from our catalog tabs on the left to build matching layers, calculate price, and verify color harmonies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Catalog Tabs (4/12 width) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex border-b border-zinc-900 text-xs tracking-wider uppercase font-semibold">
            {["tops", "bottoms", "outerwear", "accessories"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`flex-grow pb-2 transition-colors cursor-pointer ${
                  activeCategory === tab ? "border-b-2 border-amber-400 text-white font-bold" : "text-zinc-550 hover:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="h-[450px] overflow-y-auto pr-1 space-y-3">
            {loading ? (
              <div className="py-20 text-center text-zinc-500 text-xs uppercase tracking-wider animate-pulse">Loading wardrobe options...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center text-zinc-500 text-xs font-light">No items found in this category.</div>
            ) : (
              filteredProducts.map((p) => {
                const primaryImg = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url;
                return (
                  <div 
                    key={p.id} 
                    className="flex items-center justify-between bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-850 p-2.5 rounded-xl transition-all group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img src={primaryImg} alt={p.name} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-zinc-200 block truncate group-hover:text-amber-400 transition-colors">{p.name}</span>
                        <span className="text-[10px] text-zinc-550 block font-light">${p.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectProduct(p, p.category?.slug)}
                      className="p-2 bg-zinc-950 hover:bg-white text-zinc-400 hover:text-black rounded-lg border border-zinc-850 transition-colors flex items-center justify-center cursor-pointer"
                      title="Select Piece"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Interactive Canvas Layout (4/12 width) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[450px] relative">
          <div className="absolute top-4 left-4 text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Style Canvas</div>

          {/* Slots grid arrangement */}
          <div className="w-full max-w-xs space-y-6">
            
            {/* Outerwear slot */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">Outerwear layer</span>
              {slots.outerwear ? (
                <div className="relative w-20 aspect-[3/4] rounded-xl border border-amber-400/30 overflow-hidden bg-zinc-900">
                  <img src={slots.outerwear.images?.[0]?.url} alt="outerwear" className="w-full h-full object-cover" />
                  <button onClick={() => clearSlot("outerwear")} className="absolute top-1 right-1 p-0.5 bg-black/75 hover:bg-black rounded-full text-white cursor-pointer"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <div className="w-20 aspect-[3/4] rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 text-xs font-light bg-zinc-900/10">Empty</div>
              )}
            </div>

            {/* Tops & Accessories row */}
            <div className="flex justify-around items-center">
              {/* Top slot */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">Top Shirt</span>
                {slots.top ? (
                  <div className="relative w-20 aspect-[3/4] rounded-xl border border-amber-400/30 overflow-hidden bg-zinc-900">
                    <img src={slots.top.images?.[0]?.url} alt="top" className="w-full h-full object-cover" />
                    <button onClick={() => clearSlot("top")} className="absolute top-1 right-1 p-0.5 bg-black/75 hover:bg-black rounded-full text-white cursor-pointer"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-20 aspect-[3/4] rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 text-xs font-light bg-zinc-900/10">Empty</div>
                )}
              </div>

              {/* Accessory slot */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">Accessory</span>
                {slots.accessory ? (
                  <div className="relative w-20 aspect-[3/4] rounded-xl border border-amber-400/30 overflow-hidden bg-zinc-900">
                    <img src={slots.accessory.images?.[0]?.url} alt="accessory" className="w-full h-full object-cover" />
                    <button onClick={() => clearSlot("accessory")} className="absolute top-1 right-1 p-0.5 bg-black/75 hover:bg-black rounded-full text-white cursor-pointer"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-20 aspect-[3/4] rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 text-xs font-light bg-zinc-900/10">Empty</div>
                )}
              </div>
            </div>

            {/* Bottom slot */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">Bottom Pants</span>
              {slots.bottom ? (
                <div className="relative w-20 aspect-[3/4] rounded-xl border border-amber-400/30 overflow-hidden bg-zinc-900">
                  <img src={slots.bottom.images?.[0]?.url} alt="bottom" className="w-full h-full object-cover" />
                  <button onClick={() => clearSlot("bottom")} className="absolute top-1 right-1 p-0.5 bg-black/75 hover:bg-black rounded-full text-white cursor-pointer"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <div className="w-20 aspect-[3/4] rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 text-xs font-light bg-zinc-900/10">Empty</div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Style & Cost Summary (4/12 width) */}
        <div className="lg:col-span-4 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between min-h-[450px]">
          
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider mb-0.5">Bespoke Summary</h3>
              <p className="text-[10px] text-zinc-500 font-light">Real-time aggregate valuations and color matching checkers</p>
            </div>

            {/* Selected items list */}
            {selectedItems.length > 0 ? (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {selectedItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-zinc-900 pb-2">
                    <span className="text-zinc-350 truncate pr-4 font-light">{item.name}</span>
                    <span className="text-zinc-400 font-medium font-serif">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-650 text-xs font-light">No items loaded into slots yet.</div>
            )}

            {/* Color Harmony Box */}
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl space-y-2">
              <div className="text-[9px] uppercase tracking-widest text-amber-450 font-bold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Color Harmony AI Analyzer</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                {harmonyStatus}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-zinc-900">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-zinc-450">Bespoke Subtotal:</span>
              <span className="text-xl font-serif text-white">${totalPrice.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleAddAll}
              disabled={selectedItems.length === 0 || addingAll}
              className="w-full bg-white text-black font-semibold text-xs py-3.5 rounded-xl hover:bg-zinc-200 transition-colors uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{addingAll ? "Adding Custom Outfit..." : "Add Outfit to Bag"}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
