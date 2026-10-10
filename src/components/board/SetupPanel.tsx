"use client";

import React, { useState } from "react";
import { PieceSymbol, validateFen } from "chess.js";
import { Check, Copy, Upload, Download, AlertCircle, RefreshCw, Trash2 } from "lucide-react";

export type PalettePiece = {
  type: PieceSymbol;
  color: "w" | "b";
} | null; // null represents eraser

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
  validationError: string | null;
}

const PIECE_PALETTE: { type: PieceSymbol; color: "w" | "b"; glyph: string; label: string }[] = [
  // White pieces
  { type: "k", color: "w", glyph: "♔", label: "White King" },
  { type: "q", color: "w", glyph: "♕", label: "White Queen" },
  { type: "r", color: "w", glyph: "♖", label: "White Rook" },
  { type: "b", color: "w", glyph: "♗", label: "White Bishop" },
  { type: "n", color: "w", glyph: "♘", label: "White Knight" },
  { type: "p", color: "w", glyph: "♙", label: "White Pawn" },
  // Black pieces
  { type: "k", color: "b", glyph: "♚", label: "Black King" },
  { type: "q", color: "b", glyph: "♛", label: "Black Queen" },
  { type: "r", color: "b", glyph: "♜", label: "Black Rook" },
  { type: "b", color: "b", glyph: "♝", label: "Black Bishop" },
  { type: "n", color: "b", glyph: "♞", label: "Black Knight" },
  { type: "p", color: "b", glyph: "♟", label: "Black Pawn" },
];

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
  validationError,
}: SetupPanelProps) {
  const [fenInput, setFenInput] = useState(currentFen);
  const [fenError, setFenError] = useState<string | null>(null);
  const [copiedFen, setCopiedFen] = useState(false);

  const [pgnInput, setPgnInput] = useState("");
  const [pgnError, setPgnError] = useState<string | null>(null);
  const [copiedPgn, setCopiedPgn] = useState(false);

  // Sync FEN input with currentFen
  React.useEffect(() => {
    setFenInput(currentFen);
  }, [currentFen]);

  const handleApplyFen = () => {
    const res = onSetFen(fenInput);
    if (!res.ok) {
      setFenError(res.error || "Invalid FEN");
    } else {
      setFenError(null);
    }
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(currentFen);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

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
      {/* Setup Mode Toggle Bar */}
      <div className="p-3.5 bg-[#1a1a1e] flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium text-[#f5f3ef]">Board Setup & Editor</div>
          <div className="text-[11px] text-[#a8a39a] font-mono">
            {isSetupMode ? "Place or erase pieces" : "Normal analysis mode"}
          </div>
        </div>

        <button
          onClick={() => onToggleSetupMode(!isSetupMode)}
          disabled={isSetupMode && !!validationError}
          className={`px-3 py-1.5 rounded-full text-[12px] font-mono font-medium transition-colors ${
            isSetupMode
              ? validationError
                ? "bg-[#b3261e] text-white opacity-60 cursor-not-allowed"
                : "bg-[#4e8765] text-white hover:bg-[#3d6e52]"
              : "bg-[#cfa859] text-[#0e0e10] hover:bg-[#e0b86a]"
          }`}
          title={isSetupMode && validationError ? validationError : undefined}
        >
          {isSetupMode ? "Done (Validate)" : "Setup Mode"}
        </button>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-3 bg-[#b3261e]/15 border-b border-[#b3261e]/30 flex items-start gap-2 text-[#f5f3ef]">
          <AlertCircle size={16} className="text-[#b3261e] shrink-0 mt-0.5" />
          <span className="text-[12px] font-mono text-[#f5f3ef]">{validationError}</span>
        </div>
      )}

      {/* Piece Palette in Setup Mode */}
      {isSetupMode && (
        <div className="p-3.5 bg-[#141416] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#cfa859]">
              Piece Palette
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={onResetToStart}
                className="px-2 py-1 rounded bg-[#222228] hover:bg-[#2e2e36] text-[11px] font-mono text-[#dcd8d0] flex items-center gap-1 transition-colors"
                title="Reset to standard starting position"
              >
                <RefreshCw size={11} />
                <span>Standard</span>
              </button>
              <button
                onClick={onClearBoard}
                className="px-2 py-1 rounded bg-[#222228] hover:bg-[#2e2e36] text-[11px] font-mono text-[#dcd8d0] flex items-center gap-1 transition-colors"
                title="Clear all pieces from board"
              >
                <Trash2 size={11} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Pieces Grid */}
          <div className="grid grid-cols-7 gap-1.5 p-2 rounded-lg bg-[#1a1a1e] border border-[#2e2e36]">
            {PIECE_PALETTE.map((p) => {
              const isSelected =
                selectedPalettePiece &&
                selectedPalettePiece.type === p.type &&
                selectedPalettePiece.color === p.color;

              return (
                <button
                  key={`${p.color}-${p.type}`}
                  onClick={() => onSelectPalettePiece({ type: p.type, color: p.color })}
                  className={`w-9 h-9 rounded flex items-center justify-center text-2xl transition-all ${
                    isSelected
                      ? "bg-[#cfa859]/30 border-2 border-[#cfa859] scale-105"
                      : "bg-[#222228] hover:bg-[#2e2e36] border border-transparent"
                  }`}
                  title={p.label}
                >
                  <span className={p.color === "w" ? "text-white" : "text-[#141418] drop-shadow-sm"}>
                    {p.glyph}
                  </span>
                </button>
              );
            })}

            {/* Eraser Tool */}
            <button
              onClick={() => onSelectPalettePiece(null)}
              className={`w-9 h-9 rounded flex items-center justify-center text-[12px] font-mono transition-all ${
                selectedPalettePiece === null
                  ? "bg-[#b3261e]/30 border-2 border-[#b3261e] text-[#b3261e]"
                  : "bg-[#222228] hover:bg-[#2e2e36] text-[#a8a39a]"
              }`}
              title="Eraser (click square to remove piece)"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Turn and Castling Settings */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-[12px] font-mono">
            {/* Side to move */}
            <div>
              <span className="text-[#a8a39a] block mb-1.5">Side to Move:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onSetTurn("w")}
                  className={`flex-1 py-1 rounded text-center transition-colors ${
                    turn === "w"
                      ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                      : "bg-[#222228] text-[#dcd8d0]"
                  }`}
                >
                  White
                </button>
                <button
                  onClick={() => onSetTurn("b")}
                  className={`flex-1 py-1 rounded text-center transition-colors ${
                    turn === "b"
                      ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                      : "bg-[#222228] text-[#dcd8d0]"
                  }`}
                >
                  Black
                </button>
              </div>
            </div>

            {/* Castling rights */}
            <div>
              <span className="text-[#a8a39a] block mb-1.5">Castling Rights:</span>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1 cursor-pointer text-[#dcd8d0]">
                  <input
                    type="checkbox"
                    checked={castlingRights.K}
                    onChange={(e) => onSetCastlingRights({ ...castlingRights, K: e.target.checked })}
                    className="accent-[#cfa859]"
                  />
                  <span>K</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer text-[#dcd8d0]">
                  <input
                    type="checkbox"
                    checked={castlingRights.Q}
                    onChange={(e) => onSetCastlingRights({ ...castlingRights, Q: e.target.checked })}
                    className="accent-[#cfa859]"
                  />
                  <span>Q</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer text-[#dcd8d0]">
                  <input
                    type="checkbox"
                    checked={castlingRights.k}
                    onChange={(e) => onSetCastlingRights({ ...castlingRights, k: e.target.checked })}
                    className="accent-[#cfa859]"
                  />
                  <span>k</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer text-[#dcd8d0]">
                  <input
                    type="checkbox"
                    checked={castlingRights.q}
                    onChange={(e) => onSetCastlingRights({ ...castlingRights, q: e.target.checked })}
                    className="accent-[#cfa859]"
                  />
                  <span>q</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEN Box */}
      <div className="p-3.5 space-y-2 bg-[#141416]">
        <div className="flex items-center justify-between text-[12px] font-mono">
          <span className="text-[#cfa859] font-medium uppercase tracking-wider">FEN Notation</span>
          <button
            onClick={handleCopyFen}
            className="flex items-center gap-1 text-[11px] text-[#a8a39a] hover:text-[#cfa859] transition-colors"
          >
            {copiedFen ? <Check size={12} className="text-[#4e8765]" /> : <Copy size={12} />}
            <span>{copiedFen ? "Copied" : "Copy FEN"}</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={fenInput}
            onChange={(e) => setFenInput(e.target.value)}
            placeholder="Paste FEN here..."
            className="flex-1 bg-[#1a1a1e] border border-[#2e2e36] text-[#f5f3ef] rounded-lg px-2.5 py-1.5 text-[11px] font-mono focus:outline-hidden focus:border-[#cfa859]"
          />
          <button
            onClick={handleApplyFen}
            className="px-3 py-1.5 rounded-lg bg-[#222228] hover:bg-[#2e2e36] text-[#f5f3ef] text-[11px] font-mono transition-colors"
          >
            Load
          </button>
        </div>
        {fenError && <div className="text-[11px] text-[#b3261e] font-mono">{fenError}</div>}
      </div>

      {/* PGN Import / Export */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[#141416]">
        <div className="flex items-center justify-between text-[12px] font-mono">
          <span className="text-[#cfa859] font-medium uppercase tracking-wider">PGN Import & Export</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopyPgn}
              className="flex items-center gap-1 text-[11px] text-[#a8a39a] hover:text-[#cfa859] transition-colors"
              title="Copy current PGN"
            >
              {copiedPgn ? <Check size={12} className="text-[#4e8765]" /> : <Copy size={12} />}
              <span>{copiedPgn ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleDownloadPgn}
              className="flex items-center gap-1 text-[11px] text-[#a8a39a] hover:text-[#cfa859] transition-colors"
              title="Download PGN file"
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
          rows={3}
          className="w-full bg-[#1a1a1e] border border-[#2e2e36] text-[#f5f3ef] rounded-lg p-2 text-[11px] font-mono focus:outline-hidden focus:border-[#cfa859] resize-none"
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
            onClick={handleApplyPgn}
            disabled={!pgnInput.trim()}
            className="px-4 py-1.5 rounded-lg bg-[#cfa859] text-[#0e0e10] hover:bg-[#e0b86a] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-mono font-medium transition-colors"
          >
            Import PGN
          </button>
        </div>
        {pgnError && <div className="text-[11px] text-[#b3261e] font-mono">{pgnError}</div>}
      </div>
    </div>
  );
}
