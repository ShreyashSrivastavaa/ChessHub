import React from "react";
import { BRAND_CONFIG } from "@/config/brand";
import { POLICY_CONFIG } from "@/config/policy";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-16">
      <SectionHeader
        tag="Legal Agreement"
        title="Terms of Service"
        description="DRAFT: have this reviewed before launch"
      />

      <div className="p-4 rounded-[8px] bg-[#1d1d1d] border border-[#d6d5d0]/20 text-[13px] text-[#d6d5d0] font-[family-name:var(--font-mono)] mb-8">
        NOTE: DRAFT: have this reviewed before launch. This document establishes standard terms required for online educational services and payment gateway onboarding.
      </div>

      <div className="prose text-[15px] leading-[1.7] text-[#d6d5d0] space-y-6">
        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] mb-2">
            1. Overview & Service Scope
          </h2>
          <p>
            {BRAND_CONFIG.name} provides live, online 1:1 chess coaching delivered via Google Meet. Classes are taught by our designated coaches (Shreyash and Tapesnu).
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] mb-2">
            2. Bookings & Payments
          </h2>
          <p>
            All session fees are payable in Indian Rupees (INR) through our authorized payment partner, Razorpay. A booking is confirmed only upon successful receipt of payment or authorization of a free assessment class.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] mb-2">
            3. Rescheduling & Cancellations
          </h2>
          <p>
            You may reschedule or cancel any scheduled class free of charge up to {POLICY_CONFIG.cancelNoticeHours} hours before the class start time directly from your dashboard. Cancellations requested within {POLICY_CONFIG.cancelNoticeHours} hours of the class start time are non-refundable and will be treated as delivered.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] mb-2">
            4. Minor Students & Guardian Consent
          </h2>
          <p>
            Students under the age of 18 must be registered by a parent or legal guardian. The guardian agrees to supervise online participation and handle communications.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] mb-2">
            5. Intellectual Property & Conduct
          </h2>
          <p>
            All coaching notes, homework exercises, and proprietary curriculum material remain the intellectual property of {BRAND_CONFIG.name}. Students and coaches are expected to maintain courteous and respectful conduct at all times.
          </p>
        </section>
      </div>
    </div>
  );
}
