"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

export type SkillStageType = "INTRODUCED" | "DEVELOPING" | "RELIABLE" | "FLUENT";

export const STAGE_CONFIG: Record<
  SkillStageType,
  { label: string; level: number; description: string }
> = {
  INTRODUCED: { label: "Introduced", level: 1, description: "Concepts explained and demonstrated" },
  DEVELOPING: { label: "Developing", level: 2, description: "Practicing with coach guidance" },
  RELIABLE: { label: "Reliable", level: 3, description: "Applied correctly under moderate pressure" },
  FLUENT: { label: "Fluent", level: 4, description: "Instinctive mastery and rapid calculation" },
};

export interface SkillRankProps {
  name: string;
  stage: SkillStageType;
  comment?: string | null;
  className?: string;
}

export function SkillRank({ name, stage, comment, className = "" }: SkillRankProps) {
  const shouldReduceMotion = useReducedMotion();
  const currentLevel = STAGE_CONFIG[stage]?.level ?? 1;

  return (
    <div className={`py-3 border-b border-[#1d1d1d] last:border-b-0 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-[16px] text-[#ffffff] font-[family-name:var(--font-body)]">
          {name}
        </span>

        <div className="flex items-center gap-3">
          {/* 4-square rank */}
          <div className="flex items-center gap-1.5" aria-label={`Skill stage: ${STAGE_CONFIG[stage]?.label} (level ${currentLevel} of 4)`}>
            {[1, 2, 3, 4].map((step) => {
              const isFilled = step <= currentLevel;
              const isCurrent = step === currentLevel;

              return (
                <motion.div
                  key={step}
                  initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
                  whileInView={shouldReduceMotion ? {} : { scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (step - 1) * 0.06, duration: 0.2 }}
                  className={`w-[14px] h-[14px] border border-[#d6d5d0]/50 transition-colors duration-150 ${
                    isCurrent
                      ? "bg-[#ffffff]"
                      : isFilled
                      ? "bg-[#d6d5d0]/60"
                      : "bg-[#1d1d1d]"
                  }`}
                />
              );
            })}
          </div>

          <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#d6d5d0] min-w-[90px] text-right">
            {STAGE_CONFIG[stage]?.label}
          </span>
        </div>
      </div>

      {comment && (
        <p className="mt-1 text-[13px] text-[#d6d5d0]/70 italic">
          &ldquo;{comment}&rdquo;
        </p>
      )}
    </div>
  );
}
