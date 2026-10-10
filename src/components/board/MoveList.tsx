"use client";

import React, { useEffect, useRef } from "react";
import { GameMoveRecord } from "@/hooks/useChessGame";
import { QUALITY_CONFIG } from "@/lib/chess/uci";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Volume2,
  VolumeX,
  RotateCw,
} from "lucide-react";

interface MoveListProps {
  history: GameMoveRecord[];
  currentMoveIndex: number;
  onGoToMove: (index: number) => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
  onReset: () => void;
  onFlip: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  showQualityHints?: boolean;
}

export const MoveList = React.memo(function MoveList({
  history,
  currentMoveIndex,
  onGoToMove,
  onGoToStart,
  onGoToEnd,
  onGoToPrevious,
  onGoToNext,
  onReset,
  onFlip,
  isMuted,
  onToggleSound,
  showQualityHints = true,
}: MoveListProps) {
  const activeMoveRef = useRef<HTMLButtonElement | null>(null);

  // Group history into pairs: [WhiteMove, BlackMove?]
  const turns: {
    number: number;
    white: { move: GameMoveRecord; index: number };
    black?: { move: GameMoveRecord; index: number };
  }[] = [];

  for (let i = 0; i < history.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    turns.push({
      number: moveNum,
      white: { move: history[i], index: i },
      black: history[i + 1] ? { move: history[i + 1], index: i + 1 } : undefined,
    });
  }

  // Auto scroll to active move
  useEffect(() => {
    if (activeMoveRef.current) {
      activeMoveRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentMoveIndex]);

  return (
    <div className="flex flex-col h-full bg-[#141416] border border-[#2e2e36] rounded-xl overflow-hidden">
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#1a1a1e] border-b border-[#2e2e36]">
        <span className="text-[12px] font-mono font-medium text-[#dcd8d0] uppercase tracking-wider">
          Moves ({history.length})
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-md hover:bg-[#2e2e36] transition-colors ${
              isMuted ? "text-[#a8a39a]" : "text-[#cfa859]"
            }`}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button
            onClick={onFlip}
            className="p-1.5 rounded-md text-[#a8a39a] hover:text-[#f5f3ef] hover:bg-[#2e2e36] transition-colors"
            title="Flip board (F)"
            aria-label="Flip board"
          >
            <RotateCw size={15} />
          </button>
          <button
            onClick={onReset}
            className="p-1.5 rounded-md text-[#a8a39a] hover:text-[#f5f3ef] hover:bg-[#2e2e36] transition-colors"
            title="Reset position"
            aria-label="Reset position"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Move list table */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-[13px] font-mono">
        {turns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-[#a8a39a] text-[12px]">
            <span>No moves played yet.</span>
            <span className="text-[11px] text-[#6e6a64] mt-1">Make a move on the board to start.</span>
          </div>
        ) : (
          turns.map((turn) => {
            const isWhiteActive = currentMoveIndex === turn.white.index;
            const isBlackActive = turn.black && currentMoveIndex === turn.black.index;

            return (
              <div
                key={turn.number}
                className="grid grid-cols-[38px_1fr_1fr] items-center py-0.5 px-1 rounded hover:bg-[#1a1a1e]/60 transition-colors"
              >
                {/* Move number */}
                <span className="text-[11px] text-[#6e6a64] select-none pl-1">
                  {turn.number}.
                </span>

                {/* White move */}
                <button
                  ref={isWhiteActive ? activeMoveRef : undefined}
                  onClick={() => onGoToMove(turn.white.index)}
                  className={`flex items-center justify-between text-left px-2 py-1 rounded transition-colors text-[13px] ${
                    isWhiteActive
                      ? "bg-[#cfa859]/20 text-[#cfa859] font-semibold border border-[#cfa859]/30"
                      : "text-[#f5f3ef] hover:bg-[#222228]"
                  }`}
                >
                  <span>{turn.white.move.san}</span>
                  {showQualityHints && turn.white.move.quality && (
                    <span
                      className="text-[9px] px-1 py-0.2 rounded uppercase font-semibold"
                      style={{
                        color: QUALITY_CONFIG[turn.white.move.quality].color,
                        backgroundColor: QUALITY_CONFIG[turn.white.move.quality].bg,
                      }}
                      title={QUALITY_CONFIG[turn.white.move.quality].label}
                    >
                      {turn.white.move.quality.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {/* Black move */}
                {turn.black ? (
                  <button
                    ref={isBlackActive ? activeMoveRef : undefined}
                    onClick={() => onGoToMove(turn.black!.index)}
                    className={`flex items-center justify-between text-left px-2 py-1 rounded transition-colors text-[13px] ml-1 ${
                      isBlackActive
                        ? "bg-[#cfa859]/20 text-[#cfa859] font-semibold border border-[#cfa859]/30"
                        : "text-[#f5f3ef] hover:bg-[#222228]"
                    }`}
                  >
                    <span>{turn.black.move.san}</span>
                    {showQualityHints && turn.black.move.quality && (
                      <span
                        className="text-[9px] px-1 py-0.2 rounded uppercase font-semibold"
                        style={{
                          color: QUALITY_CONFIG[turn.black.move.quality].color,
                          backgroundColor: QUALITY_CONFIG[turn.black.move.quality].bg,
                        }}
                        title={QUALITY_CONFIG[turn.black.move.quality].label}
                      >
                        {turn.black.move.quality.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Navigation footer buttons */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#1a1a1e] border-t border-[#2e2e36]">
        <button
          onClick={onGoToStart}
          disabled={currentMoveIndex === -1}
          className="flex items-center justify-center p-2 rounded-lg bg-[#222228] hover:bg-[#2e2e36] text-[#dcd8d0] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Start of game (Home)"
          aria-label="Start of game"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={onGoToPrevious}
          disabled={currentMoveIndex === -1}
          className="flex items-center justify-center p-2 rounded-lg bg-[#222228] hover:bg-[#2e2e36] text-[#dcd8d0] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Previous move (Left arrow / U)"
          aria-label="Previous move"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={onGoToNext}
          disabled={currentMoveIndex === history.length - 1}
          className="flex items-center justify-center p-2 rounded-lg bg-[#222228] hover:bg-[#2e2e36] text-[#dcd8d0] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Next move (Right arrow)"
          aria-label="Next move"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={onGoToEnd}
          disabled={currentMoveIndex === history.length - 1}
          className="flex items-center justify-center p-2 rounded-lg bg-[#222228] hover:bg-[#2e2e36] text-[#dcd8d0] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Current position (End)"
          aria-label="Current position"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
});
