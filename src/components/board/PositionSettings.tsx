"use client";

import React from "react";

interface PositionSettingsProps {
  turn: "w" | "b";
  onSetTurn: (turn: "w" | "b") => void;
  castlingRights: { K: boolean; Q: boolean; k: boolean; q: boolean };
  onSetCastlingRights: (rights: { K: boolean; Q: boolean; k: boolean; q: boolean }) => void;
  enPassant: string;
  onSetEnPassant: (ep: string) => void;
}

export function PositionSettings({
  turn,
  onSetTurn,
  castlingRights,
  onSetCastlingRights,
  enPassant,
  onSetEnPassant,
}: PositionSettingsProps) {
  return (
    <div className="p-3 rounded-xl bg-[#141416] border border-[#2e2e36] text-[#f5f3ef] space-y-3 font-mono text-[12px]">
      <div className="text-[11px] uppercase tracking-wider text-[#cfa859] font-medium">
        Position Rules & Game State
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Side to move */}
        <div>
          <span className="text-[#a8a39a] block mb-1 text-[11px]">Side to Move:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onSetTurn("w")}
              aria-label="Set active turn to White"
              aria-pressed={turn === "w"}
              className={`flex-1 py-1.5 rounded-lg text-center transition-colors font-medium cursor-pointer ${
                turn === "w"
                  ? "bg-[#cfa859] text-[#0e0e10] font-semibold shadow-xs"
                  : "bg-[#222228] text-[#dcd8d0] hover:bg-[#2a2a32]"
              }`}
            >
              White
            </button>
            <button
              type="button"
              onClick={() => onSetTurn("b")}
              aria-label="Set active turn to Black"
              aria-pressed={turn === "b"}
              className={`flex-1 py-1.5 rounded-lg text-center transition-colors font-medium cursor-pointer ${
                turn === "b"
                  ? "bg-[#cfa859] text-[#0e0e10] font-semibold shadow-xs"
                  : "bg-[#222228] text-[#dcd8d0] hover:bg-[#2a2a32]"
              }`}
            >
              Black
            </button>
          </div>
        </div>

        {/* En Passant Target Square */}
        <div>
          <span className="text-[#a8a39a] block mb-1 text-[11px]">En Passant Square (Optional):</span>
          <input
            type="text"
            value={enPassant}
            onChange={(e) => onSetEnPassant(e.target.value)}
            placeholder="e.g. e3, d6 or -"
            aria-label="En passant target square"
            maxLength={2}
            className="w-full bg-[#1a1a1e] border border-[#2e2e36] text-[#f5f3ef] rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-hidden focus:border-[#cfa859]"
          />
        </div>
      </div>

      {/* Castling rights */}
      <div className="pt-1">
        <span className="text-[#a8a39a] block mb-1.5 text-[11px]">Castling Rights:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <label className="flex items-center gap-1.5 p-1.5 rounded-md bg-[#1a1a1e] border border-[#2e2e36]/70 cursor-pointer text-[#dcd8d0] hover:border-[#cfa859]/50 transition-colors">
            <input
              type="checkbox"
              checked={castlingRights.K}
              onChange={(e) =>
                onSetCastlingRights({ ...castlingRights, K: e.target.checked })
              }
              aria-label="White King-side castling right (O-O)"
              className="accent-[#cfa859] cursor-pointer"
            />
            <span className="font-semibold text-[#f5f3ef]">White O-O (K)</span>
          </label>

          <label className="flex items-center gap-1.5 p-1.5 rounded-md bg-[#1a1a1e] border border-[#2e2e36]/70 cursor-pointer text-[#dcd8d0] hover:border-[#cfa859]/50 transition-colors">
            <input
              type="checkbox"
              checked={castlingRights.Q}
              onChange={(e) =>
                onSetCastlingRights({ ...castlingRights, Q: e.target.checked })
              }
              aria-label="White Queen-side castling right (O-O-O)"
              className="accent-[#cfa859] cursor-pointer"
            />
            <span className="font-semibold text-[#f5f3ef]">White O-O-O (Q)</span>
          </label>

          <label className="flex items-center gap-1.5 p-1.5 rounded-md bg-[#1a1a1e] border border-[#2e2e36]/70 cursor-pointer text-[#dcd8d0] hover:border-[#cfa859]/50 transition-colors">
            <input
              type="checkbox"
              checked={castlingRights.k}
              onChange={(e) =>
                onSetCastlingRights({ ...castlingRights, k: e.target.checked })
              }
              aria-label="Black King-side castling right (O-O)"
              className="accent-[#cfa859] cursor-pointer"
            />
            <span className="font-semibold text-[#f5f3ef]">Black O-O (k)</span>
          </label>

          <label className="flex items-center gap-1.5 p-1.5 rounded-md bg-[#1a1a1e] border border-[#2e2e36]/70 cursor-pointer text-[#dcd8d0] hover:border-[#cfa859]/50 transition-colors">
            <input
              type="checkbox"
              checked={castlingRights.q}
              onChange={(e) =>
                onSetCastlingRights({ ...castlingRights, q: e.target.checked })
              }
              aria-label="Black Queen-side castling right (O-O-O)"
              className="accent-[#cfa859] cursor-pointer"
            />
            <span className="font-semibold text-[#f5f3ef]">Black O-O-O (q)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
