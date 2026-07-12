"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Shield, PlaneTakeoff, Award, MessageSquare, Send, X, Volume2 } from "lucide-react";
import { toast } from "react-hot-toast";

// Luxury fashion background video URLs from public stock feeds
const BACKGROUND_VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-in-slow-motion-41865-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-in-fashionable-black-clothes-walking-slowly-41861-large.mp4"
];

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Floating AI Orb States
  const [isOrbOpen, setIsOrbOpen] = useState(false);
  const [orbQuery, setOrbQuery] = useState("");
  const [isOrbThinking, setIsOrbThinking] = useState(false);

  // Custom magnetic glow cursor coordinates
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorHovering, setCursorHovering] = useState(false);

  // Statistics states
  const [statsCount1, setStatsCount1] = useState(0);
  const [statsCount2, setStatsCount2] = useState(0);
  const [statsCount3, setStatsCount3] = useState(0);

  // GSAP Animation References
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register GSAP ScrollTrigger plugin on client-side
    gsap.registerPlugin(ScrollTrigger);

    // Fetch featured products
    fetch("/api/products?limit=4")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.products)) {
          setTrendingProducts(data.products);
        }
      })
      .catch((err) => console.error("Error loading home products", err))
      .finally(() => setLoading(false));

    // Mouse glow tracker
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 1. Initial Timeline Animations (Duration: 2.5s)
    const tl = gsap.timeline();
    
    // Set initial layout states
    gsap.set(videoRef.current, { scale: 1.08, opacity: 0 });
    gsap.set(".char-anim", { y: 80, rotate: 4, opacity: 0 });
    gsap.set(subtitleRef.current, { filter: "blur(20px)", opacity: 0 });
    gsap.set(ctaRef.current, { scale: 0.8, opacity: 0 });
    gsap.set(scrollIndicatorRef.current, { opacity: 0 });

    tl.to(videoRef.current, { opacity: 0.45, duration: 1.2, ease: "power2.out" })
      .to(videoRef.current, { scale: 1, duration: 3.5, ease: "power4.out" }, 0)
      .to(".char-anim", {
        y: 0,
        rotate: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.04,
        ease: "power4.out"
      }, 0.5)
      .to(subtitleRef.current, {
        filter: "blur(0px)",
        opacity: 0.8,
        duration: 1.2,
        ease: "power2.out"
      }, 1.2)
      .to(ctaRef.current, {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "elastic.out(1, 0.75)"
      }, 1.4)
      .to(scrollIndicatorRef.current, {
        opacity: 0.6,
        duration: 0.8
      }, 1.8);

    // 2. Parallax Scroll Trigger
    gsap.to(videoRef.current, {
      scale: 1.15,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".hero-content-anim", {
      y: -120,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // 3. Section Reveal Scroll Triggers
    gsap.utils.toArray("section").forEach((sec: any) => {
      if (sec === heroRef.current) return;
      
      gsap.fromTo(sec, 
        { opacity: 0, y: 70, filter: "blur(6px)" },
        { 
          opacity: 1, 
          y: 0, 
          filter: "blur(0px)",
          duration: 1.2, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    // 4. Statistics Counter Scroll Trigger
    const statsTrigger = {
      trigger: "#stats-section",
      start: "top 80%",
    };

    gsap.to({ val: 0 }, {
      val: 100000,
      duration: 3,
      ease: "power3.out",
      scrollTrigger: statsTrigger,
      onUpdate: function() {
        setStatsCount1(Math.floor(this.targets()[0].val));
      }
    });

    gsap.to({ val: 0 }, {
      val: 25,
      duration: 3,
      ease: "power3.out",
      scrollTrigger: statsTrigger,
      onUpdate: function() {
        setStatsCount2(Math.floor(this.targets()[0].val));
      }
    });

    gsap.to({ val: 0 }, {
      val: 98,
      duration: 3,
      ease: "power3.out",
      scrollTrigger: statsTrigger,
      onUpdate: function() {
        setStatsCount3(Math.floor(this.targets()[0].val));
      }
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Quick prompt triggers routing directly to AI Stylist
  const handleQuickPromptClick = (promptText: string) => {
    setIsOrbOpen(false);
    toast.success(`Loading coordinate suggestions for: "${promptText}"`);
    router.push(`/stylist?prompt=${encodeURIComponent(promptText)}`);
  };

  const handleOrbAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orbQuery.trim()) return;

    setIsOrbThinking(true);
    const query = orbQuery;
    setOrbQuery("");
    
    setTimeout(() => {
      setIsOrbThinking(false);
      setIsOrbOpen(false);
      router.push(`/stylist?prompt=${encodeURIComponent(query)}`);
    }, 1200);
  };

  // Split word-by-character helper
  const splitWords = (text: string) => {
    return text.split(" ").map((word, wordIdx) => (
      <span key={wordIdx} className="inline-block whitespace-nowrap mr-3 overflow-hidden py-1">
        {word.split("").map((char, charIdx) => (
          <span
            key={charIdx}
            className="char-anim inline-block origin-bottom-left"
          >
            {char}
          </span>
        ))}
      </span>
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-accent/30 selection:text-[#F6E7B4] relative overflow-hidden">
      
      {/* 1. Fullscreen Cinematic Hero Section */}
      <section 
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden border-b border-zinc-950 z-10"
        onMouseEnter={() => setCursorHovering(true)}
        onMouseLeave={() => setCursorHovering(false)}
      >
        
        {/* Background Cinematic Video Loop */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            src="/videos/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Premium Dark Gradient Overlay */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.60), rgba(0,0,0,0.20), rgba(0,0,0,0.70))"
          }}
        />

        {/* Second soft light radial gradient overlay */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: "radial-gradient(circle at top, rgba(255,255,255,0.05), transparent 60%)"
          }}
        />

        {/* Vignette border framing */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_300px_rgba(0,0,0,0.55)] z-10" />

        {/* Subtle Gold Light Beam */}
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[160px] pointer-events-none z-10" />

        {/* Hero Content */}
        <div className="hero-content-anim relative max-w-5xl mx-auto px-6 text-center z-20 space-y-8">
          
          {/* Tagline */}
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full px-5 py-2 text-[9px] uppercase tracking-[0.25em] text-[#C9A45D] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45D] animate-pulse" />
            <span>Luxury Reimagined. Powered by AI.</span>
          </div>

          {/* Headline Split-Text reveal */}
          <h1 className="font-serif text-5xl md:text-8xl font-light tracking-tight text-white leading-[1.05] uppercase">
            <span className="block">
              {splitWords("Luxury,")}
            </span>
            <span className="block bg-gradient-to-r from-[#F6E7B4] via-[#D6B36A] to-[#9E7A39] bg-clip-text text-transparent font-normal">
              {splitWords("Reimagined")}
            </span>
            <span className="block text-white">
              {splitWords("Through AI.")}
            </span>
          </h1>

          {/* Subheading */}
          <p 
            ref={subtitleRef}
            className="text-zinc-400 text-xs md:text-sm max-w-lg mx-auto font-light leading-relaxed tracking-wider opacity-80"
          >
            Experience intelligent fashion, personalized styling, and immersive shopping. Crafted from raw Japanese selvedge denim and pure Mongolian cashmere.
          </p>

          {/* Action CTAs */}
          <div ref={ctaRef} className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/tryon"
              className="inline-flex items-center space-x-2.5 text-black bg-gradient-to-r from-[#F6E7B4] via-[#D6B36A] to-[#9E7A39] hover:brightness-110 font-bold uppercase tracking-widest text-[10px] px-8 py-4.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-[#D6B36A]/10 cursor-pointer"
            >
              <span>Virtual Try-On</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2.5 text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl font-bold uppercase tracking-widest text-[10px] px-8 py-4.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Explore Closet</span>
            </Link>
          </div>

        </div>

        {/* Bottom Scroll indicator */}
        <div ref={scrollIndicatorRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 text-zinc-550 text-[9px] uppercase tracking-[0.2em] font-medium z-20">
          <span>Scroll to Discover</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-zinc-600 to-transparent animate-[scrollLine_2s_infinite]" />
        </div>

      </section>

      {/* 2. Visual Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-32 w-full space-y-16">
        
        <div className="text-center space-y-2.5">
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#D6B36A] font-bold block">The Collections</span>
          <h2 className="font-serif text-3xl md:text-5xl font-light uppercase tracking-wide">Shop by Category</h2>
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#D6B36A] to-transparent mx-auto pt-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Card 1: Outerwear */}
          <Link href="/products?category=outerwear" className="group relative h-[450px] overflow-hidden rounded-3xl block border border-zinc-900 hover:border-[#D6B36A]/30 transition-all duration-500">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 group-hover:scale-105"
              style={{ backgroundImage: "linear-gradient(to top, #060606 5%, rgba(6,6,6,0.1) 70%), url('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80')" }}
            />
            <div className="absolute bottom-8 left-8 right-8 space-y-1">
              <h3 className="font-serif text-xl font-medium text-[#F7F5F2]">Outerwear</h3>
              <p className="text-zinc-450 text-[10px] tracking-wider uppercase font-light">Tailored coats & blazers</p>
            </div>
          </Link>

          {/* Card 2: Knitwear */}
          <Link href="/products?category=knitwear" className="group relative h-[450px] overflow-hidden rounded-3xl block border border-zinc-900 hover:border-[#D6B36A]/30 transition-all duration-500">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 group-hover:scale-105"
              style={{ backgroundImage: "linear-gradient(to top, #060606 5%, rgba(6,6,6,0.1) 70%), url('https://images.unsplash.com/photo-1574164904299-3a102b110380?w=600&auto=format&fit=crop&q=80')" }}
            />
            <div className="absolute bottom-8 left-8 right-8 space-y-1">
              <h3 className="font-serif text-xl font-medium text-[#F7F5F2]">Knitwear</h3>
              <p className="text-zinc-450 text-[10px] tracking-wider uppercase font-light">Merino wool & cashmere</p>
            </div>
          </Link>

          {/* Card 3: Shirts */}
          <Link href="/products?category=tops-shirts" className="group relative h-[450px] overflow-hidden rounded-3xl block border border-zinc-900 hover:border-[#D6B36A]/30 transition-all duration-500">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 group-hover:scale-105"
              style={{ backgroundImage: "linear-gradient(to top, #060606 5%, rgba(6,6,6,0.1) 70%), url('https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80')" }}
            />
            <div className="absolute bottom-8 left-8 right-8 space-y-1">
              <h3 className="font-serif text-xl font-medium text-[#F7F5F2]">Tops & Shirts</h3>
              <p className="text-zinc-450 text-[10px] tracking-wider uppercase font-light">Mulberry silk & cottons</p>
            </div>
          </Link>

          {/* Card 4: Bottoms */}
          <Link href="/products?category=bottoms" className="group relative h-[450px] overflow-hidden rounded-3xl block border border-zinc-900 hover:border-[#D6B36A]/30 transition-all duration-500">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 group-hover:scale-105"
              style={{ backgroundImage: "linear-gradient(to top, #060606 5%, rgba(6,6,6,0.1) 70%), url('https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80')" }}
            />
            <div className="absolute bottom-8 left-8 right-8 space-y-1">
              <h3 className="font-serif text-xl font-medium text-[#F7F5F2]">Bottoms</h3>
              <p className="text-zinc-450 text-[10px] tracking-wider uppercase font-light">Selvedge denim & trousers</p>
            </div>
          </Link>

        </div>
      </section>

      {/* 3. Featured / Trending Products Grid */}
      <section className="bg-[#0E0E0E] border-y border-zinc-950 py-32 w-full">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-4 text-center sm:text-left">
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#D6B36A] font-bold block">Highly Coveted</span>
              <h2 className="font-serif text-3xl md:text-5xl font-light uppercase tracking-wide text-white">Trending Arrivals</h2>
            </div>
            <Link
              href="/products"
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D6B36A] hover:text-white transition-colors flex items-center space-x-2"
            >
              <span>View All Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="bg-zinc-950 border border-zinc-900 rounded-3xl h-96 w-full animate-pulse" />
                  <div className="h-4 bg-zinc-900 rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-zinc-900 rounded w-1/3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingProducts.map((product) => {
                const primaryImage = product.images.find((img: any) => img.isPrimary)?.url || product.images[0]?.url;
                return (
                  <div 
                    key={product.id} 
                    className="group relative flex flex-col bg-[#060606] border border-zinc-900 rounded-3xl p-4 hover:border-[#D6B36A]/20 transition-all duration-500 shadow-md shadow-black/40 hover:-translate-y-1"
                  >
                    
                    {/* Image Area with luxury border details */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[3/4] mb-5 bg-[#0E0E0E]">
                      {product.stock <= 0 ? (
                        <span className="absolute top-4 left-4 z-10 bg-red-950/80 border border-red-800/30 text-red-300 font-bold text-[8px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                          Sold Out
                        </span>
                      ) : product.stock <= 5 && (
                        <span className="absolute top-4 left-4 z-10 bg-amber-950/80 border border-amber-800/30 text-amber-300 font-bold text-[8px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                          Low Stock
                        </span>
                      )}
                      
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="object-cover w-full h-full transition-transform duration-1000 scale-100 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-750">No Image</div>
                      )}

                      {/* Hover details overlay */}
                      <div className="absolute inset-0 bg-[#060606]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <Link
                          href={`/products/${product.slug}`}
                          className="bg-white text-black font-bold text-[9px] uppercase tracking-widest px-6 py-3 rounded-full hover:bg-[#F7F5F2] transition-colors cursor-pointer"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="px-1.5 pb-2 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] text-zinc-550 uppercase tracking-[0.25em] font-bold block mb-1">
                          {product.category?.name}
                        </span>
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-serif text-base font-medium text-zinc-200 hover:text-[#D6B36A] transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-900/50">
                        <span className="text-sm font-semibold text-zinc-350">${product.price.toFixed(2)}</span>
                        <span className="text-[9px] text-zinc-550 font-light">{product.colors.join(", ")}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Premium Statistics Counter Section */}
      <section id="stats-section" className="bg-[#0D0D0D] border-y border-zinc-950/65 py-24 w-full text-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A45D] font-bold block">Intelligent Curation</span>
            <div className="font-mono text-5xl md:text-7xl font-light text-white tracking-tight">
              <span>{statsCount1.toLocaleString()}</span>
              <span className="text-[#C9A45D] font-normal">+</span>
            </div>
            <p className="text-zinc-500 text-xs font-light">Garments Fitted via Virtual Try-On</p>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A45D] font-bold block">Personalized Styles</span>
            <div className="font-mono text-5xl md:text-7xl font-light text-white tracking-tight">
              <span>{statsCount2}</span>
              <span className="text-[#C9A45D] font-normal">K+</span>
            </div>
            <p className="text-zinc-550 text-xs font-light">Active Shoppers Assisted by AI</p>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A45D] font-bold block">Carbon Footprint</span>
            <div className="font-mono text-5xl md:text-7xl font-light text-white tracking-tight">
              <span>{statsCount3}</span>
              <span className="text-[#C9A45D] font-normal">%</span>
            </div>
            <p className="text-zinc-550 text-xs font-light">Eco-Fiber Sustainability Rating</p>
          </div>
        </div>
      </section>

      {/* 4. Veloura Core Values / Trust Badges */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-32 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="text-center p-6 space-y-3.5 bg-gradient-to-b from-[#0E0E0E] to-transparent border border-zinc-900/55 rounded-3xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-950 border border-zinc-900 text-[#D6B36A] mb-1">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-white uppercase tracking-widest">Premium Fibers</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">
              We exclusively use Mongolian cashmere, long-staple cotton, and certified fine wools. Built for durability.
            </p>
          </div>

          <div className="text-center p-6 space-y-3.5 bg-gradient-to-b from-[#0E0E0E] to-transparent border border-zinc-900/55 rounded-3xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-950 border border-zinc-900 text-[#D6B36A] mb-1">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-white uppercase tracking-widest">Secure Logistics</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">
              All deliveries are tracked and insured. Verified token access guards checkout sessions and customer data.
            </p>
          </div>

          <div className="text-center p-6 space-y-3.5 bg-gradient-to-b from-[#0E0E0E] to-transparent border border-zinc-900/55 rounded-3xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-950 border border-zinc-900 text-[#D6B36A] mb-1">
              <PlaneTakeoff className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-white uppercase tracking-widest">Free Global Delivery</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">
              Enjoy free carbon-neutral shipping and returns on all international orders exceeding fifty dollars.
            </p>
          </div>

          <div className="text-center p-6 space-y-3.5 bg-gradient-to-b from-[#0E0E0E] to-transparent border border-zinc-900/55 rounded-3xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-950 border border-zinc-900 text-[#D6B36A] mb-1">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-white uppercase tracking-widest">Limited Iterations</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">
              We operate in small production runs to avoid waste. Each item is individually numbered and tracked.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FLOATING AI ORB INTERACTION COMPONENT */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden flex flex-col items-end space-y-3">
        
        {/* Floating AI Orb Panel overlay */}
        {isOrbOpen && (
          <div className="w-[320px] bg-zinc-950/90 border border-zinc-800 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl shadow-black/85 animate-[fadeInUp_0.3s_ease-out] text-left space-y-4">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-bold text-[#D6B36A] uppercase tracking-[0.25em] block">Wardrobe Intelligence</span>
                <h4 className="font-serif text-sm font-bold text-white">Ask Veloura Stylist</h4>
              </div>
              <button 
                onClick={() => setIsOrbOpen(false)}
                className="p-1 rounded-lg text-zinc-550 hover:text-white hover:bg-zinc-900/40 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Glowing active voice simulator lines */}
            <div className="flex items-center justify-center gap-1 py-1.5 border-y border-zinc-900/60">
              <Volume2 className="w-3.5 h-3.5 text-[#D6B36A]" />
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-[2px] bg-[#D6B36A] rounded-full animate-[soundWave_1.2s_infinite_alternate]" />
                <span className="w-[2px] bg-[#D6B36A] rounded-full animate-[soundWave_0.8s_infinite_alternate_0.2s] h-3" />
                <span className="w-[2px] bg-[#D6B36A] rounded-full animate-[soundWave_1.5s_infinite_alternate_0.1s] h-2" />
                <span className="w-[2px] bg-[#D6B36A] rounded-full animate-[soundWave_1.0s_infinite_alternate_0.3s] h-3" />
                <span className="w-[2px] bg-[#D6B36A] rounded-full animate-[soundWave_1.3s_infinite_alternate_0.0s] h-1" />
              </div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold ml-1.5">Orb Synthesizer Active</span>
            </div>

            {/* Quick Prompts Closet */}
            <div className="space-y-1.5">
              <span className="text-[8px] uppercase tracking-widest text-zinc-555 font-bold block mb-1">Coordinated Prompts</span>
              <button
                onClick={() => handleQuickPromptClick("Find me a luxury black outfit under $500")}
                className="w-full text-left bg-zinc-900/45 hover:bg-zinc-900 border border-zinc-900/50 hover:border-zinc-800 text-zinc-400 hover:text-white text-[10px] py-2 px-3 rounded-xl transition-all cursor-pointer font-light block"
              >
                "Find me a luxury black outfit under $500"
              </button>
              <button
                onClick={() => handleQuickPromptClick("Suggest coordinate accessories to match a cashmere knit sweater")}
                className="w-full text-left bg-zinc-900/45 hover:bg-zinc-900 border border-zinc-900/50 hover:border-zinc-800 text-zinc-400 hover:text-white text-[10px] py-2 px-3 rounded-xl transition-all cursor-pointer font-light block"
              >
                "What coordinates match cashmere knit?"
              </button>
            </div>

            {/* Input prompt query */}
            <form onSubmit={handleOrbAskSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={orbQuery}
                onChange={(e) => setOrbQuery(e.target.value)}
                placeholder="Ask style coordination..."
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D6B36A]"
                required
              />
              <button
                type="submit"
                disabled={isOrbThinking}
                className="bg-white text-black font-semibold p-2 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        )}

        {/* Pulse Glowing Sphere Orb Trigger */}
        <button
          onClick={() => setIsOrbOpen(!isOrbOpen)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-black/60 bg-gradient-to-tr from-[#9E7A39] via-[#D6B36A] to-[#F6E7B4] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group"
          title="Open AI Assistant"
        >
          {/* Internal rotating light layer */}
          <div className="absolute inset-0.5 rounded-full bg-black/85 group-hover:bg-black/75 transition-colors flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D6B36A] group-hover:text-white transition-colors animate-pulse" />
          </div>
          
          {/* Subtle outer pulsing glowing orb ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#9E7A39] via-[#D6B36A] to-[#F6E7B4] opacity-35 blur-md animate-[pulseGlow_2.5s_infinite_alternate]" />
        </button>

      </div>

    </div>
  );
}
