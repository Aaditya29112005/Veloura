import type { Metadata } from "next";
import { Playfair_Display, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import SmoothScroll from "@/components/effects/SmoothScroll";
import CustomCursor from "@/components/effects/CustomCursor";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Veloura | Luxury Fashion. Effortlessly Delivered.",
  description: "Curated collection of high-end tailoring, seasonal knitwear, fine linen shirts, and premium bottoms from Veloura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <div className="noise-overlay" />
        <CustomCursor />
        <AuthProvider>
          <CartProvider>
            <SmoothScroll>
              {/* Global toast alerts */}
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: "#141414",
                    color: "#F7F6F3",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: "13px",
                    borderRadius: "9999px",
                  },
                }}
              />

              <Navbar />
              
              <main className="flex-grow flex flex-col">
                {children}
              </main>
              
              <Footer />
            </SmoothScroll>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

