"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Heart, MessageCircle, Share2, ShoppingBag, Eye } from "lucide-react";
import Link from "next/link";

export default function FashionFeedPage() {
  const [likes, setLikes] = useState<{ [id: number]: number }>({
    1: 142,
    2: 89,
    3: 204,
    4: 76
  });
  const [liked, setLiked] = useState<{ [id: number]: boolean }>({});
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products?limit=6")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch(err => console.error("Error loading feed products", err));
  }, []);

  const handleLike = (id: number) => {
    setLiked(prev => {
      const isAlreadyLiked = prev[id];
      setLikes(l => ({
        ...l,
        [id]: isAlreadyLiked ? l[id] - 1 : l[id] + 1
      }));
      return { ...prev, [id]: !isAlreadyLiked };
    });
  };

  const feedItems = [
    {
      id: 1,
      author: "Adrien V.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      image: "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=600&auto=format&fit=crop&q=80",
      description: "Structured wool blazer matched with slate wool trousers. Perfect for seasonal transitions.",
      productSlug: "structured-wool-blazer",
      productName: "Structured Wool Blazer",
      price: 185.0
    },
    {
      id: 2,
      author: "Sofia K.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
      description: "Cozy knitwear and tailored trench coats. Effortless winter layering coordinates.",
      productSlug: "cashmere-double-breasted-trench-coat",
      productName: "Cashmere Double Trench Coat",
      price: 349.0
    },
    {
      id: 3,
      author: "Marcus L.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&auto=format&fit=crop&q=80",
      description: "Linen shirts and washed linen trousers. Breathing easily in warm climate escapes.",
      productSlug: "fine-silk-linen-shirt",
      productName: "Fine Silk Linen Shirt",
      price: 110.0
    },
    {
      id: 4,
      author: "Helena G.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80",
      description: "Bespoke styling collection layers. Curating a high-end minimalist silhouette.",
      productSlug: "structured-wool-blazer",
      productName: "Structured Wool Blazer",
      price: 185.0
    }
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-10 w-full flex-grow space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 bg-amber-450/10 border border-amber-450/20 text-amber-450 text-[10px] tracking-widest uppercase font-bold px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Veloura Community Gallery</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-white">Fashion Feed</h1>
        <p className="text-zinc-550 text-xs font-light max-w-sm mx-auto leading-relaxed">
          Draw inspiration from community styling guides. Shop items directly from lookbooks.
        </p>
      </div>

      {/* User stories mocks */}
      <div className="flex gap-4 overflow-x-auto pb-3 border-b border-zinc-900 justify-start scrollbar-thin">
        {feedItems.map((item) => (
          <div key={item.id} className="flex flex-col items-center space-y-1.5 flex-shrink-0 cursor-pointer">
            <div className="w-14 h-14 rounded-full p-0.5 border-2 border-amber-400 overflow-hidden bg-zinc-950">
              <img src={item.avatar} alt="story" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="text-[10px] text-zinc-450 font-medium">{item.author.split(" ")[0]}</span>
          </div>
        ))}
      </div>

      {/* Feed List */}
      <div className="space-y-8">
        {feedItems.map((item) => (
          <div key={item.id} className="bg-zinc-900/30 border border-zinc-900 rounded-3xl overflow-hidden p-5 space-y-4">
            
            {/* Header info */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img src={item.avatar} alt="avatar" className="w-9 h-9 object-cover rounded-full border border-zinc-800" />
                <div>
                  <span className="text-xs font-bold text-white block leading-none">{item.author}</span>
                  <span className="text-[9px] text-zinc-650 uppercase tracking-wider font-semibold block mt-1">Fashion Contributor</span>
                </div>
              </div>
            </div>

            {/* Post Editorial Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900 border border-zinc-900">
              <img src={item.image} alt="lookbook" className="w-full h-full object-cover" />
              
              {/* Product link overlay tags */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-3 text-white">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold block mb-0.5">Matched Piece</span>
                  <Link href={`/products/${item.productSlug}`} className="text-xs font-semibold hover:text-amber-400 transition-colors block truncate">
                    {item.productName}
                  </Link>
                  <span className="text-[10px] text-zinc-400 font-serif block mt-0.5">${item.price.toFixed(2)}</span>
                </div>
                <Link 
                  href={`/products/${item.productSlug}`}
                  className="bg-white hover:bg-zinc-200 text-black text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-colors flex-shrink-0"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Shop</span>
                </Link>
              </div>
            </div>

            {/* Engagement buttons */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex space-x-4 text-zinc-400">
                <button 
                  onClick={() => handleLike(item.id)}
                  className={`flex items-center space-x-1.5 text-xs hover:text-white transition-colors cursor-pointer ${
                    liked[item.id] ? "text-amber-400 font-semibold" : ""
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked[item.id] ? "fill-amber-400 text-amber-400" : ""}`} />
                  <span>{likes[item.id]}</span>
                </button>
                <div className="flex items-center space-x-1.5 text-xs hover:text-white cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  <span>{Math.round(likes[item.id] * 0.15)}</span>
                </div>
              </div>
              <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer" title="Share">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Description comment */}
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              <strong className="text-zinc-200 font-semibold mr-1.5">{item.author.split(" ")[0]}</strong>
              {item.description}
            </p>

          </div>
        ))}
      </div>

    </div>
  );
}
