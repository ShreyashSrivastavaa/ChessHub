import React from "react";
import Link from "next/link";
import { BUSINESS_CONFIG } from "@/config/business";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Mail, Phone } from "lucide-react";

export default function AboutPage() {
  const { coaches } = BUSINESS_CONFIG;

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-20">
      <SectionHeader
        tag="Faculty & Philosophy"
        title="About ChessHub"
        description="Founded and coached by Shreyash and Tapesnu. We provide dedicated 1:1 online chess coaching focused on core understanding and competitive tactics."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {coaches.map((coach) => (
          <div
            key={coach.slug}
            className="flex flex-col p-8 md:p-10 rounded-2xl bg-[#141418] border border-[#2e2e36] justify-between"
          >
            <div className="flex flex-col gap-6">
              {/* Header with Avatar slot */}
              <div className="flex items-center gap-4 pb-6 border-b border-[#2e2e36]">
                <div className="w-16 h-16 rounded-xl bg-[#0e0e10] border border-[#cfa859]/40 flex items-center justify-center font-[family-name:var(--font-heading)] text-[26px] text-[#cfa859] shrink-0">
                  {coach.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-[26px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef]">
                    {coach.name}
                  </h2>
                  <p className="text-[13px] font-[family-name:var(--font-mono)] text-[#cfa859]">
                    {coach.roleTitle}
                  </p>
                </div>
              </div>

              {/* Factual Bio */}
              <p className="text-[15px] text-[#dcd8d0] leading-relaxed">
                {coach.bio}
              </p>

              {/* Optional Experience — Hidden if empty */}
              {coach.experience && (
                <div className="p-4 rounded-xl bg-[#1a1a1e] border border-[#2e2e36] text-[13px] text-[#a8a39a]">
                  <span className="text-[#f5f3ef] font-medium block mb-1">Chess Experience:</span>
                  <p>{coach.experience}</p>
                </div>
              )}

              {/* Teaching Specialties — Hidden if empty */}
              {coach.specialties && coach.specialties.length > 0 && (
                <div>
                  <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#cfa859] block mb-2.5">
                    Teaching Specialties:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1 rounded-full bg-[#1a1a1e] border border-[#2e2e36] text-[13px] text-[#dcd8d0]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 mt-8 border-t border-[#2e2e36]">
              <Button
                href={`/book?level=${coach.slug === "tapesnu" ? "advanced" : "beginner"}`}
                variant="primary"
                size="md"
                fullWidth
                className="!bg-[#cfa859] !text-[#0e0e10] hover:!bg-[#e0b86a] !font-medium"
              >
                Book with {coach.name}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Contact strip */}
      <div className="mt-16 p-8 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mb-1">
            Questions before starting?
          </h3>
          <p className="text-[14px] text-[#a8a39a]">
            You can reach out directly to Shreyash or Tapesnu anytime.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${BUSINESS_CONFIG.email}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#2e2e36] text-[13px] font-[family-name:var(--font-mono)] text-[#f5f3ef] hover:border-[#cfa859]"
          >
            <Mail size={14} className="text-[#cfa859]" />
            <span>{BUSINESS_CONFIG.email}</span>
          </a>
          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#2e2e36] text-[13px] font-[family-name:var(--font-mono)] text-[#f5f3ef] hover:border-[#cfa859]"
          >
            <Phone size={14} className="text-[#cfa859]" />
            <span>{BUSINESS_CONFIG.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
