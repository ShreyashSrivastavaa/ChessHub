"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRAND_CONFIG } from "@/config/brand";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentLevel, setStudentLevel] = useState<"BEGINNER" | "FOUNDATIONS" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [guardianConsent, setGuardianConsent] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isMinor && !guardianConsent) {
      setError("Parent or guardian consent is required when booking for a minor.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || undefined,
          isMinor,
          studentName: studentName || name,
          studentLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[460px] mx-auto p-6 md:p-8 border border-[#000000] rounded-[16px] bg-[#ffffff]">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="text-[18px] font-[family-name:var(--font-heading)] uppercase tracking-[0.06em] text-[#000000]"
          >
            {BRAND_CONFIG.name}
          </Link>
          <h1 className="text-[26px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mt-3">
            Create Account
          </h1>
          <p className="text-[13px] text-[#323232] font-[family-name:var(--font-mono)] mt-1">
            Join the academy to track classes, homework & progress
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Your Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Meera Patel"
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimum 6 characters"
          />

          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 00000"
          />

          {/* Minor / Child toggle */}
          <div className="p-4 rounded-[16px] bg-[#fafafa] border border-[#000000]/10 flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isMinor}
                onChange={(e) => setIsMinor(e.target.checked)}
                className="w-4 h-4 accent-[#000000]"
              />
              <span className="text-[13px] font-[family-name:var(--font-body)] text-[#000000]">
                I am a parent or guardian registering for my child
              </span>
            </label>

            {isMinor && (
              <div className="flex flex-col gap-3 pt-2 border-t border-[#000000]/10">
                <Input
                  label="Child / Student Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required={isMinor}
                  placeholder="e.g. Arjun Patel"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] uppercase font-[family-name:var(--font-mono)] tracking-[0.04em] text-[#000000]">
                    Current Level
                  </label>
                  <select
                    value={studentLevel}
                    onChange={(e) => setStudentLevel(e.target.value as any)}
                    className="w-full h-[46px] px-[20px] bg-[#ffffff] text-[#000000] text-[15px] rounded-[50px] border border-[#000000] outline-none"
                  >
                    <option value="BEGINNER">Absolute Beginner (Shreyash)</option>
                    <option value="FOUNDATIONS">Foundations (Shreyash)</option>
                    <option value="INTERMEDIATE">Intermediate (Tapesh)</option>
                    <option value="ADVANCED">Advanced (Tapesh)</option>
                  </select>
                </div>

                <label className="flex items-start gap-2 cursor-pointer select-none text-[12px] text-[#323232] mt-1">
                  <input
                    type="checkbox"
                    checked={guardianConsent}
                    onChange={(e) => setGuardianConsent(e.target.checked)}
                    required={isMinor}
                    className="mt-0.5 w-4 h-4 accent-[#000000]"
                  />
                  <span>
                    I give explicit guardian consent for the minor student to attend live 1:1 online coaching sessions.
                  </span>
                </label>
              </div>
            )}
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
            {loading ? "Creating account..." : "Complete Registration"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#000000]/10 text-center text-[13px] text-[#323232]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#000000] font-normal underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
