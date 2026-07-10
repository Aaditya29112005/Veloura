"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { ArrowLeft, Clock, MapPin, Printer, ShieldCheck } from "lucide-react";

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetch(`/api/orders/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Order not found");
          return res.json();
        })
        .then((data) => setOrder(data))
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load order details");
        })
        .finally(() => setLoading(false));
    }
  }, [id, user]);

  const handlePrint = () => {
    window.print();
  };

  const getStepActive = (stepStatus: string) => {
    if (!order) return false;
    const states = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    const currentIndex = states.indexOf(order.status);
    const stepIndex = states.indexOf(stepStatus);
    return currentIndex >= stepIndex;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex-grow flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-xs tracking-wider uppercase font-medium">Loading receipt info...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex-grow text-center space-y-4">
        <h2 className="font-serif text-2xl text-zinc-350">Order Not Found</h2>
        <Link href="/orders" className="text-amber-400 font-semibold hover:underline text-xs">
          Return to Order History
        </Link>
      </div>
    );
  }

  const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow print:py-0 print:px-0">
      
      {/* Back button (hide during print) */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link href="/orders" className="inline-flex items-center text-zinc-500 hover:text-white text-xs font-semibold group transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" /> Back to History
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 text-xs text-zinc-350 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF Invoice</span>
        </button>
      </div>

      {/* Main Print Container */}
      <div className="space-y-8 print:text-black">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-6 gap-4 print:border-zinc-300">
          <div>
            <span className="text-[10px] text-green-550 uppercase tracking-widest font-bold flex items-center mb-1">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Order Confirmation
            </span>
            <h1 className="font-mono text-lg font-bold text-white uppercase tracking-wider print:text-black">
              ORDER REF: #{order.id.slice(0, 8)}
            </h1>
            <p className="text-zinc-500 text-xs font-light mt-1 print:text-zinc-650">Placed on {dateStr}</p>
          </div>
          <div className="text-left sm:text-right print:text-black">
            <span className="text-xs text-zinc-500 block uppercase tracking-widest font-bold mb-1">Total Bill</span>
            <span className="text-2xl font-serif font-bold text-white print:text-black">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* 1. Editable Order Status Timeline (hide on CANCELLED) */}
        {order.status === "CANCELLED" ? (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs flex items-center justify-center print:border-red-650 print:text-red-750">
            This order has been cancelled and returned to inventory.
          </div>
        ) : (
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 print:hidden">
            <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-6 block">Order Status Timeline</h3>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative">
              
              {/* Stepper Node 1 */}
              <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getStepActive("PENDING") ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20" : "bg-zinc-800 text-zinc-500"}`}>
                  1
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${getStepActive("PENDING") ? "text-amber-400" : "text-zinc-500"}`}>Placed</span>
              </div>

              {/* Stepper Node 2 */}
              <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getStepActive("PROCESSING") ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20" : "bg-zinc-800 text-zinc-500"}`}>
                  2
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${getStepActive("PROCESSING") ? "text-amber-400" : "text-zinc-500"}`}>Processing</span>
              </div>

              {/* Stepper Node 3 */}
              <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getStepActive("SHIPPED") ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20" : "bg-zinc-800 text-zinc-500"}`}>
                  3
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${getStepActive("SHIPPED") ? "text-amber-400" : "text-zinc-500"}`}>Shipped</span>
              </div>

              {/* Stepper Node 4 */}
              <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getStepActive("DELIVERED") ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20" : "bg-zinc-800 text-zinc-500"}`}>
                  4
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${getStepActive("DELIVERED") ? "text-amber-400" : "text-zinc-500"}`}>Delivered</span>
              </div>

            </div>
          </div>
        )}

        {/* 2. Order items details list */}
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-6 space-y-4 print:border-zinc-300">
          <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-4 print:text-zinc-700">Purchased Garments</h3>
          
          <div className="divide-y divide-zinc-900 print:divide-zinc-300">
            {order.items?.map((item: any) => {
              const primaryImg = item.product.images?.find((i: any) => i.isPrimary)?.url || item.product.images?.[0]?.url;
              return (
                <div key={item.id} className="flex items-center justify-between py-4 gap-4">
                  
                  {/* Photo & description */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-16 rounded-md overflow-hidden bg-zinc-900 flex-shrink-0 print:border print:border-zinc-300">
                      {primaryImg && <img src={primaryImg} alt="product" className="object-cover w-full h-full" />}
                    </div>
                    <div>
                      <span className="font-serif text-sm font-bold text-zinc-200 print:text-black block">{item.product.name}</span>
                      <span className="text-[10px] text-zinc-500 font-light block">
                        Size: {item.size} &bull; Color: {item.color}
                      </span>
                    </div>
                  </div>

                  {/* Qty & Price subtotal */}
                  <div className="text-right">
                    <span className="text-xs text-zinc-450 block print:text-zinc-650">Qty {item.quantity} &bull; ${item.price.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-zinc-200 print:text-black block">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pricing breakdowns subtotal */}
          <div className="border-t border-zinc-900 pt-4 flex flex-col items-end gap-2 text-xs text-zinc-400 print:border-zinc-300 print:text-zinc-700">
            {order.coupon && (
              <div className="flex justify-between w-48 text-green-450">
                <span>Coupon Applied ({order.coupon.code})</span>
                <span>
                  {order.coupon.discountType === "PERCENT"
                    ? `-${order.coupon.discountValue}%`
                    : `-$${order.coupon.discountValue.toFixed(2)}`}
                </span>
              </div>
            )}
            <div className="flex justify-between w-48 text-zinc-500 print:text-zinc-650">
              <span>Shipping Fee</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between w-48 font-serif text-sm font-bold text-white pt-2 border-t border-zinc-900 print:text-black print:border-zinc-300">
              <span>Paid Total</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 3. Address details columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 space-y-3 print:border-zinc-300">
            <div className="flex items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider gap-1.5 print:text-zinc-750">
              <MapPin className="w-3.5 h-3.5" />
              <span>Shipping Destination</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-light print:text-black">{order.shippingAddress}</p>
          </div>
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 space-y-3 print:border-zinc-300">
            <div className="flex items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider gap-1.5 print:text-zinc-750">
              <Clock className="w-3.5 h-3.5" />
              <span>Fulfilment Standard</span>
            </div>
            <p className="text-xs text-zinc-350 leading-relaxed font-light print:text-black">
              Complimentary Atelier Courier delivery (fully insured). Shipped within 24-48 business hours. Tracking notification is sent via email once processed.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
