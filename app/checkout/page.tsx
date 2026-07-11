"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { CreditCard, ShoppingBag, Truck, Lock, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // Address form fields
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [loading, setLoading] = useState(false);

  // Gift Mode states
  const [isGift, setIsGift] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [deliveryScheduledFor, setDeliveryScheduledFor] = useState("");

  // Auto-fetch saved address if available
  useEffect(() => {
    if (user) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user && Array.isArray(data.user.addresses) && data.user.addresses.length > 0) {
            const addr = data.user.addresses.find((a: any) => a.isDefault) || data.user.addresses[0];
            setStreet(addr.street || "");
            setCity(addr.city || "");
            setState(addr.state || "");
            setPostalCode(addr.postalCode || "");
            setCountry(addr.country || "United States");
          }
        })
        .catch((err) => console.error("Error loading address", err));
    }
  }, [user]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

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
        toast.success(`Coupon Applied! Saved $${discount.toFixed(2)}`);
      } else {
        toast.error(data.error || "Failed to validate coupon");
      }
    } catch (err) {
      toast.error("Error checking coupon code");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode || !country) {
      toast.error("Please fill in all shipping details");
      return;
    }

    setLoading(true);
    const fullAddress = `${street}, ${city}, ${state} ${postalCode}, ${country}`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: fullAddress,
          billingAddress: fullAddress,
          couponCode: appliedCoupon?.code || null,
          isGift,
          giftRecipient: isGift ? giftRecipient : null,
          giftMessage: isGift ? giftMessage : null,
          deliveryScheduledFor: isGift && deliveryScheduledFor ? deliveryScheduledFor : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Order placed successfully!");
        await clearCart(); // Reset cart context state
        router.push(`/orders/${data.order.id}`); // Route to details confirmation page
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (err) {
      toast.error("An unexpected error occurred during checkout");
    } finally {
      setLoading(false);
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
      <div className="max-w-xl mx-auto px-4 py-20 w-full flex-grow text-center space-y-4">
        <h2 className="font-serif text-2xl text-zinc-350">No Items to Check Out</h2>
        <p className="text-zinc-550 text-xs">Your shopping cart is currently empty.</p>
        <button onClick={() => router.push("/products")} className="text-amber-400 font-semibold hover:underline text-xs">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      
      {/* Back to cart */}
      <button onClick={() => router.push("/cart")} className="inline-flex items-center text-zinc-500 hover:text-white text-xs font-semibold mb-8 group transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" /> Back to Bag
      </button>

      <h1 className="font-serif text-3xl font-bold tracking-wide uppercase mb-10 text-center md:text-left">
        Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Columns (8): Checkout Form */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            
            {/* 1. Shipping Section */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 space-y-4">
              <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Shipping Address</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="123 Luxury Ave, Apt 4B"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="NY"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="United States"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 1.5 Gift Option checklist */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 space-y-4">
              <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>🎁</span>
                <span>Gift Options</span>
              </h2>
              <label className="flex items-center space-x-2.5 text-xs text-zinc-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-850 text-amber-405 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Send this order as a gift (hide prices on invoice)</span>
              </label>

              {isGift && (
                <div className="space-y-3.5 pt-2 animate-fadeIn text-left">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={giftRecipient}
                      onChange={(e) => setGiftRecipient(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Aaditya mohan samadhiya"
                      required={isGift}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                      Gift Message
                    </label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Hope you love this premium curation!"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                      Schedule Delivery Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={deliveryScheduledFor}
                      onChange={(e) => setDeliveryScheduledFor(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Payment simulation section */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 space-y-4">
              <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Simulated Payment</span>
              </h2>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                We do not collect real payment credentials during this review assessment. Placing an order will directly verify stock quantities, decrement records in the database, and compile your confirmation logs.
              </p>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center space-x-3 text-zinc-350 text-xs">
                <CreditCard className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>Sandbox Mode &bull; Simulated Visa card pre-linked</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 text-black bg-white hover:bg-zinc-200 py-4.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? "Processing Order..." : `Place Order • $${total.toFixed(2)}`}</span>
            </button>

          </form>
        </div>

        {/* Right Columns (4): Summary & Cart Preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="font-serif text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-zinc-500" />
              <span>Garments ({cartItems.length})</span>
            </h3>

            {/* Cart Preview List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 border-b border-zinc-850 pb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="font-medium text-zinc-350 line-clamp-1">{item.product.name}</span>
                    <span className="text-[10px] text-zinc-500 font-light">
                      Qty {item.quantity} &bull; Size {item.size} &bull; Color {item.color}
                    </span>
                  </div>
                  <span className="font-semibold text-zinc-350 flex-shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs border-b border-zinc-850 pb-4">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-amber-450 font-semibold">
                  <span>Bundle Discount (15%)</span>
                  <span>-${bundleDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
            </div>

            {/* Apply coupon in checkout optionally */}
            {!appliedCoupon && (
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-zinc-450 font-bold block">Apply Discount Code</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. WELCOME10"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2 text-xs text-white uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-200"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between font-serif text-base font-bold text-white pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
