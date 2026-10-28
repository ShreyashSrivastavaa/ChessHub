"use client";

import React, { useState } from "react";
import { PieceSymbol } from "chess.js";
import {
  Check,
  Play,
  Pencil,
  Copy,
  Download,
  Upload,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { PiecePalette, PalettePiece } from "./PiecePalette";
import { FenControls } from "./FenControls";
import { PositionSettings } from "./PositionSettings";

interface SetupPanelProps {
  currentFen: string;
  isSetupMode: boolean;
  onToggleSetupMode: (active: boolean) => void;
  selectedPalettePiece: PalettePiece;
  onSelectPalettePiece: (piece: PalettePiece) => void;
  onSetFen: (fen: string) => { ok: boolean; error?: string };
  onResetToStart: () => void;
  onClearBoard: () => void;
  onImportPgn: (pgn: string) => { ok: boolean; error?: string };
  onGetPgn: () => string;
  turn: "w" | "b";
  onSetTurn: (turn: "w" | "b") => void;
  castlingRights: { K: boolean; Q: boolean; k: boolean; q: boolean };
  onSetCastlingRights: (rights: { K: boolean; Q: boolean; k: boolean; q: boolean }) => void;
  enPassant?: string;
  onSetEnPassant?: (ep: string) => void;
  validationError: string | null;
  onStartAnalysis?: () => void;
}

export function SetupPanel({
  currentFen,
  isSetupMode,
  onToggleSetupMode,
  selectedPalettePiece,
  onSelectPalettePiece,
  onSetFen,
  onResetToStart,
  onClearBoard,
  onImportPgn,
  onGetPgn,
  turn,
  onSetTurn,
  castlingRights,
  onSetCastlingRights,
  enPassant = "-",
  onSetEnPassant = () => {},
  validationError,
  onStartAnalysis,
}: SetupPanelProps) {
  const [pgnInput, setPgnInput] = useState("");
  const [pgnError, setPgnError] = useState<string | null>(null);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"editor" | "pgn">("editor");

  const handleApplyPgn = () => {
    if (!pgnInput.trim()) return;
    const res = onImportPgn(pgnInput);
    if (!res.ok) {
      setPgnError(res.error || "Failed to load PGN");
    } else {
      setPgnError(null);
      setPgnInput("");
    }
  };

  const handleCopyPgn = () => {
    const pgn = onGetPgn();
    navigator.clipboard.writeText(pgn);
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const handleDownloadPgn = () => {
    const pgn = onGetPgn();
    const blob = new Blob([pgn], { type: "application/x-chess-pgn" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chesshub-study-${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = onImportPgn(content);
        if (!res.ok) {
          setPgnError(res.error || "Error reading PGN file");
        } else {
          setPgnError(null);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full bg-[#141416] border border-[#2e2e36] rounded-xl overflow-hidden divide-y divide-[#2e2e36]">
      {/* Top Editor Switch Header */}
      <div className="p-3.5 bg-[#1a1a1e] flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#f5f3ef] font-mono">
              Position Editor
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isSetupMode
                  ? "bg-[#cfa859]/20 text-[#cfa859] border border-[#cfa859]/40"
                  : "bg-[#222228] text-[#a8a39a]"
              }`}
            >
              {isSetupMode ? "Editing Active" : "Play & Analysis"}
            </span>
          </div>
          <div className="text-[11px] text-[#a8a39a] font-mono mt-0.5">
            {isSetupMode
              ? "Move legality bypassed • Engine paused"
              : "Standard moves & Stockfish engine active"}
          </div>
        </div>

        {/* Switch / Toggle Editor Mode button */}
        <div className="flex items-center gap-2">
          {isSetupMode ? (
            <button
              type="button"
              onClick={onStartAnalysis ? onStartAnalysis : () => onToggleSetupMode(false)}
              aria-label="Done editing and start analysis"
              className="px-3.5 py-1.5 rounded-lg bg-[#4e8765] hover:bg-[#3d6e52] text-white text-[12px] font-mono font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              title="Validate position and start game / engine analysis"
            >
              <Play size={13} fill="currentColor" />
              <span>Done & Analyze</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleSetupMode(true)}
              aria-label="Enter Editor Mode"
              className="px-3.5 py-1.5 rounded-lg bg-[#cfa859] hover:bg-[#e0b86a] text-[#0e0e10] text-[12px] font-mono font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              title="Switch to free-form board editor"
            >
              <Pencil size={13} />
              <span>Editor Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Validation Banner if Error */}
      {validationError && (
        <div className="p-3 bg-[#b3261e]/15 border-b border-[#b3261e]/30 flex items-start gap-2.5 text-[#f5f3ef] animate-fade-in">
          <AlertCircle size={16} className="text-[#e74c3c] shrink-0 mt-0.5" />
          <div className="text-[11px] font-mono leading-relaxed">
            <span className="font-bold text-[#e74c3c]">Position Not Ready: </span>
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* Sub-tab selection (Position Editor vs PGN Study) */}
      <div className="flex items-center px-3.5 py-2 bg-[#18181c] gap-2 border-b border-[#2e2e36] text-[11px] font-mono">
        <button
          type="button"
          onClick={() => setActiveSubTab("editor")}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activeSubTab === "editor"
              ? "bg-[#222228] text-[#cfa859] font-semibold border border-[#363640]"
              : "text-[#a8a39a] hover:text-[#f5f3ef]"
          }`}
        >
          Board Controls & FEN
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("pgn")}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activeSubTab === "pgn"
              ? "bg-[#222228] text-[#cfa859] font-semibold border border-[#363640]"
              : "text-[#a8a39a] hover:text-[#f5f3ef]"
          }`}
        >
          PGN Import / Export
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {activeSubTab === "editor" ? (
          <>
            {/* Piece Palette in Panel */}
            <PiecePalette
              selectedPiece={selectedPalettePiece}
              onSelectPiece={onSelectPalettePiece}
            />

            {/* FEN Management, Random Generator, Saved Positions */}
            <FenControls
              currentFen={currentFen}
              onSetFen={onSetFen}
              onResetToStart={onResetToStart}
              onClearBoard={onClearBoard}
              validationError={validationError}
            />

            {/* Turn & Castling Rights */}
            <PositionSettings
              turn={turn}
              onSetTurn={onSetTurn}
              castlingRights={castlingRights}
              onSetCastlingRights={onSetCastlingRights}
              enPassant={enPassant}
              onSetEnPassant={onSetEnPassant}
            />

            {/* Big Prominent Start Analysis Button in Editor Mode */}
            {isSetupMode && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onStartAnalysis ? onStartAnalysis : () => onToggleSetupMode(false)}
                  aria-label="Start Engine & Legal Move Analysis"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#cfa859] to-[#dfbb6d] hover:from-[#e0b86a] hover:to-[#ebc87c] text-[#0e0e10] font-mono font-bold text-[13px] shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Done / Start Analysis</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* PGN Import / Export Tab */
          <div className="space-y-3 font-mono text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-[#cfa859] font-semibold uppercase tracking-wider text-[11px]">
                PGN Game Notation
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyPgn}
                  aria-label="Copy PGN notation"
                  className="flex items-center gap-1 text-[11px] text-[#a8a39a] hover:text-[#cfa859] transition-colors cursor-pointer"
                >
                  {copiedPgn ? (
                    <Check size={12} className="text-[#4e8765]" />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copiedPgn ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPgn}
                  aria-label="Download PGN file"
                  className="flex items-center gap-1 text-[11px] text-[#a8a39a] hover:text-[#cfa859] transition-colors cursor-pointer"
                >
                  <Download size={12} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <textarea
              value={pgnInput}
              onChange={(e) => setPgnInput(e.target.value)}
              placeholder="Paste PGN text here to load a game or opening study..."
              rows={5}
              aria-label="PGN text input"
              className="w-full bg-[#1a1a1e] border border-[#2e2e36] text-[#f5f3ef] rounded-lg p-2.5 text-[11px] font-mono focus:outline-hidden focus:border-[#cfa859] resize-none"
            />

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222228] hover:bg-[#2e2e36] text-[#dcd8d0] text-[11px] font-mono cursor-pointer transition-colors">
                <Upload size={12} />
                <span>Upload .pgn</span>
                <input
                  type="file"
                  accept=".pgn"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleApplyPgn}
                disabled={!pgnInput.trim()}
                aria-label="Load PGN into board"
                className="px-4 py-1.5 rounded-lg bg-[#cfa859] text-[#0e0e10] hover:bg-[#e0b86a] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-mono font-semibold transition-colors cursor-pointer"
              >
                Import PGN
              </button>
            </div>
            {pgnError && (
              <div className="text-[11px] text-[#e74c3c] font-mono flex items-center gap-1">
                <AlertCircle size={12} />
                <span>{pgnError}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export type { PalettePiece };
