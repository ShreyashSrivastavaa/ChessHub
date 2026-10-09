import React from "react";
import Link from "next/link";
import { BUSINESS_CONFIG } from "@/config/business";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function HowItWorksPage() {
  const steps = BUSINESS_CONFIG.howItWorksSteps;

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-20">
      <SectionHeader
        tag="Student Journey"
        title="How Chess Hub Works"
        description="A straightforward 4-step workflow to connect with our coaches and begin your 1:1 lessons."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {steps.map((st) => (
          <div
            key={st.stepNumber}
            className="p-8 border border-[#2e2e36] rounded-2xl bg-[#141418] flex flex-col justify-between"
          >
            <div>
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#cfa859] pb-3 border-b border-[#2e2e36] block mb-4">
                Step 0{st.stepNumber}
              </span>
              <h2 className="text-[22px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mb-3">
                {st.title}
              </h2>
              <p className="text-[15px] leading-[1.6] text-[#dcd8d0]">
                {st.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Policy Banner */}
      <div className="mt-8 p-6 rounded-2xl bg-[#1a1a1e] border border-[#2e2e36] flex items-start gap-3">
        <ShieldAlert size={20} className="text-[#cfa859] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-[14px]">
          <span className="font-medium text-[#f5f3ef]">Payment Policy</span>
          <p className="text-[#dcd8d0]">
            There is no online checkout or payment gateway on this website. Students contact Shreyash and Tapesnu directly via email (
            <a href={`mailto:${BUSINESS_CONFIG.email}`} className="text-[#cfa859] underline">
              {BUSINESS_CONFIG.email}
            </a>
            ) or phone/WhatsApp (
            <a href={`tel:${BUSINESS_CONFIG.phone}`} className="text-[#cfa859] underline">
              {BUSINESS_CONFIG.phoneDisplay}
            </a>
            ) with their booking reference to finalize payment and confirm their session.
          </p>
        </div>
      </div>

      <div className="mt-10 p-8 border border-[#2e2e36] rounded-2xl bg-[#141418] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mb-1">
            Ready to schedule your session?
          </h3>
          <p className="text-[14px] text-[#a8a39a]">
            Choose Beginner (₹500) or Advanced (₹800) and pick your time slot.
          </p>
        </div>
        <Button href="/book" variant="primary" size="lg" className="!bg-[#cfa859] !text-[#0e0e10] !font-medium">
          Book a Session
        </Button>
      </div>
    </div>
  );
}
