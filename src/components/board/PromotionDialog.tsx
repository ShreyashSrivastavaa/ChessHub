"use client";

import React, { useEffect } from "react";
import { PieceSymbol } from "chess.js";

interface PromotionDialogProps {
  color: "w" | "b";
  isOpen: boolean;
  onSelect: (piece: PieceSymbol) => void;
  onCancel: () => void;
}

const PIECES: { symbol: PieceSymbol; label: string; key: string }[] = [
  { symbol: "q", label: "Queen", key: "Q" },
  { symbol: "r", label: "Rook", key: "R" },
  { symbol: "b", label: "Bishop", key: "B" },
  { symbol: "n", label: "Knight", key: "N" },
];

export function PromotionDialog({ color, isOpen, onSelect, onCancel }: PromotionDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "q") onSelect("q");
      else if (k === "r") onSelect("r");
      else if (k === "b") onSelect("b");
      else if (k === "n") onSelect("n");
      else if (k === "escape") onCancel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onSelect, onCancel]);

  if (!isOpen) return null;

  // Unicode chess symbols for promotion pieces
  const symbols: Record<"w" | "b", Record<PieceSymbol, string>> = {
    w: { q: "♕", r: "♖", b: "♗", n: "♘", p: "♙", k: "♔" },
    b: { q: "♛", r: "♜", b: "♝", n: "♞", p: "♟", k: "♚" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-xs bg-[#1a1a1e] border border-[#2e2e36] rounded-xl p-5 shadow-2xl text-center">
        <h3 className="text-[16px] font-medium text-[#f5f3ef] mb-1 font-[family-name:var(--font-heading)]">
          Promote Pawn
        </h3>
        <p className="text-[12px] text-[#a8a39a] mb-4 font-mono">
          Choose a piece (press Q, R, B, N)
        </p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {PIECES.map(({ symbol, label, key }) => (
            <button
              key={symbol}
              onClick={() => onSelect(symbol)}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#222228] hover:bg-[#363640] border border-[#2e2e36] hover:border-[#cfa859] transition-all group"
              title={`${label} (${key})`}
            >
              <span className="text-3xl mb-1 text-[#f5f3ef] group-hover:scale-110 transition-transform">
                {symbols[color][symbol]}
              </span>
              <span className="text-[10px] font-mono text-[#a8a39a] group-hover:text-[#cfa859]">
                {key}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="text-[12px] text-[#a8a39a] hover:text-[#f5f3ef] transition-colors py-1 px-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
