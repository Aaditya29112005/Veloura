"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium deceleration curve
    });

    // Sync ScrollTrigger updates with Lenis scroll events
    lenis.on("scroll", ScrollTrigger.update);

    // Connect Lenis to GSAP ticker
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);

    // Disable lag smoothing to prevent visual jumps
    gsap.ticker.lagSmoothing(0);

    // Scroll to top instantly on page navigation
    window.scrollTo(0, 0);
    
    // Force ScrollTrigger to recalculate offsets
    ScrollTrigger.refresh();

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateTicker);
    };
  }, [pathname]);

  return <>{children}</>;
}
