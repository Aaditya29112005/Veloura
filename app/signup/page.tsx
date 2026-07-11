"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    const res = await signup(name, email, password);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Account created successfully!");
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl shadow-black/30">
      <h2 className="font-serif text-3xl font-semibold tracking-wide mb-2 text-center">Create Account</h2>
      <p className="text-zinc-500 text-xs text-center mb-8">
        Join Veloura to save items, track shipments, and check out securely.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
            placeholder="Jane Doe"
            required
          />
        </div>

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
            placeholder="Min. 6 characters"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-white text-black font-semibold text-sm py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-2 cursor-pointer"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <div className="mt-8 border-t border-zinc-800 pt-6 text-center">
        <p className="text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-amber-400 font-semibold hover:underline">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4">
      <Suspense fallback={<div className="text-zinc-400 text-sm">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
