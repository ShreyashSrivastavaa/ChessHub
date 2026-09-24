import React from "react";
import { BRAND_CONFIG } from "@/config/brand";
import { POLICY_CONFIG } from "@/config/policy";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-16">
      <SectionHeader
        tag="Policy"
        title="Refund & Rescheduling Policy"
        description="DRAFT: have this reviewed before launch"
      />

      <div className="p-4 rounded-[16px] bg-[#e6e6e6]/60 border border-[#000000] text-[13px] font-[family-name:var(--font-mono)] mb-8">
        NOTE: DRAFT: have this reviewed before launch. Governs customer cancellations, rescheduling timelines, and refund eligibility.
      </div>

      <div className="prose text-[15px] leading-[1.7] text-[#323232] space-y-6">
        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
            1. Free Rescheduling Window
          </h2>
          <p>
            You may reschedule any 1:1 session to any open slot in your coach&apos;s calendar free of charge up to <strong>{POLICY_CONFIG.rescheduleNoticeHours} hours</strong> before the scheduled start time.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
            2. Cancellation & Refunds
          </h2>
          <p>
            Cancellations made more than <strong>{POLICY_CONFIG.cancelNoticeHours} hours</strong> prior to class start are eligible for a full refund or full class credit. Refunds are processed back to the original payment method (via Razorpay) within 5 to 7 business days.
          </p>
          <p className="mt-2">
            Cancellations requested within {POLICY_CONFIG.cancelNoticeHours} hours of class start are non-refundable as the coach&apos;s time has been specifically reserved.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
            3. Coach Cancellations & Emergencies
          </h2>
          <p>
            If a coach must cancel or reschedule a session due to illness or technical failure, you will be promptly notified and offered your choice of an immediate priority reschedule or a 100% refund.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
            4. How to Request a Refund
          </h2>
          <p>
            You can cancel directly from your student portal or write to us at{" "}
            <a href={`mailto:${BRAND_CONFIG.contactEmail}`} className="text-[#000000] underline font-normal">
              {BRAND_CONFIG.contactEmail}
            </a>{" "}
            with your booking reference (e.g. TR-0142).
          </p>
        </section>
      </div>
    </div>
  );
}
