import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BUSINESS_CONFIG } from "@/config/business";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const coach = BUSINESS_CONFIG.coaches.find((c) => c.slug === slug);
  if (!coach) return { title: "Coach Profile | ChessHub" };
  return {
    title: `${coach.name} — ChessHub Coach`,
    description: coach.bio,
  };
}

export default async function CoachProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const coach = BUSINESS_CONFIG.coaches.find((c) => c.slug === slug);

  if (!coach) {
    notFound();
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 md:py-20 text-[#f5f3ef]">
      <div className="p-8 md:p-12 border border-[#2e2e36] rounded-2xl bg-[#141418] mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#2e2e36]">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-xl bg-[#0e0e10] border border-[#cfa859]/40 flex items-center justify-center font-[family-name:var(--font-heading)] text-[32px] text-[#cfa859]">
              {coach.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-[32px] md:text-[40px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef]">
                {coach.name}
              </h1>
              <p className="text-[14px] font-[family-name:var(--font-mono)] text-[#cfa859] tracking-wide">
                {coach.roleTitle}
              </p>
            </div>
          </div>

          <Button
            href="/book"
            variant="primary"
            size="lg"
            className="w-full md:w-auto"
          >
            Book a Session
          </Button>
        </div>

        <div className="pt-8 flex flex-col gap-8">
          <div>
            <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mb-3">
              About Coach {coach.name}
            </h2>
            <p className="text-[16px] leading-relaxed text-[#dcd8d0]">
              {coach.bio}
            </p>
          </div>

          {coach.experience && (
            <div className="p-6 rounded-xl bg-[#1a1a1e] border border-[#2e2e36]">
              <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[#cfa859] block mb-2">
                Chess Experience
              </span>
              <p className="text-[15px] text-[#dcd8d0]">{coach.experience}</p>
            </div>
          )}

          {coach.specialties && coach.specialties.length > 0 && (
            <div>
              <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[#cfa859] block mb-3">
                Teaching Specialties
              </span>
              <div className="flex flex-wrap gap-2">
                {coach.specialties.map((specialty, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-[#1a1a1e] border border-[#2e2e36] text-[13px] text-[#dcd8d0] font-[family-name:var(--font-mono)]"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/coaches"
          className="text-[14px] font-[family-name:var(--font-mono)] text-[#a8a39a] hover:text-[#cfa859] underline underline-offset-4"
        >
          ← View All Coaches
        </Link>
      </div>
    </div>
  );
}
