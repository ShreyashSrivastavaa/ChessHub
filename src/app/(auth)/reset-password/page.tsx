"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { BRAND_CONFIG } from "@/config/brand";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reset failed";
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
          Set New Password
        </h1>
      </div>

      {success ? (
        <div className="flex flex-col items-center text-center py-6 gap-3">
          <CheckCircle2 size={32} strokeWidth={1.5} className="text-[#000000]" />
          <p className="text-[14px] text-[#323232]">
            Your password has been updated. You can now log in with your new credentials.
          </p>
          <Button href="/login" variant="primary" size="md" className="mt-2">
            Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimum 6 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Re-enter password"
          />

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
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-[13px]">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
