import React from "react";
import Link from "next/link";
import { BUSINESS_CONFIG } from "@/config/business";
import { Button } from "@/components/ui/Button";
import { Board } from "@/components/chess/Board";
import { PieceIcon } from "@/components/chess/PieceIcon";
import { Mail, Phone, Calendar, CheckCircle2, ArrowRight, ShieldAlert } from "lucide-react";

export default function HomePage() {
  const { plans, coaches, howItWorksSteps } = BUSINESS_CONFIG;

  return (
    <div className="flex flex-col w-full bg-[#0e0e10] text-[#f5f3ef]">
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden pt-16 pb-24 md:pt-28 md:pb-36 border-b border-[#2e2e36]">
        {/* Subtle chess board watermark grid */}
        <div className="absolute inset-0 chess-board-pattern opacity-40 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-[#cfa859]/30 bg-[#cfa859]/10 text-[12px] font-[family-name:var(--font-mono)] text-[#cfa859] w-fit">
                <span className="w-2 h-2 rounded-full bg-[#cfa859]" />
                <span>Online 1:1 Chess Coaching</span>
                <span className="text-[#a8a39a]">·</span>
                <span className="text-[#dcd8d0]">Shreyash & Tapesnu</span>
              </div>

              <h1 className="text-[44px] sm:text-[60px] lg:text-[76px] leading-[1.05] tracking-[-0.02em] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef]">
                {BUSINESS_CONFIG.tagline}
              </h1>

              <p className="text-[17px] md:text-[19px] text-[#dcd8d0] leading-[1.6] max-w-[620px] font-[family-name:var(--font-body)]">
                {BUSINESS_CONFIG.heroSubtext}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Button
                  href="/book"
                  variant="primary"
                  size="lg"
                  className="!bg-[#cfa859] hover:!bg-[#e0b86a] !text-[#0e0e10] !font-medium px-8 shadow-lg shadow-[#cfa859]/10"
                >
                  Book a Session
                </Button>
                <Button
                  href="#coaching"
                  variant="secondary"
                  size="lg"
                  className="border-[#2e2e36] text-[#f5f3ef] hover:border-[#cfa859] hover:text-[#cfa859] px-8"
                >
                  Explore Coaching &darr;
                </Button>
              </div>

              {/* Direct payment note */}
              <div className="pt-4 flex items-center gap-3 text-[13px] text-[#a8a39a] font-[family-name:var(--font-mono)]">
                <ShieldAlert size={15} className="text-[#cfa859] shrink-0" />
                <span>
                  No online payment gateway · Students contact coaches directly to confirm and pay
                </span>
              </div>
            </div>

            {/* Right Chess Visual */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[420px] p-4 rounded-2xl bg-[#141418] border border-[#2e2e36] shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e2e36] mb-3 text-[12px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
                  <span className="flex items-center gap-1.5 text-[#cfa859]">
                    <PieceIcon piece="knight" size={16} strokeWidth={2} />
                    Tactical Harmony
                  </span>
                  <span>1:1 Interactive Board</span>
                </div>
                <Board showCoordinates={true} className="w-full" />
                <div className="pt-3 mt-3 border-t border-[#2e2e36] flex items-center justify-between text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
                  <span>Beginner: ₹500/session</span>
                  <span className="text-[#cfa859]">·</span>
                  <span>Advanced: ₹800/session</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COACHING PLANS SECTION */}
      <section id="coaching" className="w-full py-20 md:py-28 border-b border-[#2e2e36] bg-[#141416]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-[680px] mx-auto mb-16 flex flex-col items-center gap-3">
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.12em] text-[#cfa859]">
              Tailored Programs
            </span>
            <h2 className="text-[36px] md:text-[46px] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef]">
              Coaching Plans
            </h2>
            <p className="text-[16px] text-[#dcd8d0] font-[family-name:var(--font-body)]">
              Straightforward per-session coaching with no hidden packages or lock-ins. Choose your level to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1100px] mx-auto">
            {/* Beginner Card */}
            <div className="flex flex-col justify-between p-8 md:p-10 rounded-2xl bg-[#1a1a1e] border border-[#2e2e36] hover:border-[#cfa859]/50 transition-all duration-200">
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] px-3 py-1 rounded-full bg-[#2e5a44]/30 text-[#4e8765] border border-[#2e5a44]/50">
                      Level 1
                    </span>
                    <h3 className="text-[28px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mt-3">
                      {plans.beginner.name}
                    </h3>
                    <p className="text-[14px] text-[#a8a39a] font-[family-name:var(--font-body)] mt-1">
                      {plans.beginner.audience}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#141418] border border-[#2e2e36] flex items-center justify-center text-[#cfa859]">
                    <PieceIcon piece="pawn" size={24} />
                  </div>
                </div>

                <div className="py-4 border-y border-[#2e2e36]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[40px] font-[family-name:var(--font-mono)] font-semibold text-[#f5f3ef]">
                      ₹{plans.beginner.priceRupees}
                    </span>
                    <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
                      per session ({plans.beginner.durationMinutes} min)
                    </span>
                  </div>
                  <p className="text-[14px] text-[#dcd8d0] mt-2">
                    {plans.beginner.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#cfa859]">
                    What you will cover:
                  </span>
                  <ul className="flex flex-col gap-2 text-[14px] text-[#dcd8d0]">
                    {plans.beginner.topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-[#4e8765] shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-[#2e2e36]">
                <Button
                  href="/book?level=beginner"
                  variant="primary"
                  size="md"
                  fullWidth
                  className="!bg-[#f5f3ef] !text-[#0e0e10] hover:!bg-[#ffffff]"
                >
                  Book This Session &rarr;
                </Button>
              </div>
            </div>

            {/* Advanced Card */}
            <div className="flex flex-col justify-between p-8 md:p-10 rounded-2xl bg-[#1a1a1e] border-2 border-[#cfa859]/60 hover:border-[#cfa859] transition-all duration-200 relative shadow-xl shadow-[#cfa859]/5">
              <div className="absolute -top-3 right-8 px-3 py-0.5 rounded-full bg-[#cfa859] text-[#0e0e10] text-[11px] font-[family-name:var(--font-mono)] uppercase font-semibold">
                Competitive Focus
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] px-3 py-1 rounded-full bg-[#cfa859]/20 text-[#cfa859] border border-[#cfa859]/40">
                      Level 2
                    </span>
                    <h3 className="text-[28px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mt-3">
                      {plans.advanced.name}
                    </h3>
                    <p className="text-[14px] text-[#a8a39a] font-[family-name:var(--font-body)] mt-1">
                      {plans.advanced.audience}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#141418] border border-[#2e2e36] flex items-center justify-center text-[#cfa859]">
                    <PieceIcon piece="knight" size={24} />
                  </div>
                </div>

                <div className="py-4 border-y border-[#2e2e36]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[40px] font-[family-name:var(--font-mono)] font-semibold text-[#f5f3ef]">
                      ₹{plans.advanced.priceRupees}
                    </span>
                    <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
                      per session ({plans.advanced.durationMinutes} min)
                    </span>
                  </div>
                  <p className="text-[14px] text-[#dcd8d0] mt-2">
                    {plans.advanced.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#cfa859]">
                    What you will cover:
                  </span>
                  <ul className="flex flex-col gap-2 text-[14px] text-[#dcd8d0]">
                    {plans.advanced.topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-[#cfa859] shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-[#2e2e36]">
                <Button
                  href="/book?level=advanced"
                  variant="primary"
                  size="md"
                  fullWidth
                  className="!bg-[#cfa859] !text-[#0e0e10] hover:!bg-[#e0b86a] !font-medium"
                >
                  Book This Session &rarr;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (4 STEPS) */}
      <section className="w-full py-20 md:py-28 border-b border-[#2e2e36]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-[680px] mx-auto mb-16 flex flex-col items-center gap-3">
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.12em] text-[#cfa859]">
              Clear Workflow
            </span>
            <h2 className="text-[36px] md:text-[46px] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef]">
              How It Works
            </h2>
            <p className="text-[16px] text-[#dcd8d0]">
              From booking your preferred slot to meeting your coach 1:1 online.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="flex flex-col p-6 rounded-2xl bg-[#141418] border border-[#2e2e36] relative"
              >
                <div className="w-10 h-10 rounded-full bg-[#cfa859]/10 border border-[#cfa859]/30 flex items-center justify-center font-[family-name:var(--font-mono)] text-[#cfa859] text-[15px] font-medium mb-4">
                  0{step.stepNumber}
                </div>
                <h3 className="text-[18px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mb-2">
                  {step.title}
                </h3>
                <p className="text-[14px] text-[#a8a39a] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              href="/book"
              variant="primary"
              size="lg"
              className="!bg-[#cfa859] hover:!bg-[#e0b86a] !text-[#0e0e10] !font-medium px-8"
            >
              Get Started with Step 1 &rarr;
            </Button>
          </div>
        </div>
      </section>

      {/* 4. MEET THE COACHES */}
      <section className="w-full py-20 md:py-28 border-b border-[#2e2e36] bg-[#141416]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-[680px] mx-auto mb-16 flex flex-col items-center gap-3">
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.12em] text-[#cfa859]">
              Instructors
            </span>
            <h2 className="text-[36px] md:text-[46px] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef]">
              Meet the Coaches
            </h2>
            <p className="text-[16px] text-[#dcd8d0]">
              Personalized guidance with dedicated instructors who care about your chess growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1100px] mx-auto">
            {coaches.map((coach) => (
              <div
                key={coach.slug}
                className="flex flex-col p-8 rounded-2xl bg-[#1a1a1e] border border-[#2e2e36]"
              >
                {/* Photo slot / Avatar */}
                <div className="flex items-center gap-4 pb-6 border-b border-[#2e2e36]">
                  <div className="w-16 h-16 rounded-xl bg-[#0e0e10] border border-[#cfa859]/40 flex items-center justify-center font-[family-name:var(--font-heading)] text-[26px] text-[#cfa859] shrink-0">
                    {coach.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[24px] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef]">
                      {coach.name}
                    </h3>
                    <p className="text-[13px] font-[family-name:var(--font-mono)] text-[#cfa859]">
                      {coach.roleTitle}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-[15px] text-[#dcd8d0] leading-relaxed pt-6">
                  {coach.bio}
                </p>

                {/* Optional experience - only render if present */}
                {coach.experience && (
                  <div className="mt-4 p-3 rounded-lg bg-[#141418] border border-[#2e2e36] text-[13px] text-[#a8a39a]">
                    <span className="text-[#f5f3ef] font-medium block mb-0.5">Experience:</span>
                    {coach.experience}
                  </div>
                )}

                {/* Specialties */}
                {coach.specialties && coach.specialties.length > 0 && (
                  <div className="pt-6 mt-6 border-t border-[#2e2e36]">
                    <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#a8a39a] block mb-3">
                      Teaching Specialties:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {coach.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-3 py-1 rounded-full bg-[#141418] border border-[#2e2e36] text-[12px] font-[family-name:var(--font-body)] text-[#dcd8d0]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 mt-auto">
                  <Button
                    href={`/book?level=${coach.slug === "tapesnu" ? "advanced" : "beginner"}`}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    className="border-[#2e2e36] text-[#f5f3ef] hover:border-[#cfa859]"
                  >
                    Book with {coach.name}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DIRECT CONTACT SECTION */}
      <section className="w-full py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="max-w-[800px] mx-auto p-8 md:p-12 rounded-3xl bg-[#141418] border border-[#2e2e36] text-center flex flex-col items-center gap-6">
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.12em] text-[#cfa859]">
              Questions & Inquiries
            </span>
            <h2 className="text-[32px] md:text-[42px] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef]">
              Speak Directly with the Coaches
            </h2>
            <p className="text-[15px] text-[#dcd8d0] max-w-[560px]">
              Have questions regarding student level, custom class schedules, or payment arrangements? Contact us directly.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <a
                href={`mailto:${BUSINESS_CONFIG.email}`}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1a1a1e] border border-[#2e2e36] hover:border-[#cfa859] text-[14px] font-[family-name:var(--font-mono)] text-[#f5f3ef] transition-colors"
              >
                <Mail size={16} className="text-[#cfa859]" />
                <span>{BUSINESS_CONFIG.email}</span>
              </a>
              <a
                href={`tel:${BUSINESS_CONFIG.phone}`}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1a1a1e] border border-[#2e2e36] hover:border-[#cfa859] text-[14px] font-[family-name:var(--font-mono)] text-[#f5f3ef] transition-colors"
              >
                <Phone size={16} className="text-[#cfa859]" />
                <span>{BUSINESS_CONFIG.phoneDisplay} ({BUSINESS_CONFIG.contactCoachName})</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
