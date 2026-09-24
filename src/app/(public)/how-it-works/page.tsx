import React from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Video, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Select your coach and session format",
      body: "Choose Shreyash for foundational principles, tactics, and beginner confidence. Choose Tapeshnu (FIDE) for intermediate calculation, opening systems, and tournament games.",
    },
    {
      num: "02",
      title: "Reserve a convenient time slot",
      body: "Our live calendar automatically displays verified open times in IST (with timezone conversion). Select your slot and hold it instantly.",
    },
    {
      num: "03",
      title: "Pay securely in INR via Razorpay",
      body: "Complete checkout using UPI, Netbanking, or Debit/Credit cards. Diagnostic trial classes (₹0) confirm immediately without payment.",
    },
    {
      num: "04",
      title: "Join your 1:1 Google Meet classroom",
      body: "Your private meeting link is accessible right on your confirmation page, sent by email, and linked from your student portal. The classroom activates 10 minutes prior to class start.",
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
      <SectionHeader
        tag="Onboarding"
        title="How it works"
        description="A streamlined, distraction-free learning experience designed for immediate improvement."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {steps.map((st) => (
          <div
            key={st.num}
            className="p-8 border border-[#d6d5d0]/20 rounded-[8px] bg-[#1d1d1d] flex flex-col justify-between"
          >
            <div>
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#d6d5d0]/60 pb-3 border-b border-[#d6d5d0]/10 block mb-4">
                PHASE {st.num}
              </span>
              <h3 className="text-[22px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] mb-3">
                {st.title}
              </h3>
              <p className="text-[15px] leading-[1.6] text-[#d6d5d0]">
                {st.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 border border-[#d6d5d0]/20 rounded-[8px] bg-[#1d1d1d] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-[20px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] mb-1">
            Ready to schedule your first session?
          </h3>
          <p className="text-[14px] text-[#d6d5d0]">
            Bookings take less than two minutes on any device.
          </p>
        </div>
        <Button href="/book" variant="primary" size="lg">
          Book a class now
        </Button>
      </div>
    </div>
  );
}
