"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PieceIcon } from "./PieceIcon";
import { Check } from "lucide-react";

export interface KnightPathProps {
  onComplete?: () => void;
  isConfirmation?: boolean;
}

export function KnightPath({ onComplete, isConfirmation = false }: KnightPathProps) {
  const shouldReduceMotion = useReducedMotion();
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setLanded(true);
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setLanded(true);
      if (onComplete) onComplete();
    }, 700);

    return () => clearTimeout(timer);
  }, [shouldReduceMotion, onComplete]);

  // A 3x3 mini board for the L-shaped knight hop: start at (2,0) -> move up 2 (0,0) -> move right 1 (0,1)
  const squareSize = 44; // px

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-[132px] h-[132px] border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff] select-none">
        {/* 3x3 grid */}
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => {
              const isDark = (r + c) % 2 === 1;
              const isTargetSquare = r === 0 && c === 1;
              const targetBg = isTargetSquare && landed ? "bg-[#e3fc03]" : isDark ? "bg-[#e6e6e6]" : "bg-[#ffffff]";

              return (
                <div
                  key={`${r}-${c}`}
                  className={`w-[44px] h-[44px] border-[0.5px] border-[#000000]/10 transition-colors duration-200 flex items-center justify-center ${targetBg}`}
                >
                  {isTargetSquare && landed && isConfirmation && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check size={20} strokeWidth={2} className="text-[#000000]" />
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Knight Glyph traversing L path */}
        {(!landed || !isConfirmation) && (
          <motion.div
            className="absolute top-0 left-0 flex items-center justify-center pointer-events-none"
            style={{ width: squareSize, height: squareSize }}
            initial={shouldReduceMotion ? { x: 44, y: 0 } : { x: 0, y: 88 }}
            animate={
              shouldReduceMotion
                ? { x: 44, y: 0 }
                : {
                    x: [0, 0, 44],
                    y: [88, 0, 0],
                  }
            }
            transition={{
              duration: 0.6,
              times: [0, 0.65, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <PieceIcon piece="knight" size={24} className="text-[#000000]" />
          </motion.div>
        )}
      </div>

      <p className="mt-3 text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#323232]">
        {landed && isConfirmation ? "Confirmed" : "Calculating slot..."}
      </p>
    </div>
  );
}
