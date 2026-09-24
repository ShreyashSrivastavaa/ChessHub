"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BRAND_CONFIG } from "@/config/brand";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AlertCircle } from "lucide-react";

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
      } else if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "COACH") {
        router.push("/coach");
      } else {
        router.push("/app");
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
    <div className="w-full max-w-[420px] mx-auto p-6 md:p-8 border border-[#000000] rounded-[16px] bg-[#ffffff]">
      <div className="text-center mb-6">
        <Link
          href="/"
          className="text-[18px] font-[family-name:var(--font-heading)] uppercase tracking-[0.06em] text-[#000000]"
        >
          {BRAND_CONFIG.name}
        </Link>
        <h1 className="text-[26px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mt-3">
          Sign In
        </h1>
        <p className="text-[13px] text-[#323232] font-[family-name:var(--font-mono)] mt-1">
          Access your classes, notes, and homework
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />

        <div className="flex flex-col gap-1">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232] hover-underline-animation"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[13px] text-[#B3261E]">
            <AlertCircle size={15} strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={loading}
          className="mt-2"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-[#000000]/10 text-center text-[13px] text-[#323232]">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="text-[#000000] font-normal underline">
          Create account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-[13px]">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
