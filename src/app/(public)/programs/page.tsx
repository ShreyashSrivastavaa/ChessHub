import React from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export default function ProgramsPage() {
  const levels = [
    {
      name: "Absolute Beginner",
      coach: "Coach Shreyash",
      coachSlug: "shreyash",
      target: "Children & newcomers who are brand new to chess.",
      covers: [
        "How pieces move and capture",
        "Pawn promotion, castling & en passant",
        "Check, checkmate and stalemate distinctions",
        "Basic board geometry (ranks, files, diagonals)",
        "The golden rules of the opening (develop & castle)",
      ],
      duration: "30-50 minutes",
      goal: "Play full games independently without illegal moves or early piece giveaways.",
    },
    {
      name: "Foundations",
      coach: "Coach Shreyash",
      coachSlug: "shreyash",
      target: "Learners who know rules and want real structure and tactical vision.",
      covers: [
        "Fundamental checkmating nets (Back-rank, Queen & Helper)",
        "Core tactical motifs: Forks, Pins, and Skewers",
        "Opening principles: Italian Game & Classical setups",
        "Basic King and Pawn endgames",
        "The blunder check: thinking before moving",
      ],
      duration: "50 minutes",
      goal: "Recognize winning tactical positions and convert material advantages safely.",
    },
    {
      name: "Intermediate Coaching",
      coach: "Coach Tapesh (FIDE)",
      coachSlug: "tapesh",
      target: "Casual and club players looking to cross rating thresholds (1000 - 1500+).",
      covers: [
        "Concrete calculation techniques and candidate moves",
        "Positional pawn structures and weak square exploitation",
        "Rook endgames and active defense",
        "Transition from opening to middlegame plans",
        "Systematic game review of your own online/club games",
      ],
      duration: "60 minutes",
      goal: "Eliminate repetitive tactical oversights and formulate strategic plans.",
    },
    {
      name: "Advanced & Tournament Prep",
      coach: "Coach Tapesh (FIDE)",
      coachSlug: "tapesh",
      target: "Tournament players, FIDE aspirants, and serious competitors.",
      covers: [
        "Tailored opening repertoires with deep plan comprehension",
        "Deep dynamic calculation and visualization under time pressure",
        "Complex minor piece and asymmetrical endgames",
        "Over-the-board psychological preparation and clock management",
        "Forensic analysis of tournament losses",
      ],
      duration: "60-75 minutes",
      goal: "Peak competitive performance and rating progression in classical tournaments.",
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
      <SectionHeader
        tag="Curriculum"
        title="Training Programs"
        description="Four structured development tiers. Each tier maps to a specific coach, learning outcome, and skill benchmarks."
      />

      <div className="flex flex-col gap-8 mt-8">
        {levels.map((lvl) => (
          <div
            key={lvl.name}
            className="p-6 md:p-8 border border-[#000000] rounded-[16px] bg-[#ffffff] grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            <div className="lg:col-span-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Tag variant="outline" size="sm">
                  {lvl.coach}
                </Tag>
              </div>
              <h3 className="text-[26px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                {lvl.name}
              </h3>
              <p className="text-[14px] text-[#323232] leading-[1.5]">
                {lvl.target}
              </p>
              <div className="mt-4 pt-4 border-t border-[#000000]/10 text-[13px] font-[family-name:var(--font-mono)] text-[#323232]">
                <p>Typical duration: {lvl.duration}</p>
                <p className="mt-1 text-[#000000]">Goal: {lvl.goal}</p>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col justify-between h-full gap-6">
              <div>
                <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block mb-3 font-normal">
                  What you will master:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[14px] text-[#000000] font-[family-name:var(--font-body)]">
                  {lvl.covers.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <span className="text-[#000000] mt-1">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#000000]/10">
                <Button
                  href={`/book?level=${lvl.name.split(" ")[0].toUpperCase()}&coach=${lvl.coachSlug}`}
                  variant="primary"
                  size="sm"
                >
                  Book {lvl.name}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
