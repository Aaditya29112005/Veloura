"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Tag, X } from "lucide-react";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setVerifyingCoupon(true);

    try {
      const res = await fetch(
        `/api/coupons?code=${encodeURIComponent(
          couponCode.trim().toUpperCase()
        )}&subtotal=${cartSubtotal}`
      );

      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data);
        // Calculate discount
        let discount = 0;
        if (data.discountType === "PERCENT") {
          discount = cartSubtotal * (data.discountValue / 100);
          if (data.maxDiscount && discount > data.maxDiscount) {
            discount = data.maxDiscount;
          }
        } else {
          discount = data.discountValue;
        }

        setDiscountAmount(discount);
        toast.success(`Coupon "${data.code}" applied!`);
        setCouponCode("");
      } else {
        toast.error(data.error || "Failed to apply coupon");
      }
    } catch (err) {
      toast.error("Failed to check coupon code");
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    toast.success("Coupon removed");
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      toast.error("Please sign in to proceed with checkout");
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  // Bundle Detection Logic
  const hasTop = cartItems.some(item => {
    const name = item.product.name.toLowerCase();
    return name.includes("shirt") || name.includes("tee") || name.includes("jacket") || name.includes("blazer") || name.includes("sweater") || name.includes("hoodie");
  });

  const hasBottom = cartItems.some(item => {
    const name = item.product.name.toLowerCase();
    return name.includes("trousers") || name.includes("pants") || name.includes("jeans") || name.includes("shorts") || name.includes("skirt");
  });

  const isBundleEligible = hasTop && hasBottom;
  
  let bundleDiscount = 0;
  if (isBundleEligible) {
    const bundleTotal = cartItems
      .filter(item => {
        const name = item.product.name.toLowerCase();
        const isTop = name.includes("shirt") || name.includes("tee") || name.includes("jacket") || name.includes("blazer") || name.includes("sweater") || name.includes("hoodie");
        const isBottom = name.includes("trousers") || name.includes("pants") || name.includes("jeans") || name.includes("shorts") || name.includes("skirt");
        return isTop || isBottom;
      })
      .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    bundleDiscount = bundleTotal * 0.15;
  }

  const total = Math.max(0, cartSubtotal - discountAmount - bundleDiscount);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 w-full flex-grow text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-550">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl text-zinc-350">Your Cart is Empty</h2>
        <p className="text-zinc-500 text-xs font-light max-w-sm mx-auto leading-relaxed">
          You haven&apos;t added any fashion items to your shopping cart yet. Discover our new tailored arrivals.
        </p>
        <div className="pt-4">
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 text-black bg-white hover:bg-zinc-200 font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <h1 className="font-serif text-3xl font-bold tracking-wide uppercase mb-10 text-center md:text-left">
        Shopping Bag
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const primaryImg =
              item.product.images?.find((img: any) => img.isPrimary)?.url ||
              item.product.images?.[0]?.url;

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-4 transition-all hover:border-zinc-800/80"
              >
                {/* Image aspect-box */}
                <div className="w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                  {primaryImg ? (
                    <img src={primaryImg} alt={item.product.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">No Img</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-serif text-sm sm:text-base font-bold text-zinc-200 hover:text-amber-400 transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-[10px] text-zinc-500 font-light mt-1">
                    Size: <span className="text-zinc-300 font-semibold">{item.size}</span> &bull; Color:{" "}
                    <span className="text-zinc-300 font-semibold">{item.color}</span>
                  </p>
                  
                  {/* Quantity adjustments */}
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                      className="p-1 border border-zinc-800 rounded-md hover:border-zinc-650 text-zinc-450 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold text-zinc-200 px-1 w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                      className="p-1 border border-zinc-800 rounded-md hover:border-zinc-650 text-zinc-450 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Pricing & delete button */}
                <div className="text-right flex flex-col justify-between h-24 flex-shrink-0">
                  <span className="text-sm font-semibold text-zinc-100">${(item.product.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="p-1.5 text-zinc-600 hover:text-red-400 self-end transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Right Side: Order Summary */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">Summary</h3>
            
            {/* Costs breakdown */}
            <div className="space-y-3 text-xs border-b border-zinc-850 pb-4">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-450">
                  <span className="flex items-center">
                    <Tag className="w-3 h-3 mr-1" /> Discount ({appliedCoupon?.code})
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {bundleDiscount > 0 && (
                <div className="flex justify-between text-amber-450 border border-dashed border-amber-400/20 bg-amber-400/5 p-2 rounded-xl">
                  <span className="flex items-center font-bold">
                    ✨ Bundle Builder (15% Off)
                  </span>
                  <span className="font-bold">-${bundleDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
            </div>

            {/* Total Cost */}
            <div className="flex justify-between font-serif text-base font-bold text-white">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {/* Coupon Application Block */}
            <div className="pt-2">
              <span className="block text-[9px] uppercase tracking-wider text-zinc-450 font-bold mb-2">
                Have a coupon code?
              </span>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-zinc-950 border border-green-800/40 rounded-lg py-2 px-3 text-xs">
                  <span className="text-green-450 font-medium">{appliedCoupon.code} applied</span>
                  <button onClick={removeCoupon} className="text-zinc-550 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 text-xs text-white uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={verifyingCoupon}
                    className="bg-white hover:bg-zinc-200 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleCheckoutRedirect}
              className="w-full flex items-center justify-center space-x-2 text-black bg-white hover:bg-zinc-200 py-4.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
          
          <div className="text-center">
            <Link href="/products" className="text-zinc-500 hover:text-white text-xs font-semibold">
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
