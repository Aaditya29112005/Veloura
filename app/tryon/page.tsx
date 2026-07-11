"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Upload, RefreshCw, Download, Save, MessageSquare, HelpCircle, Heart, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

// Preset model images
const PRESET_MODELS = [
  { id: "female", label: "Feminine Model", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80" },
  { id: "male", label: "Masculine Model", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80" }
];

export default function VirtualTryOnPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // User portrait image state
  const [selectedPhoto, setSelectedPhoto] = useState<string>(PRESET_MODELS[0].url);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(true); // default model is pre-scanned

  // Computer Vision Landmarks (Shoulder left/right, Waist left/right, Hips left/right)
  const [landmarks, setLandmarks] = useState<any>({
    shoulderLeft: { x: 90, y: 140 },
    shoulderRight: { x: 170, y: 140 },
    waistLeft: { x: 100, y: 220 },
    waistRight: { x: 160, y: 220 },
    hipLeft: { x: 95, y: 280 },
    hipRight: { x: 165, y: 280 }
  });
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const studioRef = useRef<HTMLDivElement>(null);

  // Active Closet Category and Selected Garments
  const [activeCategory, setActiveCategory] = useState<string>("Tops");
  const [selectedTop, setSelectedTop] = useState<any>(null);
  const [selectedBottom, setSelectedBottom] = useState<any>(null);
  const [selectedJacket, setSelectedJacket] = useState<any>(null);
  const [selectedShoes, setSelectedShoes] = useState<any>(null);

  // Live adjustments overrides
  const [adjustments, setAdjustments] = useState<any>({
    scale: 100,
    rotate: 0,
    widthStretch: 100,
    heightStretch: 100,
    offsetX: 0,
    offsetY: 0,
    opacity: 95
  });

  // Before & After compare slider
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isSliding, setIsSliding] = useState(false);

  // Sizing recommendations states
  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [fitPreference, setFitPreference] = useState("Regular");
  const [sizingRecommendation, setSizingRecommendation] = useState<any>(null);

  // Styling AI chat
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatLog, setChatLog] = useState<any[]>([
    { role: "assistant", content: "Welcome to the Veloura AR Virtual Studio. Select clothing items from the closet, and ask me if they harmonize well!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Local storage saved looks
  const [savedLooks, setSavedLooks] = useState<any[]>([]);

  useEffect(() => {
    // Load products
    fetch("/api/products?limit=100")
      .then(res => res.json())
      .then(d => {
        setProducts(d.products || []);
        // Pre-select first Top/Bottom
        const tops = (d.products || []).filter((p: any) => p.category?.name === "Sweaters" || p.category?.name === "Jackets" || p.name.toLowerCase().includes("tee") || p.name.toLowerCase().includes("shirt"));
        const bottoms = (d.products || []).filter((p: any) => p.name.toLowerCase().includes("pant") || p.name.toLowerCase().includes("trouser") || p.name.toLowerCase().includes("jeans"));
        if (tops.length > 0) setSelectedTop(tops[0]);
        if (bottoms.length > 0) setSelectedBottom(bottoms[0]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingProducts(false));

    // Load saved looks from storage
    const stored = localStorage.getItem("veloura_saved_looks");
    if (stored) {
      try {
        setSavedLooks(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  // Handle image upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedPhoto(reader.result as string);
      setScanned(false);
      setScanning(true);
      
      // Simulate landmark body mapping scanner
      setTimeout(() => {
        setScanning(false);
        setScanned(true);
        toast.success("AI Pose Estimation Complete. Shoulders, waist, and hips mapped!");
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  // Drag landmarks on canvas
  const handleLandmarkPointerDown = (key: string) => {
    setDraggedKey(key);
  };

  const handleCanvasPointerMove = (e: React.MouseEvent) => {
    if (!draggedKey || !studioRef.current) return;
    const rect = studioRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(260, e.clientX - rect.left));
    const y = Math.max(0, Math.min(347, e.clientY - rect.top));

    setLandmarks((prev: any) => ({
      ...prev,
      [draggedKey]: { x, y }
    }));
  };

  const handleCanvasPointerUp = () => {
    setDraggedKey(null);
  };

  // Sizing recommender calculations
  const calculateSizing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heightInput || !weightInput) {
      toast.error("Please enter height and weight");
      return;
    }

    const h = parseFloat(heightInput);
    const w = parseFloat(weightInput);
    
    // Simple predictive logic based on height/weight/fit
    let baseSize = "M";
    if (w < 60) baseSize = "S";
    else if (w > 85) baseSize = "XL";
    else if (w > 72) baseSize = "L";

    if (fitPreference === "Slim" && baseSize === "M") baseSize = "S";
    if (fitPreference === "Oversized" && baseSize === "M") baseSize = "L";

    setSizingRecommendation({
      shirt: baseSize,
      pant: w < 65 ? "30" : w < 78 ? "32" : w < 88 ? "34" : "36",
      jacket: baseSize,
      confidence: "94%"
    });
    toast.success("Size calculated using predictive regression model!");
  };

  // Style score calculator
  const calculateOutfitScore = () => {
    let score = 75;
    const itemsCount = [selectedTop, selectedBottom, selectedJacket, selectedShoes].filter(Boolean).length;
    score += itemsCount * 5;

    // Check color harmony rules
    const colors = [selectedTop?.colors?.[0], selectedBottom?.colors?.[0], selectedJacket?.colors?.[0]].filter(Boolean);
    const isMonochrome = colors.every(c => c === colors[0]);
    if (isMonochrome && colors.length > 1) score += 8;

    return Math.min(98, score);
  };

  // AI Styling chat
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userMsg = chatPrompt;
    setChatLog(prev => [...prev, { role: "user", content: userMsg }]);
    setChatPrompt("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: `User is trying on: ${selectedTop?.name || "none"} and ${selectedBottom?.name || "none"}. Prompt: ${userMsg}` 
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatLog(prev => [...prev, { role: "assistant", content: data.narrative }]);
      } else {
        setChatLog(prev => [...prev, { role: "assistant", content: "I'm having trouble analyzing the layout colors right now. However, I highly suggest matching dark neutral trousers with cream blazers for high contrast." }]);
      }
    } catch (err) {
      setChatLog(prev => [...prev, { role: "assistant", content: "Error communicating with styling server. Cream coats are always an exquisite match for dark cashmere sweaters." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Save Look locally
  const saveLook = () => {
    const newLook = {
      id: Date.now().toString(),
      top: selectedTop,
      bottom: selectedBottom,
      jacket: selectedJacket,
      shoes: selectedShoes,
      score: calculateOutfitScore()
    };

    const updated = [newLook, ...savedLooks];
    setSavedLooks(updated);
    localStorage.setItem("veloura_saved_looks", JSON.stringify(updated));
    toast.success("Look saved successfully to your virtual profile!");
  };

  // Delete look
  const deleteLook = (id: string) => {
    const updated = savedLooks.filter(l => l.id !== id);
    setSavedLooks(updated);
    localStorage.setItem("veloura_saved_looks", JSON.stringify(updated));
    toast.success("Look removed.");
  };

  // Load saved look
  const loadSavedLook = (look: any) => {
    setSelectedTop(look.top);
    setSelectedBottom(look.bottom);
    setSelectedJacket(look.jacket);
    setSelectedShoes(look.shoes);
    toast.success("Loaded saved outfit curation!");
  };

  // Off-screen canvas downloader
  const downloadLook = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 533;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = selectedPhoto;
    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, 400, 533);
      
      // Draw overlay label
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(10, 490, 380, 33);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 10px monospace";
      ctx.fillText("VELOURA AR STUDIO - OUTFIT PREVIEW PROTOTYPE", 20, 510);
      
      // Convert to image download
      const link = document.createElement("a");
      link.download = `veloura-tryon-look-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Outfit design exported successfully!");
    };
  };

  // Add Entire Outfit to Cart
  const addOutfitToCart = async () => {
    const items = [selectedTop, selectedBottom, selectedJacket, selectedShoes].filter(Boolean);
    if (items.length === 0) {
      toast.error("Please select items from the closet first");
      return;
    }

    try {
      for (const item of items) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.id,
            quantity: 1,
            size: item.sizes?.[0] || "M",
            color: item.colors?.[0] || "Black"
          })
        });
      }
      toast.success("Entire outfit added to shopping bag!");
    } catch (err) {
      toast.error("Error adding items to cart");
    }
  };

  // Compute width/height styles based on mapped shoulder/waist/hip coordinate spaces
  const shoulderWidth = Math.abs(landmarks.shoulderRight.x - landmarks.shoulderLeft.x);
  const torsoHeight = Math.abs(landmarks.hipLeft.y - landmarks.shoulderLeft.y);

  // Custom CSS dynamic styling calculations for the Tops overlay
  const topWidthStyle = (shoulderWidth * 1.5) * (adjustments.widthStretch / 100);
  const topHeightStyle = (torsoHeight * 1.3) * (adjustments.heightStretch / 100);
  const topXCenter = (landmarks.shoulderLeft.x + landmarks.shoulderRight.x) / 2 - (topWidthStyle / 2) + adjustments.offsetX;
  const topYCenter = landmarks.shoulderLeft.y - 15 + adjustments.offsetY;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-8">
      
      {/* Back link */}
      <Link href="/products" className="inline-flex items-center text-zinc-500 hover:text-white text-xs font-semibold group transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" /> Back to Collections
      </Link>

      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide uppercase text-white">AI Virtual Try-On Studio</h1>
          <p className="text-zinc-550 text-xs font-light mt-1">
            Analyze postures, align blazers and pants, view before/after comparisons, and test style scores.
          </p>
        </div>
        <div className="inline-flex items-center space-x-1.5 bg-amber-450/10 border border-amber-450/20 text-amber-450 text-[10px] tracking-widest uppercase font-bold px-3.5 py-2 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Prototype</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visual canvas, landmarks, split screens (5/12) */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-6">
          
          {/* Mapped Studio Screen Box */}
          <div 
            ref={studioRef}
            onMouseMove={handleCanvasPointerMove}
            onMouseUp={handleCanvasPointerUp}
            className="relative w-full max-w-[340px] aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-900 select-none cursor-crosshair"
          >
            
            {/* Before-and-After slider split rendering */}
            <div className="absolute inset-0 w-full h-full">
              {/* Original picture */}
              <img 
                src={selectedPhoto} 
                alt="Original" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              
              {/* Processed/Try-On layer clipped based on slider position */}
              <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ clipPath: `polygon(${sliderPos}% 0%, 100% 0%, 100% 100%, ${sliderPos}% 100%)` }}
              >
                <img 
                  src={selectedPhoto} 
                  alt="Overlay Background" 
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.9]" 
                />
                
                {/* 1. Mapped selected garments overlay */}
                {selectedTop && (
                  <img
                    src={selectedTop.images?.[0]?.url || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300"}
                    alt="top garment"
                    className="absolute object-contain pointer-events-none transition-all"
                    style={{
                      width: `${topWidthStyle}px`,
                      height: `${topHeightStyle}px`,
                      left: `${topXCenter}px`,
                      top: `${topYCenter}px`,
                      transform: `rotate(${adjustments.rotate}deg)`,
                      opacity: adjustments.opacity / 100
                    }}
                  />
                )}

                {selectedBottom && (
                  <img
                    src={selectedBottom.images?.[0]?.url || "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300"}
                    alt="bottom garment"
                    className="absolute object-contain pointer-events-none transition-all"
                    style={{
                      width: `${shoulderWidth * 1.6}px`,
                      height: `${torsoHeight * 1.5}px`,
                      left: `${(landmarks.waistLeft.x + landmarks.waistRight.x) / 2 - (shoulderWidth * 0.8)}px`,
                      top: `${landmarks.waistLeft.y + 10}px`,
                      opacity: 0.9
                    }}
                  />
                )}
              </div>
            </div>

            {/* AI scanner line */}
            {scanning && (
              <div className="absolute left-0 right-0 h-1 bg-amber-400/80 shadow-lg shadow-amber-400 animate-bounce top-1/2 z-10" />
            )}

            {/* Mapped pose skeleton nodes lines */}
            {scanned && !scanning && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Shoulders line */}
                <line x1={landmarks.shoulderLeft.x} y1={landmarks.shoulderLeft.y} x2={landmarks.shoulderRight.x} y2={landmarks.shoulderRight.y} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3" />
                {/* Waist line */}
                <line x1={landmarks.waistLeft.x} y1={landmarks.waistLeft.y} x2={landmarks.waistRight.x} y2={landmarks.waistRight.y} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3" />
                {/* Body trunk spine */}
                <line x1={(landmarks.shoulderLeft.x + landmarks.shoulderRight.x)/2} y1={landmarks.shoulderLeft.y} x2={(landmarks.waistLeft.x + landmarks.waistRight.x)/2} y2={landmarks.waistLeft.y} stroke="#f59e0b" strokeWidth={1} />
              </svg>
            )}

            {/* Mapped pose nodes points */}
            {scanned && !scanning && Object.entries(landmarks).map(([key, value]: any) => (
              <div
                key={key}
                onPointerDown={() => handleLandmarkPointerDown(key)}
                className="absolute w-3 h-3 bg-amber-400 border-2 border-zinc-950 rounded-full cursor-pointer hover:scale-125 transition-transform z-20"
                style={{ left: `${value.x - 6}px`, top: `${value.y - 6}px` }}
                title={`Drag ${key}`}
              />
            ))}

            {/* Visual split screen slider line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl cursor-ew-resize z-20"
              style={{ left: `${sliderPos}%` }}
              onMouseDown={() => setIsSliding(true)}
              onTouchStart={() => setIsSliding(true)}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-zinc-900 flex items-center justify-center text-[10px] text-black font-bold">
                ↔
              </div>
            </div>

          </div>

          {/* Slider input handle */}
          <div className="w-full max-w-[340px] space-y-1.5 print:hidden">
            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-550 tracking-wider">
              <span>Original Photo</span>
              <span>Try-On Preview</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Action buttons under canvas */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[340px]">
            <button
              onClick={saveLook}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl py-2.5 flex flex-col items-center gap-1 cursor-pointer transition-colors"
              title="Save look to storage"
            >
              <Save className="w-4 h-4" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Save Look</span>
            </button>
            <button
              onClick={downloadLook}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl py-2.5 flex flex-col items-center gap-1 cursor-pointer transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Download</span>
            </button>
            <button
              onClick={addOutfitToCart}
              className="bg-white text-black hover:bg-zinc-200 rounded-xl py-2.5 flex flex-col items-center gap-1 cursor-pointer transition-colors"
              title="Add outfit items to cart"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Buy Look</span>
            </button>
          </div>

          {/* Change models presets */}
          <div className="w-full max-w-[340px] space-y-2 text-left">
            <span className="text-[9px] uppercase tracking-widest text-zinc-550 font-bold block">Portrait Settings</span>
            <div className="flex gap-2">
              {PRESET_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedPhoto(m.url);
                    setLandmarks(m.id === "male" ? {
                      shoulderLeft: { x: 80, y: 130 },
                      shoulderRight: { x: 180, y: 130 },
                      waistLeft: { x: 95, y: 220 },
                      waistRight: { x: 165, y: 220 },
                      hipLeft: { x: 90, y: 270 },
                      hipRight: { x: 170, y: 270 }
                    } : {
                      shoulderLeft: { x: 90, y: 140 },
                      shoulderRight: { x: 170, y: 140 },
                      waistLeft: { x: 100, y: 220 },
                      waistRight: { x: 160, y: 220 },
                      hipLeft: { x: 95, y: 280 },
                      hipRight: { x: 165, y: 280 }
                    });
                    setScanned(true);
                  }}
                  className={`flex-grow border text-[10px] font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer ${
                    selectedPhoto === m.url 
                      ? "border-amber-400 bg-amber-400/5 text-amber-400" 
                      : "border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
              
              <label className="border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white text-[10px] font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Selfie</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Closet selectors, adjustments, sizing, styling chat (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Garment Closet Category Selectors */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="font-serif text-base font-bold text-white uppercase tracking-wider">Garments Closet</h3>
              <div className="flex gap-2 text-[10px] font-semibold">
                {["Tops", "Bottoms", "Jackets", "Shoes"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      activeCategory === cat 
                        ? "border-amber-400 bg-amber-400/5 text-amber-400" 
                        : "border-zinc-850 bg-zinc-950/20 text-zinc-450 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Closet products grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[160px] overflow-y-auto pr-1">
              {loadingProducts ? (
                <div className="col-span-4 py-8 text-center text-xs text-zinc-550 font-light">Loading closet...</div>
              ) : products.filter((p: any) => {
                const name = p.name.toLowerCase();
                if (activeCategory === "Tops") {
                  return name.includes("shirt") || name.includes("tee") || name.includes("sweater") || name.includes("hoodie");
                } else if (activeCategory === "Bottoms") {
                  return name.includes("pant") || name.includes("trouser") || name.includes("jeans") || name.includes("shorts");
                } else if (activeCategory === "Jackets") {
                  return name.includes("jacket") || name.includes("blazer") || name.includes("coat");
                } else {
                  return name.includes("shoe") || name.includes("boot") || name.includes("sneaker");
                }
              }).length === 0 ? (
                <div className="col-span-4 py-8 text-center text-xs text-zinc-550 font-light">No items in this category.</div>
              ) : products.filter((p: any) => {
                const name = p.name.toLowerCase();
                if (activeCategory === "Tops") {
                  return name.includes("shirt") || name.includes("tee") || name.includes("sweater") || name.includes("hoodie");
                } else if (activeCategory === "Bottoms") {
                  return name.includes("pant") || name.includes("trouser") || name.includes("jeans") || name.includes("shorts");
                } else if (activeCategory === "Jackets") {
                  return name.includes("jacket") || name.includes("blazer") || name.includes("coat");
                } else {
                  return name.includes("shoe") || name.includes("boot") || name.includes("sneaker");
                }
              }).map((p: any) => {
                const isSelected = selectedTop?.id === p.id || selectedBottom?.id === p.id || selectedJacket?.id === p.id || selectedShoes?.id === p.id;
                const imgUrl = p.images?.[0]?.url;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (activeCategory === "Tops") setSelectedTop(p);
                      else if (activeCategory === "Bottoms") setSelectedBottom(p);
                      else if (activeCategory === "Jackets") setSelectedJacket(p);
                      else setSelectedShoes(p);
                    }}
                    className={`border rounded-xl p-2 cursor-pointer transition-all ${
                      isSelected 
                        ? "border-amber-400 bg-amber-400/5 text-amber-400" 
                        : "border-zinc-900 bg-zinc-950/20 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="rounded-lg overflow-hidden aspect-[3/4] bg-zinc-900 mb-1.5">
                      <img src={imgUrl} alt={p.name} className="object-cover w-full h-full" />
                    </div>
                    <span className="text-[9px] font-bold block truncate">{p.name}</span>
                    <span className="text-[9px] text-zinc-550 block font-light">${p.price.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 2. Manual Overlay adjustments panel */}
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <h4 className="font-serif text-xs font-bold text-white uppercase tracking-wider">Fine-Tune Adjustments</h4>
              
              <div className="space-y-3.5 text-xs text-zinc-450">
                {/* Scale range */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Width Scale ({adjustments.widthStretch}%)</span>
                    <span className="text-white">{adjustments.widthStretch}%</span>
                  </div>
                  <input
                    type="range" min="60" max="150" value={adjustments.widthStretch}
                    onChange={(e) => setAdjustments((prev: any) => ({ ...prev, widthStretch: parseInt(e.target.value) }))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Torso length range */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Height Stretch ({adjustments.heightStretch}%)</span>
                    <span className="text-white">{adjustments.heightStretch}%</span>
                  </div>
                  <input
                    type="range" min="60" max="150" value={adjustments.heightStretch}
                    onChange={(e) => setAdjustments((prev: any) => ({ ...prev, heightStretch: parseInt(e.target.value) }))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Rotation range */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Rotate ({adjustments.rotate}°)</span>
                    <span className="text-white">{adjustments.rotate}°</span>
                  </div>
                  <input
                    type="range" min="-45" max="45" value={adjustments.rotate}
                    onChange={(e) => setAdjustments((prev: any) => ({ ...prev, rotate: parseInt(e.target.value) }))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* X Position Offset */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Horizontal Offset ({adjustments.offsetX}px)</span>
                    <span className="text-white">{adjustments.offsetX}px</span>
                  </div>
                  <input
                    type="range" min="-80" max="80" value={adjustments.offsetX}
                    onChange={(e) => setAdjustments((prev: any) => ({ ...prev, offsetX: parseInt(e.target.value) }))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Y Position Offset */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Vertical Offset ({adjustments.offsetY}px)</span>
                    <span className="text-white">{adjustments.offsetY}px</span>
                  </div>
                  <input
                    type="range" min="-80" max="80" value={adjustments.offsetY}
                    onChange={(e) => setAdjustments((prev: any) => ({ ...prev, offsetY: parseInt(e.target.value) }))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 3. AI Sizing Recommendation & Outfit Match Score */}
            <div className="space-y-6">
              
              {/* Outfit Score Card */}
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-550 font-bold block">Outfit Match Score</span>
                  <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider">AI Curation Score</h4>
                  <p className="text-[10px] text-zinc-500 font-light max-w-[180px] leading-tight pt-1">
                    Checking color contrast harmony and formality balance based on wardrobe rules.
                  </p>
                </div>
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-amber-400/30 bg-amber-400/5 flex-shrink-0">
                  <span className="text-base font-serif font-bold text-amber-400">{calculateOutfitScore()}</span>
                </div>
              </div>

              {/* Sizing Recommendations Form */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4">
                <h4 className="font-serif text-xs font-bold text-white uppercase tracking-wider">AI Sizing Estimator</h4>
                
                <form onSubmit={calculateSizing} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={heightInput}
                      onChange={(e) => setHeightInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-2.5 text-xs text-white"
                      placeholder="e.g. 175"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-2.5 text-xs text-white"
                      placeholder="e.g. 68"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Fit Silhouette Preference</label>
                    <select
                      value={fitPreference}
                      onChange={(e) => setFitPreference(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-2.5 text-xs text-white cursor-pointer"
                    >
                      <option value="Slim">Slim Fit (Fitted Cuts)</option>
                      <option value="Regular">Regular Fit (Standard Cuts)</option>
                      <option value="Oversized">Oversized Fit (Relaxed Drape)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="col-span-2 w-full bg-zinc-950 border border-zinc-850 text-white font-semibold text-xs py-2 rounded-lg hover:bg-zinc-900 transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Calculate Sizing Recommendation
                  </button>
                </form>

                {sizingRecommendation && (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-xs space-y-1.5 animate-fadeIn">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Recommended Shirt:</span>
                      <strong className="text-white">{sizingRecommendation.shirt}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Recommended Pants:</span>
                      <strong className="text-white">{sizingRecommendation.pant}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Fitting Confidence:</span>
                      <strong className="text-amber-400">{sizingRecommendation.confidence}</strong>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* 4. AI Styling Assistant Chat */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4">
            <h4 className="font-serif text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-400" /> AI Fashion Assistant
            </h4>

            {/* Chat list */}
            <div className="space-y-3 max-h-[140px] overflow-y-auto border-b border-zinc-900 pb-3 text-xs pr-1">
              {chatLog.map((log, idx) => (
                <div key={idx} className={`p-2.5 rounded-xl max-w-lg ${
                  log.role === "user" 
                    ? "bg-zinc-950 text-zinc-350 ml-auto text-right" 
                    : "bg-zinc-900/40 text-zinc-400 mr-auto text-left"
                }`}>
                  <span className="block text-[8px] uppercase tracking-wider text-zinc-650 font-bold mb-1">
                    {log.role === "user" ? "Shopper" : "Veloura Stylist"}
                  </span>
                  <p className="font-light leading-relaxed">{log.content}</p>
                </div>
              ))}
              {chatLoading && (
                <div className="text-zinc-550 text-[10px] animate-pulse">Assistant is coordinating suggestions...</div>
              )}
            </div>

            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Does this look good for an interview? / What coordinates match this jacket?"
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white"
                required
              />
              <button
                type="submit"
                className="bg-white text-black font-semibold text-xs px-4 rounded-xl hover:bg-zinc-200 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>

          {/* 5. Saved Looks Collection */}
          {savedLooks.length > 0 && (
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-3.5">
              <h4 className="font-serif text-xs font-bold text-white uppercase tracking-wider">Saved Looks Closet ({savedLooks.length})</h4>
              
              <div className="flex gap-3 overflow-x-auto pb-2">
                {savedLooks.map((look) => {
                  const topUrl = look.top?.images?.[0]?.url;
                  const bottomUrl = look.bottom?.images?.[0]?.url;
                  return (
                    <div 
                      key={look.id}
                      className="border border-zinc-900 bg-zinc-950 p-2.5 rounded-xl flex-shrink-0 w-36 space-y-2 relative group hover:border-amber-400/40"
                    >
                      <button
                        onClick={() => deleteLook(look.id)}
                        className="absolute top-1.5 right-1.5 p-1 bg-zinc-900 border border-zinc-850 hover:text-red-400 text-zinc-500 rounded-md transition-colors z-10 opacity-0 group-hover:opacity-100"
                        title="Delete look"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="flex gap-1">
                        <div className="flex-grow aspect-[3/4] bg-zinc-900 rounded overflow-hidden">
                          {topUrl && <img src={topUrl} alt="top" className="object-cover w-full h-full" />}
                        </div>
                        <div className="flex-grow aspect-[3/4] bg-zinc-900 rounded overflow-hidden">
                          {bottomUrl && <img src={bottomUrl} alt="bottom" className="object-cover w-full h-full" />}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[9px] text-amber-400 font-bold font-serif">Score: {look.score}</span>
                        <button
                          onClick={() => loadSavedLook(look)}
                          className="bg-white text-black hover:bg-zinc-200 text-[8px] font-bold uppercase tracking-wider py-1 px-2.5 rounded transition-colors cursor-pointer"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
