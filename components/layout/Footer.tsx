import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <span className="font-serif tracking-widest text-xl font-bold bg-gradient-to-r from-amber-250 via-yellow-450 to-amber-500 bg-clip-text text-transparent">
              VELOURA
            </span>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs">
              A curated catalog of premium materials, timeless designs, and tailored aesthetics. Designed for the modern dresser.
            </p>
          </div>

          <div>
            <h4 className="text-zinc-200 text-xs font-bold uppercase tracking-widest mb-4">Shop Collections</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=outerwear" className="text-zinc-500 hover:text-white text-xs transition-colors">
                  Outerwear
                </Link>
              </li>
              <li>
                <Link href="/products?category=knitwear" className="text-zinc-500 hover:text-white text-xs transition-colors">
                  Knitwear
                </Link>
              </li>
              <li>
                <Link href="/products?category=tops-shirts" className="text-zinc-500 hover:text-white text-xs transition-colors">
                  Tops & Shirts
                </Link>
              </li>
              <li>
                <Link href="/products?category=bottoms" className="text-zinc-500 hover:text-white text-xs transition-colors">
                  Bottoms & Denim
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-200 text-xs font-bold uppercase tracking-widest mb-4">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-zinc-500 text-xs">Shipping & Returns (Free)</span>
              </li>
              <li>
                <span className="text-zinc-500 text-xs">Size Guide</span>
              </li>
              <li>
                <span className="text-zinc-500 text-xs">Contact Veloura</span>
              </li>
              <li>
                <span className="text-zinc-500 text-xs">Sustainability Commitments</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-200 text-xs font-bold uppercase tracking-widest mb-4">Newsletter</h4>
            <p className="text-zinc-500 text-xs mb-3">
              Subscribe to receive private sale invitations and new season arrivals.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email Address"
                className="bg-zinc-900 border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none w-full"
              />
              <button className="bg-white hover:bg-zinc-200 text-black text-xs font-semibold px-4 transition-colors">
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-zinc-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-[10px]">
            &copy; {new Date().getFullYear()} VELOURA. All rights reserved. Built for Technical Assessment.
          </p>
          <div className="flex space-x-4">
            <span className="text-zinc-600 text-[10px] hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="text-zinc-600 text-[10px] hover:text-zinc-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
