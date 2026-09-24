import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { BRAND_CONFIG } from "@/config/brand";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export default async function CoachesIndexPage() {
  const coaches = await prisma.coach.findMany({
    where: { isActive: true },
    include: {
      credentials: { orderBy: { sortOrder: "asc" } },
      sessionTypes: { where: { isActive: true } },
    },
  });

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
              className="border border-[#000000] rounded-[16px] p-6 md:p-8 bg-[#ffffff] flex flex-col justify-between"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 pb-4 border-b border-[#000000]/10">
                  <div className="w-[56px] h-[56px] rounded-[16px] bg-[#e6e6e6] border border-[#000000] flex items-center justify-center font-[family-name:var(--font-mono)] text-[22px]">
                    {coachBrand.avatarPlaceholderInitial}
                  </div>
                  <div>
                    <h2 className="text-[26px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                      {coach.displayName}
                    </h2>
                    <p className="text-[13px] font-[family-name:var(--font-mono)] text-[#323232]">
                      {coachBrand.headline}
                    </p>
                  </div>
                </div>

                <p className="text-[15px] leading-[1.6] text-[#323232]">
                  {coach.bio}
                </p>

                <div className="p-4 bg-[#fafafa] rounded-[16px] border border-[#000000]/10">
                  <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block mb-2">
                    Core Specializations
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {coachBrand.focus.split(",").map((f) => (
                      <span
                        key={f}
                        className="px-2.5 py-0.5 rounded-[50px] bg-[#ffffff] border border-[#000000] text-[12px] font-[family-name:var(--font-mono)]"
                      >
                        {f.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#000000]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href={`/coaches/${coach.slug}`}
                  className="text-[13px] font-[family-name:var(--font-body)] uppercase tracking-[0.04em] text-[#000000] hover-underline-animation"
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
