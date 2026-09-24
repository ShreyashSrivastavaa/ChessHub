import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { BRAND_CONFIG } from "@/config/brand";
import { getCoachSlots } from "@/server/services/bookingService";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Clock, ShieldCheck, Check } from "lucide-react";
import type { Metadata } from "next";

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
    (c) => !c.detail.includes("[PLACEHOLDER")
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
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Profile Header */}
      <div className="p-8 md:p-12 border border-[#000000] rounded-[16px] bg-[#ffffff] mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#000000]/10">
          <div className="flex items-center gap-5">
            <div className="w-[72px] h-[72px] rounded-[16px] bg-[#e6e6e6] border border-[#000000] flex items-center justify-center font-[family-name:var(--font-mono)] text-[28px]">
              {coachBrand.avatarPlaceholderInitial}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-[32px] md:text-[38px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                  {coach.displayName}
                </h1>
                {coachBrand.fideRated ? (
                  <Tag variant="lime" size="sm">
                    FIDE-rated
                  </Tag>
                ) : (
                  <Tag variant="outline" size="sm">
                    Foundations
                  </Tag>
                )}
              </div>
              <p className="text-[14px] font-[family-name:var(--font-mono)] text-[#323232]">
                {coachBrand.headline}
              </p>
            </div>
          </div>

          <Button
            href={`/book?coach=${coach.slug}`}
            variant="primary"
            size="lg"
            className="w-full md:w-auto"
          >
            Book a Class with {coach.displayName}
          </Button>
        </div>

        {/* Bio & Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
          <div className="md:col-span-8 flex flex-col gap-6">
            <div>
              <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
                Teaching Philosophy
              </h2>
              <p className="text-[16px] leading-[1.6] text-[#323232] font-[family-name:var(--font-body)]">
                {coach.philosophy}
              </p>
            </div>

            <div>
              <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
                What your first class looks like
              </h2>
              <p className="text-[15px] leading-[1.6] text-[#323232]">
                Your first class is an open conversation and live board exploration. We evaluate how you evaluate moves, spot recurring blindspots, and establish an actionable focus for subsequent sessions. No stressful tests or forced memorization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-[16px] bg-[#fafafa] border border-[#000000]/10">
                <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#000000] block mb-2 font-normal">
                  Ideal For:
                </span>
                <ul className="text-[13px] text-[#323232] space-y-1">
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

              <div className="p-4 rounded-[16px] bg-[#fafafa] border border-[#000000]/10">
                <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block mb-2 font-normal">
                  Not Suited For:
                </span>
                <ul className="text-[13px] text-[#323232] space-y-1">
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
              <Card>
                <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block pb-2 border-b border-[#000000]/10 mb-3">
                  Verified Background
                </span>
                <div className="flex flex-col gap-3">
                  {publicCredentials.map((c) => (
                    <div key={c.id}>
                      <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                        {c.label}
                      </span>
                      <span className="text-[14px] text-[#000000] font-[family-name:var(--font-body)]">
                        {c.detail}
                      </span>
                    </div>
                  ))}
                  {coach.fideRating && (
                    <div>
                      <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                        Official FIDE Rating
                      </span>
                      <span className="text-[14px] text-[#000000] font-[family-name:var(--font-mono)]">
                        {coach.fideRating}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Upcoming Open Slots Preview */}
            <Card>
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block pb-2 border-b border-[#000000]/10 mb-3">
                Upcoming Open Slots
              </span>

              {previewSlots.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {previewSlots.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-[50px] bg-[#fafafa] border border-[#000000]/10 text-[13px] font-[family-name:var(--font-mono)]"
                    >
                      <span className="text-[#323232]">{s.dateStr}</span>
                      <span className="text-[#000000] font-normal">{s.timeStr} IST</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#323232]">
                  Slots open rolling 30 days in advance.
                </p>
              )}

              <Button
                href={`/book?coach=${coach.slug}`}
                variant="primary"
                size="sm"
                fullWidth
                className="mt-4"
              >
                View all slots
              </Button>
            </Card>
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
          {coach.sessionTypes.map((st) => (
            <div
              key={st.id}
              className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col justify-between h-[280px]"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10">
                  <Tag variant="outline" size="sm">
                    {st.level}
                  </Tag>
                  <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#323232]">
                    {st.durationMinutes} min
                  </span>
                </div>
                <h3 className="text-[18px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mt-3 mb-2">
                  {st.name}
                </h3>
                <p className="text-[13px] text-[#323232] leading-[1.5]">
                  {st.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#000000]/10 flex items-center justify-between">
                <span className="text-[20px] font-[family-name:var(--font-mono)] text-[#000000]">
                  {st.pricePaise === 0
                    ? "Free Trial"
                    : `₹${(st.pricePaise / 100).toLocaleString("en-IN")}`}
                </span>
                <Button
                  href={`/book?coach=${coach.slug}&type=${st.id}`}
                  variant="primary"
                  size="sm"
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
