import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { BRAND_CONFIG } from "@/config/brand";
import { POLICY_CONFIG } from "@/config/policy";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Board } from "@/components/chess/Board";
import { PieceIcon } from "@/components/chess/PieceIcon";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Video, ShieldCheck, Clock, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const coaches = await prisma.coach.findMany({
    where: { isActive: true },
    include: {
      credentials: { orderBy: { sortOrder: "asc" } },
      sessionTypes: { where: { isActive: true } },
    },
  });

  const sessionTypes = await prisma.sessionType.findMany({
    where: { isActive: true },
    include: { coach: true },
    orderBy: { pricePaise: "asc" },
  });

  const skillAreas = await prisma.skillArea.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const foundationsSkills = skillAreas.filter((s) => s.track === "FOUNDATIONS");
  const improvementSkills = skillAreas.filter((s) => s.track === "IMPROVEMENT");

  // Real approved testimonials only - if none exist, hide section completely
  const testimonials = await prisma.testimonial.findMany({
    where: { isVisible: true, approvedAt: { not: null } },
  });

  const faqItems = [
    {
      question: "How do I join my live class?",
      answer:
        "Every session takes place 1:1 on Google Meet. You receive your secure Meet link on your booking confirmation page, via email, and directly on your student dashboard. The join button becomes active 10 minutes prior to class start.",
    },
    {
      question: "What equipment do I or my child need?",
      answer:
        "A laptop, tablet, or desktop computer with a working webcam, microphone, and stable internet. A physical chessboard is optional but helpful; your coach shares an interactive digital board on screen.",
    },
    {
      question: "What age range is the academy designed for?",
      answer:
        "We teach students from age 6 upward to adults. Shreyash specializes in absolute beginners, young children, and foundational mechanics. Tapesh works with intermediate and competitive tournament players.",
    },
    {
      question: "Can a parent book and manage classes for a child?",
      answer:
        "Yes. Parents create a guardian account and can add one or more student profiles. You receive all schedule updates, homework assignments, and coach notes directly in your portal.",
    },
    {
      question: "Which level or coach should I choose?",
      answer:
        "If you are new to chess, learning rules, or booking for a child, choose Foundations with Shreyash. If you already play games online or at a club and want tournament calculation and opening repertoires, choose Tapesh. You can also book a diagnostic assessment class.",
    },
    {
      question: "What is the cancellation and rescheduling policy?",
      answer: `You can reschedule or cancel any session free of charge up to ${POLICY_CONFIG.cancelNoticeHours} hours before start time directly from your dashboard. Inside ${POLICY_CONFIG.cancelNoticeHours} hours, the session is reserved and treated as delivered.`,
    },
    {
      question: "Are classes recorded?",
      answer:
        "Sessions are not recorded by default to ensure privacy and relaxed conversation. If you would like a session recorded for study review, simply ask your coach at the start of class.",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SECTION (Full-bleed Obsidian surface) */}
      <section className="w-full bg-[#000000] text-[#ffffff] pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[#1a1a1a]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2">
                <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] px-3 py-1 rounded-[50px] border border-[#ffffff]/20 text-[#ffffff]">
                  Live 1:1 Coaching
                </span>
                <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#e3fc03]">
                  • On Google Meet
                </span>
              </div>

              <h1 className="text-[44px] sm:text-[56px] lg:text-[72px] leading-[1.05] tracking-[-0.03em] font-[family-name:var(--font-heading)] font-normal text-[#ffffff]">
                Live chess coaching, <br />
                <span className="text-[#e3fc03]">one-on-one.</span>
              </h1>

              <p className="text-[18px] md:text-[20px] text-[#e6e6e6] leading-[1.5] max-w-[540px] font-[family-name:var(--font-body)]">
                {BRAND_CONFIG.heroSubcopy}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Button href="/book" variant="primary" size="lg" className="px-8">
                  Book a class
                </Button>
                <Link
                  href="/coaches"
                  className="inline-flex items-center justify-center text-[16px] text-[#ffffff] hover-underline-animation py-2"
                >
                  See who teaches what &rarr;
                </Link>
              </div>

              {/* Trust strip */}
              <div className="pt-6 border-t border-[#1a1a1a] flex flex-wrap items-center gap-4 text-[13px] font-[family-name:var(--font-mono)] text-[#e6e6e6]">
                {BRAND_CONFIG.trustSignals.map((signal, idx) => (
                  <span key={signal} className="flex items-center gap-2">
                    {idx > 0 && <span className="opacity-30">·</span>}
                    <span>{signal}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Cropped Monochrome Board Motif */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full max-w-[380px] p-2 bg-[#1a1a1a] rounded-[16px] border border-[#323232]">
                <Board
                  highlights={[
                    { row: 4, col: 4 }, // e4
                    { row: 2, col: 5 }, // Nf3
                  ]}
                  showCoordinates={true}
                  className="w-full"
                />
                <div className="mt-3 px-2 flex items-center justify-between text-[11px] font-[family-name:var(--font-mono)] text-[#e6e6e6]">
                  <span>1. e4 e5 2. Nf3 Nc6</span>
                  <span className="text-[#e3fc03]">Italian Game Setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "WHO IS THIS FOR?" ROUTER */}
      <section className="w-full py-16 md:py-24 max-w-[1280px] mx-auto px-4 md:px-8">
        <SectionHeader
          tag="Find Your Match"
          title="Who is this for?"
          description="We do not teach a one-size-fits-all curriculum. Pick your current situation to match directly with the right coach."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Beginner */}
          <Card hoverable className="flex flex-col justify-between h-[300px]">
            <div>
              <div className="w-[40px] h-[40px] rounded-[50px] border border-[#000000] flex items-center justify-center mb-4">
                <PieceIcon piece="pawn" size={20} />
              </div>
              <h3 className="text-[22px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
                New to chess, or your child is starting
              </h3>
              <p className="text-[14px] text-[#323232] leading-[1.5]">
                Learn rules, piece values, board vision, and checkmate patterns without confusion.
              </p>
            </div>
            <Button
              href="/book?level=BEGINNER&coach=shreyash"
              variant="secondary"
              size="md"
              fullWidth
            >
              Start with Shreyash
            </Button>
          </Card>

          {/* Card 2: Intermediate */}
          <Card hoverable className="flex flex-col justify-between h-[300px]">
            <div>
              <div className="w-[40px] h-[40px] rounded-[50px] border border-[#000000] flex items-center justify-center mb-4">
                <PieceIcon piece="knight" size={20} />
              </div>
              <h3 className="text-[22px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
                You play online and want to improve
              </h3>
              <p className="text-[14px] text-[#323232] leading-[1.5]">
                Positional understanding, deep calculation, dynamic tactics, and tournament preparation.
              </p>
            </div>
            <Button
              href="/book?level=INTERMEDIATE&coach=tapesh"
              variant="secondary"
              size="md"
              fullWidth
            >
              Train with Tapesh
            </Button>
          </Card>

          {/* Card 3: Diagnostic */}
          <Card hoverable className="flex flex-col justify-between h-[300px]">
            <div>
              <div className="w-[40px] h-[40px] rounded-[50px] border border-[#000000] flex items-center justify-center mb-4">
                <PieceIcon piece="rook" size={20} />
              </div>
              <h3 className="text-[22px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
                Not sure where you stand?
              </h3>
              <p className="text-[14px] text-[#323232] leading-[1.5]">
                Book a 30-minute diagnostic session. We evaluate your play and map out a concrete plan.
              </p>
            </div>
            <Button
              href="/book?type=trial"
              variant="primary"
              size="md"
              fullWidth
            >
              Book Assessment Class
            </Button>
          </Card>
        </div>
      </section>

      {/* 3. TWO COACHES SECTION */}
      <section className="w-full py-16 md:py-24 bg-[#fafafa] border-y border-[#000000]/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <SectionHeader
            tag="The Academy"
            title="Two dedicated coaches"
            description="One coach builds your foundational board intuition. The other refines your competitive edge."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coaches.map((coach) => {
              const isShreyash = coach.slug === "shreyash";
              const coachBrand = isShreyash
                ? BRAND_CONFIG.coaches.shreyash
                : BRAND_CONFIG.coaches.tapesh;

              return (
                <div
                  key={coach.id}
                  className="bg-[#ffffff] border border-[#000000] rounded-[16px] p-6 md:p-8 flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#000000]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-[48px] h-[48px] rounded-[16px] bg-[#e6e6e6] border border-[#000000] flex items-center justify-center font-[family-name:var(--font-mono)] text-[20px]">
                          {coachBrand.avatarPlaceholderInitial}
                        </div>
                        <div>
                          <h3 className="text-[24px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                            {coach.displayName}
                          </h3>
                          <p className="text-[13px] font-[family-name:var(--font-mono)] text-[#323232]">
                            {coachBrand.headline}
                          </p>
                        </div>
                      </div>

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

                    <p className="text-[15px] leading-[1.6] text-[#323232] font-[family-name:var(--font-body)]">
                      {coach.philosophy}
                    </p>

                    {/* What they teach tag list */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {coachBrand.focus.split(",").map((item) => (
                        <span
                          key={item}
                          className="px-2.5 py-1 rounded-[50px] bg-[#e6e6e6]/60 border border-[#000000]/10 text-[12px] font-[family-name:var(--font-mono)] text-[#000000]"
                        >
                          {item.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#000000]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Link
                      href={`/coaches/${coach.slug}`}
                      className="text-[13px] font-[family-name:var(--font-body)] uppercase tracking-[0.04em] text-[#000000] hover-underline-animation"
                    >
                      View full profile &rarr;
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
      </section>

      {/* 4. WHAT A CLASS LOOKS LIKE (4-Step Horizontal Sequence) */}
      <section className="w-full py-16 md:py-24 max-w-[1280px] mx-auto px-4 md:px-8">
        <SectionHeader
          tag="Process"
          title="What a class looks like"
          description="From first booking to live Google Meet room in under two minutes."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Choose Level",
              desc: "Select beginner, foundations, intermediate, or a diagnostic assessment.",
            },
            {
              step: "02",
              title: "Pick a Slot",
              desc: "Select a date and time in IST that suits your weekly schedule.",
            },
            {
              step: "03",
              title: "Pay in INR",
              desc: "Pay securely via Razorpay (UPI, cards, netbanking) with instant confirmation.",
            },
            {
              step: "04",
              title: "Join on Meet",
              desc: "Join your private Google Meet classroom. Screen-shared board, notes, and homework.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col justify-between h-[200px]"
            >
              <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#323232] border-b border-[#000000]/10 pb-2">
                STEP {item.step}
              </span>
              <div>
                <h4 className="text-[18px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-1">
                  {item.title}
                </h4>
                <p className="text-[13px] text-[#323232] leading-[1.5]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PRICING SNAPSHOT (PULLED FROM DB) */}
      <section className="w-full py-16 md:py-24 bg-[#fafafa] border-y border-[#000000]/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <SectionHeader
            tag="Transparent Rates"
            title="1:1 Coaching Plans"
            description="Transparent pricing in INR. All sessions include live instruction, personalized coach notes, and tailored homework."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessionTypes.slice(0, 3).map((st) => (
              <div
                key={st.id}
                className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col justify-between h-[320px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10">
                    <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                      {st.coach.displayName}
                    </span>
                    <Tag variant="outline" size="sm">
                      {st.durationMinutes} min
                    </Tag>
                  </div>

                  <h3 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mt-3 mb-2">
                    {st.name}
                  </h3>
                  <p className="text-[13px] text-[#323232] leading-[1.5]">
                    {st.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#000000]/10 flex items-center justify-between">
                  <div>
                    <span className="text-[24px] font-[family-name:var(--font-mono)] text-[#000000]">
                      {st.pricePaise === 0
                        ? "Free Trial"
                        : `₹${(st.pricePaise / 100).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <Button
                    href={`/book?type=${st.id}&coach=${st.coach.slug}`}
                    variant="primary"
                    size="sm"
                  >
                    Book Class
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="text-[14px] font-[family-name:var(--font-mono)] uppercase tracking-[0.04em] text-[#000000] hover-underline-animation"
            >
              View all class formats & policies &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 6. WHAT YOU WILL ACTUALLY WORK ON (SKILL AREAS) */}
      <section className="w-full py-16 md:py-24 max-w-[1280px] mx-auto px-4 md:px-8">
        <SectionHeader
          tag="Curriculum"
          title="What you will actually work on"
          description="Structured progression without gimmicks. Every topic maps directly to real board situations."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Foundations Track */}
          <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff]">
            <div className="flex items-center justify-between pb-4 border-b border-[#000000]/10 mb-4">
              <span className="text-[18px] font-[family-name:var(--font-heading)] text-[#000000]">
                Foundations Track (Shreyash)
              </span>
              <Tag variant="outline" size="sm">
                Beginner
              </Tag>
            </div>
            <div className="flex flex-wrap gap-2">
              {foundationsSkills.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-1.5 rounded-[50px] border border-[#000000] text-[13px] font-[family-name:var(--font-mono)] text-[#000000]"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Improvement Track */}
          <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff]">
            <div className="flex items-center justify-between pb-4 border-b border-[#000000]/10 mb-4">
              <span className="text-[18px] font-[family-name:var(--font-heading)] text-[#000000]">
                Improvement Track (Tapesh)
              </span>
              <Tag variant="lime" size="sm">
                Intermediate / FIDE
              </Tag>
            </div>
            <div className="flex flex-wrap gap-2">
              {improvementSkills.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-1.5 rounded-[50px] border border-[#000000] text-[13px] font-[family-name:var(--font-mono)] text-[#000000]"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. REAL TESTIMONIALS (ONLY RENDER IF APPROVED EXIST) */}
      {testimonials.length > 0 && (
        <section className="w-full py-16 md:py-24 bg-[#fafafa] border-y border-[#000000]/10">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <SectionHeader
              tag="Real Feedback"
              title="From our students and parents"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.id} className="flex flex-col justify-between">
                  <p className="text-[15px] leading-[1.6] text-[#323232] italic">
                    &ldquo;{t.body}&rdquo;
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#000000]/10 flex items-center justify-between text-[12px] font-[family-name:var(--font-mono)]">
                    <span className="text-[#000000]">{t.authorName}</span>
                    <span className="text-[#323232] uppercase">{t.relationship}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. FAQ ACCORDION */}
      <section className="w-full py-16 md:py-24 max-w-[800px] mx-auto px-4 md:px-8">
        <SectionHeader
          tag="Clarity"
          title="Frequently asked questions"
          description="Everything you need to know about joining, equipment, and scheduling."
        />
        <FaqAccordion items={faqItems} />
      </section>

      {/* 9. FINAL CTA BAND */}
      <section className="w-full py-16 md:py-20 bg-[#000000] text-[#ffffff] border-t border-[#1a1a1a]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 text-center flex flex-col items-center gap-6">
          <h2 className="text-[32px] md:text-[48px] font-[family-name:var(--font-heading)] font-normal text-[#ffffff]">
            One coach, one student, one board.
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#e6e6e6] max-w-[540px]">
            Book your first class in under 2 minutes. Shreyash builds your foundation, Tapesh sharpens your tournament play.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button href="/book" variant="primary" size="lg" className="px-8">
              Book a class
            </Button>
            <a
              href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#ffffff] font-[family-name:var(--font-mono)] hover:text-[#e3fc03]"
            >
              Questions? Chat on WhatsApp &rarr;
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
