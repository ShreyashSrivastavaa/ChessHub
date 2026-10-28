"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Dices,
  RefreshCw,
  Trash2,
  Share2,
  AlertCircle,
  Bookmark,
  BookmarkPlus,
  X,
} from "lucide-react";
import {
  validateEditorPosition,
  generateRandomPosition,
  getSavedPositions,
  savePosition,
  deleteSavedPosition,
  SavedEditorPosition,
} from "@/lib/chess/editor";

interface FenControlsProps {
  currentFen: string;
  onSetFen: (fen: string) => { ok: boolean; error?: string };
  onResetToStart: () => void;
  onClearBoard: () => void;
  validationError?: string | null;
}

export function FenControls({
  currentFen,
  onSetFen,
  onResetToStart,
  onClearBoard,
  validationError,
}: FenControlsProps) {
  const [fenInput, setFenInput] = useState(currentFen);
  const [fenError, setFenError] = useState<string | null>(null);
  const [copiedFen, setCopiedFen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Saved positions state
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [positionName, setPositionName] = useState("");
  const [savedList, setSavedList] = useState<SavedEditorPosition[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFenInput(currentFen);
    setFenError(null);
  }, [currentFen]);

  useEffect(() => {
    setSavedList(getSavedPositions());
  }, []);

  const handleApplyFen = () => {
    const trimmed = fenInput.trim();
    if (!trimmed) {
      setFenError("Please enter a FEN string.");
      return;
    }

    const check = validateEditorPosition(trimmed);
    if (!check.valid) {
      setFenError(check.error || "Invalid FEN position.");
      return;
    }

    const res = onSetFen(trimmed);
    if (!res.ok) {
      setFenError(res.error || "Failed to load FEN.");
    } else {
      setFenError(null);
    }
  };

  const handleCopyFen = async () => {
    try {
      await navigator.clipboard.writeText(currentFen);
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShareLink = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/board?fen=${encodeURIComponent(currentFen)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleRandomPosition = () => {
    const randomFen = generateRandomPosition();
    const res = onSetFen(randomFen);
    if (!res.ok) {
      setFenError(res.error || "Failed to set random position.");
    } else {
      setFenError(null);
    }
  };

  const handleSavePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionName.trim()) return;
    const updated = savePosition(positionName, currentFen);
    setSavedList(updated);
    setPositionName("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeletePosition = (id: string) => {
    const updated = deleteSavedPosition(id);
    setSavedList(updated);
  };

  return (
    <div className="space-y-3">
      {/* Board Management Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Reset Standard Position */}
        <button
          type="button"
          onClick={onResetToStart}
          aria-label="Reset to starting position"
          className="py-1.5 px-2.5 rounded-lg bg-[#222228] hover:bg-[#2a2a32] border border-[#363640] hover:border-[#4a4a58] text-[#f5f3ef] text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          title="Reset board to standard 32-piece starting position"
        >
          <RefreshCw size={13} className="text-[#cfa859]" />
          <span>Reset Board</span>
        </button>

        {/* Clear Board with confirmation */}
        {showClearConfirm ? (
          <div className="col-span-1 flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onClearBoard();
                setShowClearConfirm(false);
              }}
              aria-label="Confirm clear all pieces"
              className="flex-1 py-1.5 px-2 rounded-lg bg-[#b3261e] hover:bg-[#962019] text-white text-[11px] font-mono font-semibold transition-colors"
            >
              Confirm Clear
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              aria-label="Cancel clear board"
              className="py-1.5 px-2 rounded-lg bg-[#222228] text-[#a8a39a] hover:text-white text-[11px] font-mono"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            aria-label="Clear all pieces from board"
            className="py-1.5 px-2.5 rounded-lg bg-[#222228] hover:bg-[#2a2a32] border border-[#363640] hover:border-[#b3261e]/50 text-[#f5f3ef] text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Remove all pieces from the board"
          >
            <Trash2 size={13} className="text-[#e74c3c]" />
            <span>Clear Board</span>
          </button>
        )}

        {/* Random Position Generator */}
        <button
          type="button"
          onClick={handleRandomPosition}
          aria-label="Generate random valid chess position"
          className="py-1.5 px-2.5 rounded-lg bg-[#222228] hover:bg-[#2a2a32] border border-[#363640] hover:border-[#4a4a58] text-[#f5f3ef] text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          title="Generate a random legal position (both kings safe, no back-rank pawns)"
        >
          <Dices size={13} className="text-[#cfa859]" />
          <span>Random</span>
        </button>

        {/* Shareable Link Button */}
        <button
          type="button"
          onClick={handleShareLink}
          aria-label="Copy shareable link with current position"
          className="py-1.5 px-2.5 rounded-lg bg-[#222228] hover:bg-[#2a2a32] border border-[#363640] hover:border-[#4a4a58] text-[#f5f3ef] text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          title="Copy URL with current position encoded in query param"
        >
          {copiedShareLink ? (
            <>
              <Check size={13} className="text-[#4e8765]" />
              <span className="text-[#4e8765]">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 size={13} className="text-[#cfa859]" />
              <span>Share Link</span>
            </>
          )}
        </button>
      </div>

      {/* FEN Input & Copy Bar */}
      <div className="p-3 rounded-lg bg-[#1a1a1e] border border-[#2e2e36] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#cfa859] uppercase tracking-wider font-semibold">
            FEN Position
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFen}
              aria-label="Copy FEN to clipboard"
              className="flex items-center gap-1 text-[#a8a39a] hover:text-[#cfa859] transition-colors cursor-pointer"
            >
              {copiedFen ? (
                <>
                  <Check size={12} className="text-[#4e8765]" />
                  <span className="text-[#4e8765]">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy FEN</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowSavedModal((prev) => !prev)}
              aria-label="Saved positions library"
              className="flex items-center gap-1 text-[#a8a39a] hover:text-[#cfa859] transition-colors cursor-pointer"
            >
              <Bookmark size={12} />
              <span>Saved ({savedList.length})</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={fenInput}
            onChange={(e) => setFenInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyFen();
              }
            }}
            placeholder="e.g. 8/2k5/8/8/3K4/2P5/8/8 w - - 0 1"
            aria-label="FEN notation string"
            className="flex-1 bg-[#141416] border border-[#2e2e36] text-[#f5f3ef] rounded-md px-2.5 py-1.5 text-[11px] font-mono focus:outline-hidden focus:border-[#cfa859]"
          />
          <button
            type="button"
            onClick={handleApplyFen}
            aria-label="Load FEN onto board"
            className="px-3 py-1.5 rounded-md bg-[#222228] hover:bg-[#2e2e36] border border-[#363640] hover:border-[#cfa859] text-[#f5f3ef] text-[11px] font-mono transition-colors cursor-pointer font-medium"
          >
            Load FEN
          </button>
        </div>

        {/* Friendly Error Display */}
        {(fenError || validationError) && (
          <div className="p-2 rounded bg-[#b3261e]/15 border border-[#b3261e]/40 flex items-start gap-1.5 text-[11px] font-mono text-[#f5f3ef]">
            <AlertCircle size={14} className="text-[#e74c3c] shrink-0 mt-0.5" />
            <span>{fenError || validationError}</span>
          </div>
        )}
      </div>

      {/* Saved Positions Accordion / Drawer */}
      {showSavedModal && (
        <div className="p-3 rounded-lg bg-[#1a1a1e] border border-[#2e2e36] space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#2e2e36]">
            <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#cfa859] font-medium">
              <Bookmark size={14} />
              <span>Saved Positions (Teaching Studies)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSavedModal(false)}
              aria-label="Close saved positions"
              className="text-[#a8a39a] hover:text-[#f5f3ef]"
            >
              <X size={14} />
            </button>
          </div>

          {/* Save Current Position Form */}
          <form onSubmit={handleSavePosition} className="flex gap-2">
            <input
              type="text"
              value={positionName}
              onChange={(e) => setPositionName(e.target.value)}
              placeholder="Study name (e.g. Lucena Endgame)..."
              aria-label="Position name to save"
              className="flex-1 bg-[#141416] border border-[#2e2e36] text-[#f5f3ef] rounded-md px-2.5 py-1 text-[11px] font-mono focus:outline-hidden focus:border-[#cfa859]"
            />
            <button
              type="submit"
              disabled={!positionName.trim()}
              aria-label="Save current position"
              className="px-2.5 py-1 rounded-md bg-[#cfa859] text-[#0e0e10] hover:bg-[#e0b86a] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-mono font-semibold transition-colors flex items-center gap-1"
            >
              <BookmarkPlus size={12} />
              <span>{saveSuccess ? "Saved!" : "Save"}</span>
            </button>
          </form>

          {/* List of Saved Positions */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {savedList.length === 0 ? (
              <div className="text-[11px] text-[#a8a39a] font-mono py-2 text-center">
                No saved positions yet. Enter a name above to save current board.
              </div>
            ) : (
              savedList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded bg-[#141416] border border-[#2e2e36]/70 text-[11px] font-mono"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <div className="font-semibold text-[#f5f3ef] truncate">{item.name}</div>
                    <div className="text-[9px] text-[#a8a39a] truncate">{item.fen}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSetFen(item.fen)}
                      aria-label={`Load position ${item.name}`}
                      className="px-2 py-0.5 rounded bg-[#222228] hover:bg-[#2e2e36] text-[#cfa859] hover:underline"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePosition(item.id)}
                      aria-label={`Delete position ${item.name}`}
                      className="p-1 rounded text-[#a8a39a] hover:text-[#e74c3c] hover:bg-[#222228]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
