"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BUSINESS_CONFIG } from "@/config/business";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle, Shield } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/admin");
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto p-8 rounded-3xl border border-[#2e2e36] bg-[#141418] shadow-2xl">
      <div className="text-center mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[18px] font-[family-name:var(--font-heading)] font-medium text-[#f5f3ef]"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#cfa859]" />
          <span>{BUSINESS_CONFIG.name}</span>
        </Link>
        <h1 className="text-[26px] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef] mt-4">
          Admin Portal Sign In
        </h1>
        <p className="text-[13px] text-[#a8a39a] mt-1">
          Manage bookings, calendar slots, and coaching availability
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="admin@chesshub.in"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />

        {error && (
          <div className="p-3 rounded-xl bg-[#b3261e]/15 border border-[#b3261e]/40 text-[#ff6b6b] text-[13px] flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
          className="mt-2 !bg-[#cfa859] hover:!bg-[#e0b86a] !text-[#0e0e10] !font-medium"
        >
          {loading ? "Signing in..." : "Sign In &rarr;"}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-[#2e2e36] text-center text-[12px] text-[#a8a39a]">
        Default credentials can be initialized with <code className="text-[#cfa859]">npm run admin:create</code>.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0e0e10] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-[13px] text-[#a8a39a]">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
