import React from "react";
import Link from "next/link";
import { BUSINESS_CONFIG } from "@/config/business";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ShieldAlert, Mail, Phone } from "lucide-react";

export default function PricingPage() {
  const { plans } = BUSINESS_CONFIG;

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-20">
      <SectionHeader
        tag="Investment"
        title="Transparent Coaching Fees"
        description="Simple per-session rates with zero lock-in. All sessions are 1:1 online coaching on Google Meet."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-[1000px] mx-auto">
        {/* Beginner */}
        <div className="p-8 md:p-10 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] px-3 py-1 rounded-full bg-[#2e5a44]/30 text-[#4e8765] border border-[#2e5a44]/50">
                Beginner Level
              </span>
              <h2 className="text-[28px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mt-3">
                {plans.beginner.name}
              </h2>
              <p className="text-[14px] text-[#a8a39a] mt-1">{plans.beginner.audience}</p>
            </div>

            <div className="py-4 border-y border-[#2e2e36]">
              <div className="flex items-baseline gap-2">
                <span className="text-[42px] font-[family-name:var(--font-mono)] font-semibold text-[#f5f3ef]">
                  ₹{plans.beginner.priceRupees}
                </span>
                <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
                  per session ({plans.beginner.durationMinutes} min)
                </span>
              </div>
              <p className="text-[14px] text-[#dcd8d0] mt-2">{plans.beginner.description}</p>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#cfa859]">
                Covered in this level:
              </span>
              <ul className="flex flex-col gap-2 text-[14px] text-[#dcd8d0]">
                {plans.beginner.topics.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#4e8765] shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-[#2e2e36]">
            <Button
              href="/book?level=beginner"
              variant="primary"
              size="md"
              fullWidth
              className="!bg-[#f5f3ef] !text-[#0e0e10] hover:!bg-[#ffffff]"
            >
              Book Beginner Session →
            </Button>
          </div>
        </div>

        {/* Advanced */}
        <div className="p-8 md:p-10 rounded-2xl bg-[#141418] border-2 border-[#cfa859]/60 flex flex-col justify-between relative shadow-xl shadow-[#cfa859]/5">
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] px-3 py-1 rounded-full bg-[#cfa859]/20 text-[#cfa859] border border-[#cfa859]/40">
                Advanced Level
              </span>
              <h2 className="text-[28px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mt-3">
                {plans.advanced.name}
              </h2>
              <p className="text-[14px] text-[#a8a39a] mt-1">{plans.advanced.audience}</p>
            </div>

            <div className="py-4 border-y border-[#2e2e36]">
              <div className="flex items-baseline gap-2">
                <span className="text-[42px] font-[family-name:var(--font-mono)] font-semibold text-[#f5f3ef]">
                  ₹{plans.advanced.priceRupees}
                </span>
                <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
                  per session ({plans.advanced.durationMinutes} min)
                </span>
              </div>
              <p className="text-[14px] text-[#dcd8d0] mt-2">{plans.advanced.description}</p>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#cfa859]">
                Covered in this level:
              </span>
              <ul className="flex flex-col gap-2 text-[14px] text-[#dcd8d0]">
                {plans.advanced.topics.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#cfa859] shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-[#2e2e36]">
            <Button
              href="/book?level=advanced"
              variant="primary"
              size="md"
              fullWidth
              className="!bg-[#cfa859] !text-[#0e0e10] hover:!bg-[#e0b86a] !font-medium"
            >
              Book Advanced Session →
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Policy Notice */}
      <div className="max-w-[1000px] mx-auto mt-12 p-6 rounded-2xl bg-[#1a1a1e] border border-[#2e2e36] flex items-start gap-3">
        <ShieldAlert size={20} className="text-[#cfa859] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-[14px]">
          <span className="font-medium text-[#f5f3ef]">Direct Payment Notice</span>
          <p className="text-[#dcd8d0]">
            We do not collect online payments through cards, Razorpay, or automated checkouts. You reserve a slot first, and then reach out directly to Shreyash or Tapesnu to discuss payment details and confirm your scheduled class.
          </p>
        </div>
      </div>
    </div>
  );
}
