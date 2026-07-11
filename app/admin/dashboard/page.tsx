"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { DollarSign, Receipt, ShoppingBag, Users, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

// Load charts dynamically with SSR disabled to prevent hydration failures
const AdminCharts = dynamic(() => import("@/components/admin/AdminCharts"), {
  ssr: false,
  loading: () => <div className="h-72 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />,
});

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard metrics");
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load dashboard statistics");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-zinc-900 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900 rounded-2xl border border-zinc-850 animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-zinc-900 rounded-2xl border border-zinc-850 animate-pulse" />
      </div>
    );
  }

  const { summary, monthlyRevenue, salesByCategory, lowStockProducts } = stats || {
    summary: { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 },
    monthlyRevenue: [],
    salesByCategory: [],
    lowStockProducts: [],
  };

  return (
    <div className="space-y-10">
      
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wide uppercase text-white">Dashboard Overview</h1>
        <p className="text-zinc-500 text-xs font-light mt-1">
          Real-time metrics, analytics trends, and inventory warnings.
        </p>
      </div>

      {/* Stats Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Revenue */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">Total Revenue</span>
            <p className="text-2xl font-serif font-bold text-white">${summary.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">Total Orders</span>
            <p className="text-2xl font-serif font-bold text-white">{summary.totalOrders}</p>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-zinc-300">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Products */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">Catalog Items</span>
            <p className="text-2xl font-serif font-bold text-white">{summary.totalProducts}</p>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-zinc-300">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Customers */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">Active Shoppers</span>
            <p className="text-2xl font-serif font-bold text-white">{summary.totalUsers}</p>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-zinc-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Analytical Charts */}
      <AdminCharts monthlyRevenue={monthlyRevenue} salesByCategory={salesByCategory} />

      {/* Low Stock Warning Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
            <span>Inventory Alert (Low Stock)</span>
          </h3>
          <Link href="/admin/products" className="text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-white flex items-center space-x-1.5 transition-colors">
            <span>Manage Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            All garments currently have safe stock counts (&gt; 10 units).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 font-semibold">Garment Name</th>
                  <th className="py-3 font-semibold">Category</th>
                  <th className="py-3 font-semibold">Price</th>
                  <th className="py-3 font-semibold">Stock Level</th>
                  <th className="py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {lowStockProducts.map((p: any) => (
                  <tr key={p.id} className="text-zinc-300 hover:text-white transition-colors">
                    <td className="py-4.5 font-medium">{p.name}</td>
                    <td className="py-4.5 font-light">{p.category?.name}</td>
                    <td className="py-4.5 font-semibold">${p.price.toFixed(2)}</td>
                    <td className="py-4.5">
                      <span className={`font-bold px-2 py-0.5 rounded ${p.stock <= 0 ? "bg-red-950/30 text-red-500" : "bg-amber-950/20 text-amber-500"}`}>
                        {p.stock <= 0 ? "OUT OF STOCK" : `${p.stock} units left`}
                      </span>
                    </td>
                    <td className="py-4.5 text-right">
                      <Link href="/admin/products" className="text-amber-450 hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
