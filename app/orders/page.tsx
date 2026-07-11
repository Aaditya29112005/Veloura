"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FileText, Clock, Box, Coins, Award, Gift, Calendar, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PremiumDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Premium loyalty states
  const [loyaltyCoins, setLoyaltyCoins] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [lastClaimed, setLastClaimed] = useState<string | null>(null);

  // Mystery Box Spinner states
  const [spinning, setSpinning] = useState(false);
  const [rewardResult, setRewardResult] = useState<string | null>(null);

  // Fetch session data
  const loadUserData = async () => {
    try {
      // Get user profile details
      const userRes = await fetch("/api/auth/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        setLoyaltyCoins(userData.user.loyaltyCoins || 0);
        setBadges(userData.user.badges || []);
        if (userData.user.lastDailyRewardClaimed) {
          setLastClaimed(new Date(userData.user.lastDailyRewardClaimed).toISOString().split("T")[0]);
        }
      }

      // Get orders
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        }
      }
    } catch (err) {
      console.error("Error loading account data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      router.push("/login?redirect=/orders");
    }
  }, [user]);

  // Inline Canvas Confetti Animation
  const triggerConfetti = () => {
    const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: any[] = [];
    const colors = ["#fbbf24", "#34d399", "#60a5fa", "#f87171", "#c084fc"];
    
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 18 - 4,
        size: Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.2,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      
      particles.forEach(p => {
        if (p.alpha > 0) {
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.alpha -= p.decay;
          
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          ctx.restore();
        }
      });

      if (active) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  // Daily Rewards Claim
  const claimDailyReward = async () => {
    try {
      const res = await fetch("/api/gamification/daily", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.claimed) {
        setLoyaltyCoins(data.newBalance);
        setBadges(data.badges || []);
        const todayStr = new Date().toISOString().split("T")[0];
        setLastClaimed(todayStr);
        toast.success(data.message);
        triggerConfetti();
      } else {
        toast.error(data.message || "Failed to claim reward");
      }
    } catch (err) {
      toast.error("Error claiming daily login coins");
    }
  };

  // Mystery Box spin
  const spinMysteryBox = async () => {
    if (loyaltyCoins < 100) {
      toast.error("Insufficient coins. 100 coins required to spin the Mystery Box!");
      return;
    }

    setSpinning(true);
    setRewardResult(null);

    // Dynamic rotation effect delay
    setTimeout(async () => {
      try {
        const res = await fetch("/api/gamification/mystery-box", { method: "POST" });
        const data = await res.json();

        if (res.ok && data.success) {
          setLoyaltyCoins(data.newBalance);
          setBadges(data.badges || []);
          setRewardResult(data.rewardName);
          toast.success(`Won: ${data.rewardName}`);
          triggerConfetti();
        } else {
          toast.error(data.message || "Failed to spin");
        }
      } catch (err) {
        toast.error("Error spinning the wheel");
      } finally {
        setSpinning(false);
      }
    }, 1800);
  };

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
          <p className="text-zinc-500 text-xs tracking-wider uppercase font-medium">Retrieving premium dashboard details...</p>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const claimedToday = lastClaimed === todayStr;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow relative">
      
      {/* Confetti Canvas */}
      <canvas id="confetti-canvas" className="pointer-events-none fixed inset-0 z-50 w-full h-full" />

      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide uppercase text-white">Premium Club Dashboard</h1>
          <p className="text-zinc-550 text-xs font-light mt-1">
            Access VIP reward tiers, spin the mystery wheel, check achievements, and track invoices.
          </p>
        </div>
        
        {/* Daily reward module */}
        <button
          onClick={claimDailyReward}
          disabled={claimedToday}
          className={`flex items-center space-x-2 text-xs font-semibold px-5 py-2.5 rounded-full transition-all border cursor-pointer ${
            claimedToday 
              ? "bg-zinc-900/50 border-zinc-800/80 text-zinc-500 cursor-not-allowed" 
              : "bg-white hover:bg-zinc-200 text-black border-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{claimedToday ? "Daily Reward Claimed" : "Claim +50 Daily Coins"}</span>
        </button>
      </div>

      {/* VIP Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Coins card */}
        <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-400/5 border border-amber-400/20 text-amber-450 rounded-full flex items-center justify-center">
            <Coins className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-550 uppercase tracking-wider block font-bold">Loyalty Coins</span>
            <span className="text-2xl font-serif text-white font-bold">{loyaltyCoins}</span>
          </div>
        </div>

        {/* Orders count card */}
        <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 bg-zinc-950 border border-zinc-850 text-zinc-350 rounded-full flex items-center justify-center">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-550 uppercase tracking-wider block font-bold">Total Orders</span>
            <span className="text-2xl font-serif text-white font-bold">{orders.length}</span>
          </div>
        </div>

        {/* Estimated Savings card */}
        <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-500/5 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-550 uppercase tracking-wider block font-bold">Savings (Redeemed)</span>
            <span className="text-2xl font-serif text-white font-bold">${(orders.filter(o => o.couponId).length * 15.0).toFixed(2)}</span>
          </div>
        </div>

        {/* Unlocked Badges count */}
        <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-550 uppercase tracking-wider block font-bold">VIP Badges</span>
            <span className="text-2xl font-serif text-white font-bold">{badges.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Grid: Mystery Box Spin (5/12) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden min-h-[350px]">
          <div className="space-y-2">
            <div className="text-[9px] uppercase tracking-widest text-zinc-550 font-bold flex items-center justify-center gap-1.5">
              <Gift className="w-3.5 h-3.5" />
              <span>Bespoke Mystery Wheel</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">Mystery Box Gachapon</h3>
            <p className="text-zinc-500 text-xs font-light max-w-xs leading-relaxed">
              Spend 100 coins to spin the wheel. Win flat $15-$50 coupons, free shipping vouchers, or jackpot coin refunds!
            </p>
          </div>

          {/* Spinner Mock Graphic */}
          <div className="my-6 relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-zinc-800 bg-zinc-900">
            <div 
              className={`absolute inset-1 rounded-full border-4 border-dashed border-amber-400/40 transition-transform ${
                spinning ? "animate-spin [animation-duration:0.2s]" : ""
              }`}
            />
            <Gift className={`w-8 h-8 text-amber-400 ${spinning ? "animate-bounce" : ""}`} />
          </div>

          {/* Reward announcement */}
          {rewardResult && (
            <div className="bg-amber-400/5 border border-amber-400/20 text-amber-400 text-xs px-4 py-2 rounded-2xl max-w-xs mb-3 font-semibold animate-fadeIn">
              🎁 Won: {rewardResult}
            </div>
          )}

          <button
            onClick={spinMysteryBox}
            disabled={spinning || loyaltyCoins < 100}
            className="w-full bg-white text-black font-semibold text-xs py-3 rounded-xl hover:bg-zinc-200 transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer"
          >
            {spinning ? "Spinning..." : "Spin Wheel (-100 Coins)"}
          </button>
        </div>

        {/* Right Grid: Achievements & Badges (7/12) */}
        <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">Gamification Badges</h3>
            <p className="text-[10px] text-zinc-500 font-light mt-0.5">Collect milestones during orders and styling queries</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { id: "Explorer", label: "Explorer", desc: "First query to AI Stylist", icon: "✨" },
              { id: "VIP Buyer", label: "VIP Buyer", desc: "Placed 3+ orders", icon: "💎" },
              { id: "Trendsetter", label: "Trendsetter", desc: "Spun the Mystery Box", icon: "🔥" },
              { id: "Collector", label: "Collector", desc: "Purchased 3 items at once", icon: "📦" }
            ].map((badge) => {
              const unlocked = badges.includes(badge.id);
              return (
                <div 
                  key={badge.id} 
                  className={`border rounded-2xl p-4 text-center space-y-2 transition-all ${
                    unlocked 
                      ? "border-amber-400/30 bg-amber-400/5 text-zinc-200" 
                      : "border-zinc-900 bg-zinc-950/20 text-zinc-650"
                  }`}
                >
                  <div className={`text-2xl mx-auto ${unlocked ? "" : "grayscale opacity-25"}`}>{badge.icon}</div>
                  <div>
                    <span className={`text-xs font-semibold block ${unlocked ? "text-zinc-200" : "text-zinc-550"}`}>{badge.label}</span>
                    <span className="text-[9px] text-zinc-550 font-light block leading-tight mt-1">{badge.desc}</span>
                  </div>
                  {unlocked && (
                    <span className="text-[8px] bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Unlocked</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div>
        <h2 className="font-serif text-xl font-bold uppercase tracking-wider mb-6 text-white">Recent Transactions</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/10 border border-dashed border-zinc-850 rounded-2xl space-y-4">
            <Box className="w-10 h-10 text-zinc-650 mx-auto" />
            <h2 className="font-serif text-base text-zinc-350">No orders recorded yet</h2>
            <Link href="/products" className="inline-flex items-center text-amber-400 hover:underline text-xs font-semibold">
              Browse the catalog <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
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
                    <div className="flex items-center text-[10px] text-zinc-550 font-light space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Placed on {dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">Total Amount</p>
                      <p className="text-base font-serif font-bold text-white">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">Items</p>
                      <p className="text-xs text-zinc-350">{order.items?.length || 0} pieces</p>
                    </div>
                  </div>

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

    </div>
  );
}
