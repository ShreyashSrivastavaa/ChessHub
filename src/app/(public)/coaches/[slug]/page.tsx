import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { BRAND_CONFIG } from "@/config/brand";
import { getCoachSlots } from "@/server/services/bookingService";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Metadata } from "next";

interface CredentialItem {
  id: string;
  label: string;
  detail: string;
  sortOrder?: number;
}

interface SessionTypeItem {
  id: string;
  name: string;
  description: string;
  level: string;
  durationMinutes: number;
  pricePaise: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const coach = await prisma.coach.findUnique({ where: { slug } });
  if (!coach) return { title: "Coach Profile" };
  return {
    title: `Coach ${coach.displayName} — 1:1 Chess Coaching`,
    description: coach.bio,
  };
}

export default async function CoachProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const coach = await prisma.coach.findUnique({
    where: { slug },
    include: {
      credentials: { orderBy: { sortOrder: "asc" } },
      sessionTypes: { where: { isActive: true } },
    },
  });

  if (!coach || !coach.isActive) {
    notFound();
  }

  const isShreyash = coach.slug === "shreyash";
  const coachBrand = isShreyash
    ? BRAND_CONFIG.coaches.shreyash
    : BRAND_CONFIG.coaches.tapesh;

  // Filter out raw placeholders on the public UI per prompt rules
  const publicCredentials = coach.credentials.filter(
    (c: CredentialItem) => !c.detail.includes("[PLACEHOLDER")
  );

  // Fetch preview of next available slots
  let previewSlots: { startsAt: Date; dateStr: string; timeStr: string }[] = [];
  const primarySessionType = coach.sessionTypes[0];
  if (primarySessionType) {
    try {
      const slots = await getCoachSlots(coach.slug, primarySessionType.id);
      previewSlots = slots.slice(0, 3);
    } catch {
      previewSlots = [];
    }
  }

  // Person JSON-LD (strictly for filled real data)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: coach.displayName,
    description: coach.bio,
    jobTitle: "Chess Coach",
    worksFor: {
      "@type": "Organization",
      name: BRAND_CONFIG.name,
      url: `https://${BRAND_CONFIG.domain}`,
    },
    ...(coach.fideRating ? { fideRating: coach.fideRating } : {}),
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-20 text-[#ffffff]">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Profile Header */}
      <div className="p-8 md:p-12 border border-[#d6d5d0]/20 rounded-[8px] bg-[#1d1d1d] mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#d6d5d0]/10">
          <div className="flex items-center gap-5">
            <div className="w-[72px] h-[72px] rounded-[6px] bg-[#222222] border border-[#d6d5d0]/30 flex items-center justify-center font-[family-name:var(--font-mono)] text-[28px] text-[#ffffff]">
              {coachBrand.avatarPlaceholderInitial}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[32px] md:text-[44px] font-[family-name:var(--font-heading)] font-light tracking-tight text-[#ffffff]">
                  {coach.displayName}
                </h1>
                {coachBrand.fideRated ? (
                  <Tag variant="outline" size="sm" className="border-[#d6d5d0]/40 text-[#ffffff] font-mono">
                    FIDE-RATED
                  </Tag>
                ) : (
                  <Tag variant="outline" size="sm" className="border-[#d6d5d0]/30 text-[#d6d5d0]/70 font-mono">
                    FOUNDATIONS
                  </Tag>
                )}
              </div>
              <p className="text-[14px] font-[family-name:var(--font-mono)] text-[#d6d5d0]/70 tracking-wide">
                {coachBrand.headline}
              </p>
            </div>
          </div>

          <Button
            href={`/book?coach=${coach.slug}`}
            variant="primary"
            size="lg"
            className="w-full md:w-auto bg-[#ffffff] text-[#000000] hover:bg-[#d6d5d0] font-medium"
          >
            Book with {coach.displayName}
          </Button>
        </div>

        {/* Bio & Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
          <div className="md:col-span-8 flex flex-col gap-8">
            <div>
              <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] mb-3">
                Teaching Philosophy
              </h2>
              <p className="text-[16px] leading-[1.7] text-[#d6d5d0]/80 font-[family-name:var(--font-body)]">
                {coach.philosophy}
              </p>
            </div>

            <div>
              <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] mb-3">
                What your first class looks like
              </h2>
              <p className="text-[15px] leading-[1.7] text-[#d6d5d0]/70">
                Your first class is an open conversation and live board exploration. We evaluate how you evaluate moves, spot recurring blindspots, and establish an actionable focus for subsequent sessions. No stressful tests or forced memorization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-[8px] bg-[#171717] border border-[#d6d5d0]/10">
                <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[#d6d5d0]/60 block mb-3 font-normal">
                  Ideal For:
                </span>
                <ul className="text-[13px] text-[#d6d5d0]/80 space-y-1.5 font-[family-name:var(--font-body)]">
                  {isShreyash ? (
                    <>
                      <li>• Absolute beginners & school children</li>
                      <li>• Learning opening safety and pawn structures</li>
                      <li>• Students wanting friendly, patient guidance</li>
                    </>
                  ) : (
                    <>
                      <li>• Club and tournament competitors</li>
                      <li>• Players stuck in rating plateaus (1200+)</li>
                      <li>• Deep opening repertoires & calculation training</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-5 rounded-[8px] bg-[#171717] border border-[#d6d5d0]/10">
                <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[#d6d5d0]/60 block mb-3 font-normal">
                  Not Suited For:
                </span>
                <ul className="text-[13px] text-[#d6d5d0]/60 space-y-1.5 font-[family-name:var(--font-body)]">
                  {isShreyash ? (
                    <>
                      <li>• Advanced master-level tournament prep</li>
                      <li>• Rote opening memorization without understanding</li>
                    </>
                  ) : (
                    <>
                      <li>• Students who do not know piece movement yet</li>
                      <li>• Players wanting passive lectures rather than active analysis</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Credentials & Next Available Slots */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Credentials Card */}
            {publicCredentials.length > 0 && (
              <div className="p-6 rounded-[8px] bg-[#171717] border border-[#d6d5d0]/15">
                <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-widest text-[#d6d5d0]/60 block pb-3 border-b border-[#d6d5d0]/10 mb-4">
                  Verified Background
                </span>
                <div className="flex flex-col gap-4">
                  {publicCredentials.map((c: CredentialItem) => (
                    <div key={c.id}>
                      <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#d6d5d0]/50 uppercase tracking-wider block">
                        {c.label}
                      </span>
                      <span className="text-[14px] text-[#ffffff] font-[family-name:var(--font-body)] mt-0.5 block">
                        {c.detail}
                      </span>
                    </div>
                  ))}
                  {coach.fideRating && (
                    <div>
                      <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#d6d5d0]/50 uppercase tracking-wider block">
                        Official FIDE Rating
                      </span>
                      <span className="text-[14px] text-[#ffffff] font-[family-name:var(--font-mono)] mt-0.5 block">
                        {coach.fideRating}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming Open Slots Preview */}
            <div className="p-6 rounded-[8px] bg-[#171717] border border-[#d6d5d0]/15">
              <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-widest text-[#d6d5d0]/60 block pb-3 border-b border-[#d6d5d0]/10 mb-4">
                Upcoming Open Slots
              </span>

              {previewSlots.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {previewSlots.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-[6px] bg-[#1d1d1d] border border-[#d6d5d0]/10 text-[13px] font-[family-name:var(--font-mono)]"
                    >
                      <span className="text-[#d6d5d0]/70">{s.dateStr}</span>
                      <span className="text-[#ffffff] font-medium">{s.timeStr} IST</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#d6d5d0]/60">
                  Slots open rolling 30 days in advance.
                </p>
              )}

              <Button
                href={`/book?coach=${coach.slug}`}
                variant="secondary"
                size="sm"
                fullWidth
                className="mt-4 border border-[#d6d5d0]/30 text-[#ffffff] hover:bg-[#ffffff] hover:text-[#000000]"
              >
                View all slots
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Session Formats for this Coach */}
      <div>
        <SectionHeader
          title={`Classes with ${coach.displayName}`}
          description="Select any format to reserve your slot directly on Google Meet."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coach.sessionTypes.map((st: SessionTypeItem) => (
            <div
              key={st.id}
              className="p-6 border border-[#d6d5d0]/20 rounded-[8px] bg-[#1d1d1d] flex flex-col justify-between h-[280px]"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#d6d5d0]/10">
                  <Tag variant="outline" size="sm" className="border-[#d6d5d0]/30 text-[#d6d5d0]/80 font-mono text-[11px]">
                    {st.level}
                  </Tag>
                  <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#d6d5d0]/60">
                    {st.durationMinutes} min
                  </span>
                </div>
                <h3 className="text-[18px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] mt-4 mb-2">
                  {st.name}
                </h3>
                <p className="text-[13px] text-[#d6d5d0]/70 leading-[1.6]">
                  {st.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#d6d5d0]/10 flex items-center justify-between">
                <span className="text-[20px] font-[family-name:var(--font-mono)] text-[#ffffff]">
                  {st.pricePaise === 0
                    ? "Free Trial"
                    : `₹${(st.pricePaise / 100).toLocaleString("en-IN")}`}
                </span>
                <Button
                  href={`/book?coach=${coach.slug}&type=${st.id}`}
                  variant="primary"
                  size="sm"
                  className="bg-[#ffffff] text-[#000000] hover:bg-[#d6d5d0]"
                >
                  Book
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
