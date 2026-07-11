"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Tag, Trash2, Calendar, CheckCircle, XCircle } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons?admin=true");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data || []);
      }
    } catch (err) {
      toast.error("Failed to load discount coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountType || !discountValue) {
      toast.error("Please fill in code, discount type, and value");
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderValue: parseFloat(minOrderValue) || 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
    };

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Coupon created successfully!");
        // Reset form
        setCode("");
        setDiscountValue("");
        setMinOrderValue("0");
        setMaxDiscount("");
        setExpiryDate("");
        setUsageLimit("");
        loadCoupons(); // reload
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create coupon");
      }
    } catch (err) {
      toast.error("An unexpected network error occurred");
    }
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-zinc-900 rounded w-1/3 animate-pulse" />
        <div className="h-96 bg-zinc-900 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* View Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wide uppercase text-white">Discount Coupons</h1>
        <p className="text-zinc-500 text-xs font-light mt-1">
          Create percentage or flat discount promotional coupons.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side (1): Create Coupon Form */}
        <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 h-fit space-y-6">
          <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Plus className="w-4 h-4 text-amber-500" />
            <span>Define Promo Code</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Coupon Code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3 text-xs text-white uppercase"
                placeholder="WELCOME10"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3 text-xs text-white cursor-pointer"
                >
                  <option value="PERCENT">PERCENT (%)</option>
                  <option value="FIXED">FIXED ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Value *</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3 text-xs text-white"
                  placeholder={discountType === "PERCENT" ? "10" : "50"}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Min. Purchase ($)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3 text-xs text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Max Cap ($)</label>
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3 text-xs text-white"
                  placeholder="Only for %"
                  disabled={discountType === "FIXED"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Usage Limit (total)</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 px-3 text-xs text-white"
                  placeholder="No limit"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-zinc-400 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black font-semibold text-xs py-3 rounded-lg hover:bg-zinc-200 transition-colors mt-4 cursor-pointer"
            >
              Generate Coupon
            </button>
          </form>
        </div>

        {/* Right Side (2): Coupons List Table */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-fit">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Promo Code</th>
                  <th className="py-4 px-6 font-semibold">Discount</th>
                  <th className="py-4 px-6 font-semibold">Min Subtotal</th>
                  <th className="py-4 px-6 font-semibold">Usage Count</th>
                  <th className="py-4 px-6 font-semibold">Active Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {coupons.map((c) => {
                  const hasExpired = c.expiryDate && new Date(c.expiryDate) < new Date();
                  const isCapMet = c.usageLimit && c.usageCount >= c.usageLimit;
                  const active = c.active && !hasExpired && !isCapMet;

                  return (
                    <tr key={c.id} className="text-zinc-300 hover:text-white transition-colors">
                      <td className="py-3 px-6 font-mono font-bold text-zinc-450 uppercase flex items-center">
                        <Tag className="w-3.5 h-3.5 mr-2 text-zinc-550" />
                        <span>{c.code}</span>
                      </td>
                      <td className="py-3 px-6 font-semibold">
                        {c.discountType === "PERCENT" ? `${c.discountValue}%` : `$${c.discountValue.toFixed(2)}`}
                      </td>
                      <td className="py-3 px-6 font-light">${c.minOrderValue.toFixed(2)}</td>
                      <td className="py-3 px-6 font-light">
                        {c.usageCount} / {c.usageLimit || "∞"}
                      </td>
                      <td className="py-3 px-6">
                        <span className={`flex items-center text-[10px] font-semibold gap-1 ${active ? "text-green-500" : "text-red-500"}`}>
                          {active ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>Disabled</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
