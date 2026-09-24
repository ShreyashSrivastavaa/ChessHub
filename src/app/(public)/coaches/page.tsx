import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { BRAND_CONFIG } from "@/config/brand";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export default async function CoachesIndexPage() {
  let coaches: any[] = [];

  try {
    coaches = await prisma.coach.findMany({
      where: { isActive: true },
      include: {
        credentials: { orderBy: { sortOrder: "asc" } },
        sessionTypes: { where: { isActive: true } },
      },
    });
  } catch (err) {
    console.error("Database query fallback on CoachesIndexPage:", err);
  }

  if (coaches.length === 0) {
    coaches = [
      {
        id: "coach-shreyash",
        slug: "shreyash",
        displayName: BRAND_CONFIG.coaches.shreyash.name,
        philosophy:
          "Every master was once a beginner who learned to see the board clearly. We start with how pieces coordinate and build confidence move by move without memorization overload.",
        credentials: [],
        sessionTypes: [],
      },
      {
        id: "coach-tapesh",
        slug: "tapesh",
        displayName: BRAND_CONFIG.coaches.tapesh.name,
        philosophy:
          "Chess at the competitive level is about concrete calculation, opening discipline, and exploiting dynamic imbalances. We analyze your real games to eliminate systemic inaccuracies.",
        credentials: [],
        sessionTypes: [],
      },
    ];
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
      <SectionHeader
        tag="Faculty"
        title="Meet your coaches"
        description="Two coaches with distinct pedagogical approaches. Choose the focus that fits your current level."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {coaches.map((coach) => {
          const isShreyash = coach.slug === "shreyash";
          const coachBrand = isShreyash
            ? BRAND_CONFIG.coaches.shreyash
            : BRAND_CONFIG.coaches.tapesh;

          return (
            <div
              key={coach.id}
              className="border border-[#d6d5d0]/20 rounded-[8px] p-6 md:p-8 bg-[#1d1d1d] flex flex-col justify-between"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 pb-4 border-b border-[#d6d5d0]/10">
                  <div className="w-[56px] h-[56px] rounded-[8px] bg-[#000000] border border-[#d6d5d0]/30 flex items-center justify-center font-[family-name:var(--font-mono)] text-[22px] text-[#ffffff]">
                    {coachBrand.avatarPlaceholderInitial}
                  </div>
                  <div>
                    <h2 className="text-[26px] font-[family-name:var(--font-heading)] font-light text-[#ffffff]">
                      {coach.displayName}
                    </h2>
                    <p className="text-[13px] font-[family-name:var(--font-mono)] text-[#d6d5d0]">
                      {coachBrand.headline}
                    </p>
                  </div>
                </div>

                <p className="text-[15px] leading-[1.6] text-[#d6d5d0]">
                  {coach.bio}
                </p>

                <div className="p-4 bg-[#000000] rounded-[8px] border border-[#d6d5d0]/20">
                  <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#d6d5d0]/70 block mb-2">
                    Core Specializations
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {coachBrand.focus.split(",").map((f) => (
                      <span
                        key={f}
                        className="px-3 py-1 rounded-[9999px] bg-[#1d1d1d] border border-[#d6d5d0]/20 text-[12px] font-[family-name:var(--font-mono)] text-[#d6d5d0]"
                      >
                        {f.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#d6d5d0]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href={`/coaches/${coach.slug}`}
                  className="text-[13px] font-[family-name:var(--font-body)] uppercase tracking-[0.04em] text-[#ffffff] hover-underline-animation"
                >
                  View full philosophy &rarr;
                </Link>

                <Button
                  href={`/book?coach=${coach.slug}`}
                  variant="primary"
                  size="sm"
                >
                  Book with {coach.displayName}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
