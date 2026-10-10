"use client";

import React from "react";
import { EngineEval } from "@/lib/chess/uci";

interface EvalBarProps {
  evaluation: EngineEval | null;
  orientation: "white" | "black";
  isThinking?: boolean;
}

export const EvalBar = React.memo(function EvalBar({
  evaluation,
  orientation,
  isThinking,
}: EvalBarProps) {
  // Win chance is 0..100 for White
  const whitePercent = evaluation ? evaluation.winChance : 50;

  // If orientation is white, White is on bottom (height = whitePercent%).
  // If orientation is black, Black is on bottom, so White is on top.
  const displayPercent = orientation === "white" ? whitePercent : 100 - whitePercent;

  const scoreText = evaluation?.scoreText ?? "0.00";
  const isMate = evaluation?.mate !== undefined;

  return (
    <div
      className="relative flex flex-col justify-end w-7 sm:w-8 h-full rounded-md overflow-hidden bg-[#1a1a1e] border border-[#2e2e36] select-none shadow-inner"
      title={`Evaluation: ${scoreText} (White: ${Math.round(whitePercent)}%)`}
      aria-label={`Chess engine evaluation bar: ${scoreText}`}
    >
      {/* Top half (opponent or Black/White depending on orientation) */}
      <div
        className="w-full transition-all duration-300 ease-out bg-[#141418] relative"
        style={{ height: `${100 - displayPercent}%` }}
      >
        {/* Score indicator when favor is with the top side */}
        {displayPercent < 45 && (
          <span className="absolute top-1.5 left-0 right-0 text-center text-[10px] font-mono font-semibold text-[#f5f3ef]/80 tracking-tight">
            {scoreText}
          </span>
        )}
      </div>

      {/* Bottom half (player side) */}
      <div
        className="w-full transition-all duration-300 ease-out bg-[#f5f3ef] relative"
        style={{ height: `${displayPercent}%` }}
      >
        {/* Score indicator when favor is with the bottom side */}
        {displayPercent >= 45 && (
          <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-mono font-semibold text-[#0e0e10] tracking-tight">
            {scoreText}
          </span>
        )}
      </div>

      {/* Thinking pulse indicator */}
      {isThinking && (
        <div className="absolute top-0 inset-x-0 h-1 bg-[#cfa859] animate-pulse" />
      )}
    </div>
  );
});
