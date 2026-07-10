"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FileText, ArrowRight, Clock, Box } from "lucide-react";

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "PROCESSING":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "SHIPPED":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "DELIVERED":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex-grow flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-xs tracking-wider uppercase font-medium">Retrieving invoice logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      
      <div className="border-b border-zinc-900 pb-8 mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-wide uppercase">Order History</h1>
        <p className="text-zinc-500 text-xs font-light mt-1">
          Review recent transactions, tracking details, and download invoices.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-zinc-850 rounded-2xl space-y-4">
          <Box className="w-10 h-10 text-zinc-650 mx-auto" />
          <h2 className="font-serif text-lg text-zinc-350">No Orders Recorded</h2>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto">
            You haven&apos;t placed any orders yet. Discover our premium jackets and sweaters.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center text-amber-400 hover:underline text-xs font-semibold"
            >
              Start Browsing <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <div
                key={order.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between border border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 rounded-2xl p-6 gap-6 transition-all"
              >
                {/* ID & Date */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs text-white font-bold uppercase tracking-wider">
                      Order ID: {order.id.slice(0, 8)}...
                    </span>
                    <span
                      className={`text-[9px] font-bold border rounded-full px-2.5 py-0.5 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center text-[10px] text-zinc-500 font-light space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Placed on {dateStr}</span>
                  </div>
                </div>

                {/* Amount and summary */}
                <div className="flex items-center space-x-8">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Amount</p>
                    <p className="text-base font-serif font-bold text-white">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Items</p>
                    <p className="text-xs text-zinc-350">{order.items?.length || 0} pieces</p>
                  </div>
                </div>

                {/* View Details Link */}
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center text-xs text-amber-400 hover:text-white font-bold uppercase tracking-wider border border-zinc-800 hover:border-zinc-650 rounded-xl px-4 py-2.5 transition-colors self-stretch md:self-auto justify-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span>View Details</span>
                </Link>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
