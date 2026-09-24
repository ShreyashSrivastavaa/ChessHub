"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BRAND_CONFIG } from "@/config/brand";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Direct call or simulated without account enumeration
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px] mx-auto p-6 md:p-8 border border-[#000000] rounded-[16px] bg-[#ffffff]">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="text-[18px] font-[family-name:var(--font-heading)] uppercase tracking-[0.06em] text-[#000000]"
          >
            {BRAND_CONFIG.name}
          </Link>
          <h1 className="text-[26px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mt-3">
            Reset Password
          </h1>
          <p className="text-[13px] text-[#323232] font-[family-name:var(--font-mono)] mt-1">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center py-6 gap-3">
            <CheckCircle2 size={32} strokeWidth={1.5} className="text-[#000000]" />
            <h3 className="text-[18px] font-[family-name:var(--font-heading)] text-[#000000]">
              Check your inbox
            </h3>
            <p className="text-[13px] text-[#323232]">
              If an account exists with {email}, we have sent a secure password reset link.
            </p>
            <Button href="/login" variant="secondary" size="sm" className="mt-2">
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={loading}
              className="mt-2"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center mt-2">
              <Link
                href="/login"
                className="text-[13px] text-[#323232] hover-underline-animation"
              >
                &larr; Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
