"use client";

import React from "react";
import { PieceSymbol } from "chess.js";
import { SparePiece, defaultPieces } from "react-chessboard";
import { Trash2 } from "lucide-react";

export type PalettePiece = {
  type: PieceSymbol;
  color: "w" | "b";
} | null; // null = eraser tool

interface PiecePaletteProps {
  selectedPiece: PalettePiece;
  onSelectPiece: (piece: PalettePiece) => void;
  className?: string;
  isCompact?: boolean;
}

interface PieceItem {
  type: PieceSymbol;
  color: "w" | "b";
  pieceType: string;
  label: string;
}

const WHITE_PIECES: PieceItem[] = [
  { type: "k", color: "w", pieceType: "wK", label: "White King" },
  { type: "q", color: "w", pieceType: "wQ", label: "White Queen" },
  { type: "r", color: "w", pieceType: "wR", label: "White Rook" },
  { type: "b", color: "w", pieceType: "wB", label: "White Bishop" },
  { type: "n", color: "w", pieceType: "wN", label: "White Knight" },
  { type: "p", color: "w", pieceType: "wP", label: "White Pawn" },
];

const BLACK_PIECES: PieceItem[] = [
  { type: "k", color: "b", pieceType: "bK", label: "Black King" },
  { type: "q", color: "b", pieceType: "bQ", label: "Black Queen" },
  { type: "r", color: "b", pieceType: "bR", label: "Black Rook" },
  { type: "b", color: "b", pieceType: "bB", label: "Black Bishop" },
  { type: "n", color: "b", pieceType: "bN", label: "Black Knight" },
  { type: "p", color: "b", pieceType: "bP", label: "Black Pawn" },
];

export function PiecePalette({
  selectedPiece,
  onSelectPiece,
  className = "",
  isCompact = false,
}: PiecePaletteProps) {
  const isPieceSelected = (type: PieceSymbol, color: "w" | "b") => {
    return selectedPiece !== null && selectedPiece.type === type && selectedPiece.color === color;
  };

  const isEraserSelected = selectedPiece === null;

  return (
    <div
      className={`p-3 rounded-xl bg-[#141416] border border-[#2e2e36] text-[#f5f3ef] shadow-lg select-none ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#cfa859] font-medium">
            Piece Palette
          </span>
          <span className="text-[10px] text-[#a8a39a] font-mono hidden sm:inline">
            (Click to place repeatedly • Drag onto board)
          </span>
        </div>

        {/* Current tool indicator */}
        <div className="text-[11px] font-mono text-[#a8a39a] flex items-center gap-1.5">
          <span>Active:</span>
          {isEraserSelected ? (
            <span className="text-[#e74c3c] font-semibold flex items-center gap-1">
              <Trash2 size={11} /> Eraser
            </span>
          ) : (
            <span className="text-[#cfa859] font-semibold">
              {selectedPiece.color === "w" ? "White" : "Black"}{" "}
              {selectedPiece.type.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Pieces grid tray */}
      <div className="grid grid-cols-7 sm:grid-cols-13 gap-1.5 p-1.5 rounded-lg bg-[#1a1a1e] border border-[#2e2e36]/70">
        {/* White pieces */}
        {WHITE_PIECES.map((p) => {
          const selected = isPieceSelected(p.type, p.color);
          return (
            <button
              key={p.pieceType}
              type="button"
              onClick={() => onSelectPiece({ type: p.type, color: p.color })}
              aria-label={`${p.label}${selected ? " (Selected)" : ""}`}
              aria-pressed={selected}
              title={`${p.label} (Click to select for placing, or drag to square)`}
              className={`relative h-10 w-full rounded-md flex items-center justify-center p-1 transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-[#cfa859] cursor-pointer ${
                selected
                  ? "bg-[#cfa859]/25 border-2 border-[#cfa859] shadow-[0_0_12px_rgba(207,168,89,0.35)] scale-105"
                  : "bg-[#222228] hover:bg-[#2a2a32] border border-[#363640] hover:border-[#4a4a58]"
              }`}
            >
              <div className="w-8 h-8 pointer-events-auto">
                <SparePiece pieceType={p.pieceType} />
              </div>
            </button>
          );
        })}

        {/* Black pieces */}
        {BLACK_PIECES.map((p) => {
          const selected = isPieceSelected(p.type, p.color);
          return (
            <button
              key={p.pieceType}
              type="button"
              onClick={() => onSelectPiece({ type: p.type, color: p.color })}
              aria-label={`${p.label}${selected ? " (Selected)" : ""}`}
              aria-pressed={selected}
              title={`${p.label} (Click to select for placing, or drag to square)`}
              className={`relative h-10 w-full rounded-md flex items-center justify-center p-1 transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-[#cfa859] cursor-pointer ${
                selected
                  ? "bg-[#cfa859]/25 border-2 border-[#cfa859] shadow-[0_0_12px_rgba(207,168,89,0.35)] scale-105"
                  : "bg-[#222228] hover:bg-[#2a2a32] border border-[#363640] hover:border-[#4a4a58]"
              }`}
            >
              <div className="w-8 h-8 pointer-events-auto">
                <SparePiece pieceType={p.pieceType} />
              </div>
            </button>
          );
        })}

        {/* Eraser Tool */}
        <button
          type="button"
          onClick={() => onSelectPiece(null)}
          aria-label={`Eraser Tool (click square or piece to remove)${
            isEraserSelected ? " (Selected)" : ""
          }`}
          aria-pressed={isEraserSelected}
          title="Eraser (click square to delete piece, or drag piece off board)"
          className={`relative h-10 w-full rounded-md flex flex-col items-center justify-center transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-[#e74c3c] cursor-pointer ${
            isEraserSelected
              ? "bg-[#b3261e]/30 border-2 border-[#e74c3c] text-[#e74c3c] shadow-[0_0_12px_rgba(231,76,60,0.4)] scale-105"
              : "bg-[#222228] hover:bg-[#2a2a32] text-[#a8a39a] hover:text-[#e74c3c] border border-[#363640] hover:border-[#4a4a58]"
          }`}
        >
          <Trash2 size={16} />
          <span className="text-[9px] font-mono leading-none mt-0.5">Erase</span>
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#a8a39a] mt-2 px-0.5">
        <span>Tip: Drag piece off board or right-click / double-click to delete</span>
        <button
          type="button"
          onClick={() => onSelectPiece({ type: "p", color: "w" })}
          className="text-[#cfa859] hover:underline"
        >
          Reset Tool
        </button>
      </div>
    </div>
  );
}
