"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, TrendingUp, AlertTriangle, Users, Clock, ShoppingCart, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminPredictionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/predictions")
      .then(res => res.json())
      .then(d => {
        if (!d.error) {
          setData(d);
        }
      })
      .catch(err => console.error("Error loading intelligence data", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex-grow flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-xs tracking-wider uppercase font-medium">Loading predictive intelligence models...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex-grow text-center">
        <p className="text-red-400 text-xs uppercase tracking-wider font-bold">Unauthorized / Failed to load models</p>
      </div>
    );
  }

  // Format charts data
  const chartData = data.hourlyDistribution.map((count: number, hour: number) => ({
    hour: `${hour}:00`,
    orders: count
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-8">
      
      {/* Back button */}
      <Link href="/admin/dashboard" className="inline-flex items-center text-zinc-500 hover:text-white text-xs font-semibold group transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" /> Back to Admin Panel
      </Link>

      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide uppercase text-white">Predictive Intelligence Dashboard</h1>
          <p className="text-zinc-550 text-xs font-light mt-1">
            Analyze machine learning revenue forecasts, restock velocities, customer groups, and optimal promo timings.
          </p>
        </div>
        <div className="inline-flex items-center space-x-1.5 bg-amber-450/10 border border-amber-450/20 text-amber-450 text-[10px] tracking-widest uppercase font-bold px-3.5 py-2 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Calculations Active</span>
        </div>
      </div>

      {/* Key indicator predictions cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Revenue Forecast */}
        <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase tracking-wider font-bold">Revenue Prediction</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-serif text-white font-bold">${data.revenueForecast.predictedNextMonthRevenue.toFixed(2)}</p>
          <span className="text-[9px] text-zinc-600 block leading-tight font-light">
            Projected next month based on linear regression modeling ({data.revenueForecast.growthTrend} trend)
          </span>
        </div>

        {/* Low Stock Alerts Count */}
        <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase tracking-wider font-bold">Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-serif text-white font-bold">{data.lowStockAlerts.length} items</p>
          <span className="text-[9px] text-zinc-600 block leading-tight font-light">
            Garments with stock levels equal to or below 5 units
          </span>
        </div>

        {/* VIP Customer count */}
        <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase tracking-wider font-bold">VIP Segment</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-serif text-white font-bold">{data.customerSegments.vip} users</p>
          <span className="text-[9px] text-zinc-600 block leading-tight font-light">
            Customers with total order spend exceeding $300.00
          </span>
        </div>

        {/* Best Launch Hour */}
        <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase tracking-wider font-bold">Best Launch Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-serif text-white font-bold py-0.5">{data.bestLaunchHour}</p>
          <span className="text-[9px] text-zinc-600 block leading-tight font-light">
            Optimal time of day to publish discount promos (highest transactions)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Low Stock Smart Restock Suggestions (5/12) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Smart Restock Suggestions
            </h3>
            <p className="text-[10px] text-zinc-500 font-light mt-0.5">Automated reorder counts based on demand velocities</p>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {data.lowStockAlerts.length === 0 ? (
              <div className="py-20 text-center text-zinc-650 text-xs font-light border border-dashed border-zinc-900 rounded-2xl">
                All garments have healthy inventory levels.
              </div>
            ) : (
              data.lowStockAlerts.map((item: any) => (
                <div key={item.id} className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-200 truncate pr-4">{item.name}</span>
                    <span className="bg-red-400/10 border border-red-400/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold">Stock: {item.stock}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-zinc-550 font-light">{item.reason}</span>
                    <span className="text-amber-450 font-bold uppercase tracking-wider text-[10px]">Restock +{item.suggestedRestock} pcs</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Hourly Sales Distribution Graph (7/12) */}
        <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 space-y-6 flex flex-col">
          <div>
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">Optimal Sales Publication Timing</h3>
            <p className="text-[10px] text-zinc-500 font-light mt-0.5">Historical order volume frequency grouped by hour</p>
          </div>

          <div className="flex-grow min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <XAxis dataKey="hour" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "11px", color: "#fafafa" }}
                />
                <Bar dataKey="orders" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Click-to-Purchase Conversions Heatmap Grid (7/12) */}
        <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" /> Conversion Rate Heatmap
            </h3>
            <p className="text-[10px] text-zinc-500 font-light mt-0.5">Comparing details click views relative to actual transactions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400 font-light">
              <thead>
                <tr className="border-b border-zinc-900 pb-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  <th className="py-2">Garment Name</th>
                  <th className="py-2 text-center">Views</th>
                  <th className="py-2 text-center">Sales</th>
                  <th className="py-2 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {data.categoryHeatmap.map((item: any) => (
                  <tr key={item.id} className="hover:bg-zinc-900/20">
                    <td className="py-3 font-semibold text-zinc-350 truncate max-w-[150px]">{item.name}</td>
                    <td className="py-3 text-center font-mono">{item.clicks}</td>
                    <td className="py-3 text-center font-mono">{item.purchases}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.conversionRate > 20 
                          ? "bg-green-500/10 border-green-500/20 text-green-400" 
                          : item.conversionRate > 10 
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {item.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Groups Segments and Coupon Analytics (5/12) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Customer Segment Divisions
            </h3>
            <p className="text-[10px] text-zinc-500 font-light mt-0.5">Demographics grouping based on purchase histories</p>
          </div>

          <div className="space-y-4">
            {/* VIP Customers */}
            <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-3 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">💎 VIP Platinum</span>
                <span className="text-[10px] text-zinc-650 block">Spend &gt; $300</span>
              </div>
              <span className="font-serif text-sm font-bold text-white bg-indigo-500/5 border border-indigo-500/20 px-3 py-1 rounded-lg">
                {data.customerSegments.vip} users
              </span>
            </div>

            {/* Active Buyers */}
            <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-3 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">🛍️ Active Shoppers</span>
                <span className="text-[10px] text-zinc-650 block">Has placed 1-2 orders</span>
              </div>
              <span className="font-serif text-sm font-bold text-white bg-green-500/5 border border-green-500/20 px-3 py-1 rounded-lg">
                {data.customerSegments.active} users
              </span>
            </div>

            {/* Inactive Signups */}
            <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-3 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">💤 Inactive Signups</span>
                <span className="text-[10px] text-zinc-650 block">Registered, 0 orders</span>
              </div>
              <span className="font-serif text-sm font-bold text-white bg-red-500/5 border border-red-500/20 px-3 py-1 rounded-lg">
                {data.customerSegments.inactive} users
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
