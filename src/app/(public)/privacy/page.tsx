import React from "react";
import { BRAND_CONFIG } from "@/config/brand";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-16">
      <SectionHeader
        tag="Data Protection"
        title="Privacy Policy"
        description="DRAFT: have this reviewed before launch"
      />

      <div className="p-4 rounded-[16px] bg-[#e6e6e6]/60 border border-[#000000] text-[13px] font-[family-name:var(--font-mono)] mb-8">
        NOTE: DRAFT: have this reviewed before launch. Explains data collection, storage, and processing practices for {BRAND_CONFIG.name}.
      </div>

      <div className="prose text-[15px] leading-[1.7] text-[#323232] space-y-6">
        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
            1. Information We Collect
          </h2>
          <p>
            We collect the minimum information necessary to schedule and conduct live chess coaching sessions:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Account holder details: Name, email address, optional phone number.</li>
            <li>Student profile information: Learner display name, approximate age/birth year, chess level.</li>
            <li>Educational data: Lesson notes, tactical skill stage ratings, and assigned homework.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
            2. Payment Data
          </h2>
          <p>
            Payment transactions are processed directly by our RBI-licensed payment gateway partner, Razorpay. {BRAND_CONFIG.name} never receives, views, or stores your credit card numbers, CVVs, or bank credentials.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
            3. Use of Google Meet
          </h2>
          <p>
            Live video sessions utilize Google Meet. We do not record classes unless specifically requested by a student or guardian for educational review.
          </p>
        </section>

        <section>
          <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
            4. Data Retention and Contact
          </h2>
          <p>
            You may request complete deletion of your account and child learner profiles at any time by contacting us at {BRAND_CONFIG.contactEmail}.
          </p>
        </section>
      </div>
    </div>
  );
}
