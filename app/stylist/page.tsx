"use client";

import React, { useState } from "react";
import { Sparkles, MessageSquare, Send, Upload, User, DollarSign, ShoppingBag, Mic, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/CartContext";

export default function AIStylistPage() {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<"stylist" | "generator" | "size">("stylist");

  // Stylist states
  const [prompt, setPrompt] = useState("");
  const [loadingStylist, setLoadingStylist] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      sender: "ai",
      text: "Welcome to Veloura. I am your personal AI Stylist. Tell me about your upcoming event, preferred cuts, or style guidelines (e.g. 'I have a formal wedding this weekend' or 'Show me summer linen outfits')."
    }
  ]);
  const [stylistResult, setStylistResult] = useState<any>(null);
  const [addingAll, setAddingAll] = useState(false);

  // Generator states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [simulatedUploaded, setSimulatedUploaded] = useState(false);
  const [generatorResult, setGeneratorResult] = useState<any>(null);

  // Size states
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyType, setBodyType] = useState("average");
  const [loadingSize, setLoadingSize] = useState(false);
  const [sizeResult, setSizeResult] = useState<any>(null);

  // Trigger simulated voice search
  const triggerVoiceSearch = () => {
    toast.success("Voice listening active...");
    setPrompt("Show me premium black coats under $300");
  };

  // Submit Stylist Prompt
  const handleStylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg = prompt;
    setPrompt("");
    setChatHistory(prev => [...prev, { sender: "user", text: userMsg }]);
    setLoadingStylist(true);

    try {
      const res = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [...prev, { sender: "ai", text: data.narrative }]);
        setStylistResult(data);
      } else {
        toast.error("Failed to compile stylist recommendation");
      }
    } catch (err) {
      toast.error("Error communicating with AI Stylist");
    } finally {
      setLoadingStylist(false);
    }
  };

  // Add Entire Stylist Outfit
  const handleAddEntireOutfit = async () => {
    if (!stylistResult) return;
    setAddingAll(true);
    try {
      // Add regular database items
      for (const p of stylistResult.outfit) {
        await addToCart(p.id, 1, "M", "Black", p); // default parameters
      }
      toast.success("Entire outfit added to your shopping bag!");
    } catch (err) {
      toast.error("Failed to add outfit to bag");
    } finally {
      setAddingAll(false);
    }
  };

  // Simulated Outfit Generator Upload
  const handleSimulateUpload = () => {
    setUploadingImage(true);
    setTimeout(() => {
      setUploadingImage(false);
      setSimulatedUploaded(true);
      // Compile outfit suggestions based on uploaded item
      setGeneratorResult({
        shirt: "Uploaded: Fine Knit Cotton Tee",
        matches: [
          { name: "Raw Selvedge Denim Jeans", price: 135.0, type: "Pants" },
          { name: "Handmade Calfskin Sneakers", price: 180.0, type: "Shoes" },
          { name: "Cashmere Double-Breasted Trench Coat", price: 380.0, type: "Jacket" }
        ],
        totalCost: 695.0
      });
      toast.success("AI analyzed shirt upload and matched coordinates!");
    }, 2000);
  };

  // Submit Size Predictor
  const handleSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!height || !weight) return;

    setLoadingSize(true);
    try {
      const res = await fetch("/api/ai/size-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height, weight, bodyType })
      });

      if (res.ok) {
        const data = await res.json();
        setSizeResult(data);
      } else {
        toast.error("Sizing prediction failed");
      }
    } catch (err) {
      toast.error("Error predicting size");
    } finally {
      setLoadingSize(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-grow">
      
      {/* Title */}
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center space-x-1.5 bg-amber-450/10 border border-amber-450/20 text-amber-450 text-[10px] tracking-widest uppercase font-bold px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Veloura Intelligent Styling Core</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-white">AI Assistant Panel</h1>
        <p className="text-zinc-550 text-xs font-light max-w-md mx-auto leading-relaxed">
          Unlock wardrobe recommendations, customized color coords, and bespoke sizing algorithms.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900 mb-8">
        <button
          onClick={() => setActiveTab("stylist")}
          className={`flex-grow py-3 text-xs tracking-wider uppercase font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "stylist" ? "border-amber-400 text-white font-bold" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          AI Fashion Stylist
        </button>
        <button
          onClick={() => setActiveTab("generator")}
          className={`flex-grow py-3 text-xs tracking-wider uppercase font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "generator" ? "border-amber-400 text-white font-bold" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          AI Outfit Generator
        </button>
        <button
          onClick={() => setActiveTab("size")}
          className={`flex-grow py-3 text-xs tracking-wider uppercase font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "size" ? "border-amber-400 text-white font-bold" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          AI Size Prediction
        </button>
      </div>

      {/* Tab: Stylist */}
      {activeTab === "stylist" && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6 h-[350px] overflow-y-auto flex flex-col space-y-4">
            {chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`flex max-w-[80%] flex-col space-y-1 ${
                  chat.sender === "user" ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <div
                  className={`text-xs p-3 rounded-2xl leading-relaxed font-light ${
                    chat.sender === "user" 
                      ? "bg-amber-400 text-black font-medium rounded-tr-none" 
                      : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
                  }`}
                >
                  {chat.text}
                </div>
                <span className="text-[9px] text-zinc-650 uppercase tracking-widest font-semibold px-1">
                  {chat.sender === "user" ? "You" : "Veloura AI"}
                </span>
              </div>
            ))}
            {loadingStylist && (
              <div className="self-start items-start flex space-x-2 bg-zinc-900 border border-zinc-850 p-3 rounded-2xl rounded-tl-none text-zinc-500 text-xs">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          <form onSubmit={handleStylistSubmit} className="flex gap-3">
            <button
              type="button"
              onClick={triggerVoiceSearch}
              className="p-3 bg-zinc-900 border border-zinc-800 hover:border-amber-400/30 text-zinc-450 hover:text-amber-400 rounded-xl transition-all cursor-pointer"
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'I have a wedding this weekend.' or 'Casual beach outfit ideas'"
              className="bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:outline-none rounded-xl px-4 py-3 text-xs text-white flex-grow font-light"
            />
            <button
              type="submit"
              disabled={loadingStylist}
              className="bg-white text-black p-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Stylist Results */}
          {stylistResult && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
                <div>
                  <h3 className="font-serif text-base font-bold text-white uppercase tracking-wider">AI Curated Outfit</h3>
                  <p className="text-[10px] text-zinc-500 font-light mt-0.5">Perfect coordinate sets selected from catalog items</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-zinc-500 block font-bold tracking-wider">Estimated Total</span>
                  <span className="text-xl font-serif text-white">${stylistResult.subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Catalog items */}
                <div className="space-y-3">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block">Garment Pieces</span>
                  {stylistResult.outfit.map((p: any) => (
                    <div key={p.id} className="flex items-center space-x-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                      <img src={p.image} alt={p.name} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                      <div className="min-w-0 flex-grow">
                        <span className="text-xs font-semibold text-zinc-300 block truncate">{p.name}</span>
                        <span className="text-[10px] text-zinc-550 block font-light">${p.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated additions */}
                <div className="space-y-3">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block">Style Accessories</span>
                  
                  {/* Shoes */}
                  <div className="flex items-center space-x-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 flex-shrink-0 text-xs">👞</div>
                    <div className="min-w-0 flex-grow">
                      <span className="text-xs font-semibold text-zinc-300 block truncate">{stylistResult.shoes.name}</span>
                      <span className="text-[10px] text-zinc-550 block font-light">${stylistResult.shoes.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Watch */}
                  <div className="flex items-center space-x-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 flex-shrink-0 text-xs">⌚</div>
                    <div className="min-w-0 flex-grow">
                      <span className="text-xs font-semibold text-zinc-300 block truncate">{stylistResult.watch.name}</span>
                      <span className="text-[10px] text-zinc-550 block font-light">${stylistResult.watch.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddEntireOutfit}
                disabled={addingAll}
                className="w-full bg-white text-black font-semibold text-xs py-3.5 rounded-xl hover:bg-zinc-200 transition-colors uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addingAll ? "Adding Items..." : "Add Entire Outfit to Bag"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Generator */}
      {activeTab === "generator" && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white mb-1">Upload Garment Image</h3>
              <p className="text-zinc-500 text-xs font-light max-w-xs leading-relaxed">
                Upload a photo of any shirt, jeans, or coat. The AI will immediately analyze its properties and build coordinates matching pants, jackets, and shoes.
              </p>
            </div>
            <button
              onClick={handleSimulateUpload}
              disabled={uploadingImage}
              className="bg-white text-black font-semibold text-xs px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploadingImage ? "AI Analyzing Fabric Coords..." : "Select Shirt Photo"}
            </button>
          </div>

          {/* Generator Result */}
          {generatorResult && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-zinc-850 pb-4">
                <CheckCircle className="w-4 h-4" />
                <span>Coord Matches Generated</span>
              </div>

              <div className="space-y-4">
                <div className="text-xs">
                  <span className="text-zinc-550 font-bold block mb-1">INPUT SOURCE</span>
                  <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg text-zinc-300 font-medium w-fit">
                    👚 {generatorResult.shirt}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">RECOMMENDED OUTFIT PIECES</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {generatorResult.matches.map((item: any, idx: number) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-2">
                        <span className="text-[9px] uppercase tracking-widest text-amber-450 bg-amber-450/10 border border-amber-450/20 px-2 py-0.5 rounded font-bold">{item.type}</span>
                        <span className="text-xs font-semibold text-zinc-200 block mt-1">{item.name}</span>
                        <span className="text-xs text-zinc-500 block font-light">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Size */}
      {activeTab === "size" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSizeSubmit} className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-2xl space-y-5">
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider mb-2">Sizing Predictor</h3>
            
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="E.g., 178"
                className="bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:outline-none text-xs text-white p-3 rounded-lg w-full"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="E.g., 72"
                className="bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:outline-none text-xs text-white p-3 rounded-lg w-full"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">Body Type</label>
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:outline-none text-xs text-white p-3 rounded-lg w-full"
              >
                <option value="slim">Slim</option>
                <option value="average">Average</option>
                <option value="athletic">Athletic / Muscular</option>
                <option value="curvy">Curvy / Plus Size</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loadingSize}
              className="w-full bg-white text-black font-semibold text-xs py-3 rounded-lg hover:bg-zinc-200 transition-colors uppercase tracking-wider cursor-pointer"
            >
              {loadingSize ? "Calculating Fitting Models..." : "Predict Best Fit"}
            </button>
          </form>

          {/* Size Result */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center text-center space-y-4">
            {sizeResult ? (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">Recommended Size</span>
                  <span className="text-6xl font-serif text-amber-400 font-bold bg-amber-400/5 border border-amber-400/20 px-6 py-2 rounded-2xl inline-block">
                    {sizeResult.size}
                  </span>
                </div>
                <div className="text-xs space-y-1.5">
                  <span className="text-zinc-400 font-semibold block uppercase tracking-wider">Analysis Matrix</span>
                  <p className="text-zinc-500 font-light leading-relaxed px-4">
                    {sizeResult.rationale}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-zinc-550 space-y-2">
                <User className="w-8 h-8 mx-auto" />
                <p className="text-xs font-light">Enter your measurements to predict the best-fitting sizing options instantly.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
