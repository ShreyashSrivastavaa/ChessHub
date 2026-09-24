import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { POLICY_CONFIG } from "@/config/policy";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ShieldCheck, Info } from "lucide-react";

export default async function PricingPage() {
  const sessionTypes = await prisma.sessionType.findMany({
    where: { isActive: true },
    include: { coach: true },
    orderBy: { pricePaise: "asc" },
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
      <SectionHeader
        tag="Investment"
        title="Transparent 1:1 Pricing"
        description="Pay per class with zero lock-in. Every session includes private Google Meet link, coach notes, and personalized homework."
      />

      {/* Pricing Table / Grid */}
      <div className="border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff] mt-8">
        <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-[#fafafa] border-b border-[#000000] text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
          <span className="col-span-4">Session Format</span>
          <span className="col-span-3">Coach</span>
          <span className="col-span-2">Duration</span>
          <span className="col-span-2">Fee (INR)</span>
          <span className="col-span-1 text-right">Action</span>
        </div>

        <div className="divide-y divide-[#000000]/10">
          {sessionTypes.map((st) => {
            const priceFormatted =
              st.pricePaise === 0
                ? "Free Assessment"
                : `₹${(st.pricePaise / 100).toLocaleString("en-IN")}`;

            return (
              <div
                key={st.id}
                className="p-5 flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center hover:bg-[#fafafa]/50 transition-colors"
              >
                <div className="md:col-span-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-[family-name:var(--font-heading)] text-[#000000]">
                      {st.name}
                    </span>
                    {st.isTrial && <Tag variant="lime" size="sm">Trial</Tag>}
                  </div>
                  <p className="text-[13px] text-[#323232] mt-0.5">
                    {st.description}
                  </p>
                </div>

                <div className="md:col-span-3 flex items-center gap-1.5 text-[14px] text-[#000000]">
                  <span>{st.coach.displayName}</span>
                  <span className="text-[#323232] text-[12px] font-[family-name:var(--font-mono)]">
                    ({st.level})
                  </span>
                </div>

                <div className="md:col-span-2 text-[13px] font-[family-name:var(--font-mono)] text-[#323232]">
                  {st.durationMinutes} minutes
                </div>

                <div className="md:col-span-2 text-[18px] font-[family-name:var(--font-mono)] text-[#000000]">
                  {priceFormatted}
                </div>

                <div className="md:col-span-1 w-full md:w-auto flex justify-end">
                  <Button
                    href={`/book?type=${st.id}&coach=${st.coach.slug}`}
                    variant="primary"
                    size="sm"
                    className="w-full md:w-auto"
                  >
                    Book
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Included with every session */}
      <div className="mt-8 p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] block mb-1">
            Google Meet Classroom
          </span>
          <p className="text-[13px] text-[#323232]">
            Interactive digital board with real-time arrow and highlight analysis.
          </p>
        </div>
        <div>
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] block mb-1">
            Personalized Notes
          </span>
          <p className="text-[13px] text-[#323232]">
            Your coach records specific concepts and blunder checks directly on your portal.
          </p>
        </div>
        <div>
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] block mb-1">
            Tactical Homework
          </span>
          <p className="text-[13px] text-[#323232]">
            Targeted puzzle positions and game tasks assigned between sessions.
          </p>
        </div>
      </div>

      {/* Policy Notes */}
      <div className="mt-6 flex flex-col gap-3 text-[13px] text-[#323232] font-[family-name:var(--font-body)]">
        <div className="flex items-start gap-2">
          <ShieldCheck size={16} strokeWidth={1.5} className="text-[#000000] shrink-0 mt-0.5" />
          <p>
            Payments are securely processed via Razorpay in INR. Supported methods include UPI (Google Pay, PhonePe, Paytm), credit/debit cards, and netbanking.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Info size={16} strokeWidth={1.5} className="text-[#000000] shrink-0 mt-0.5" />
          <p>
            Rescheduling and Cancellation: You may reschedule or cancel free of charge up to {POLICY_CONFIG.cancelNoticeHours} hours before class start. Inside {POLICY_CONFIG.cancelNoticeHours} hours, the session is treated as delivered. See our full{" "}
            <Link href="/refund-policy" className="text-[#000000] underline">
              Refund & Reschedule Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex items-start gap-2 text-[12px] text-[#323232]/80">
          <span>*</span>
          <p>{POLICY_CONFIG.gstNote}</p>
        </div>
      </div>
    </div>
  );
}
