"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Successfully logged in");
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl shadow-black/30">
      <h2 className="font-serif text-3xl font-semibold tracking-wide mb-2 text-center">Welcome Back</h2>
      <p className="text-zinc-500 text-xs text-center mb-8">
        Access your order history and manage your wardrobe collection.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
            placeholder="name@domain.com"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-white text-black font-semibold text-sm py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-2 cursor-pointer"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 border-t border-zinc-800 pt-6 text-center">
        <p className="text-xs text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className="text-amber-400 font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 text-[10px] text-zinc-500 space-y-1">
        <p className="font-semibold text-zinc-400 uppercase tracking-widest">Demo Accounts</p>
        <p>👤 Customer: <span className="text-zinc-300">shopper@luxury.com</span> / <span className="text-zinc-300">password123</span></p>
        <p>🔑 Admin: <span className="text-zinc-300">admin@luxury.com</span> / <span className="text-zinc-300">admin123</span></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4">
      <Suspense fallback={<div className="text-zinc-400 text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
