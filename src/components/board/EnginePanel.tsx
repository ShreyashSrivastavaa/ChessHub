"use client";

import React from "react";
import { EngineLine, EngineEval } from "@/lib/chess/uci";
import { Play, Pause, Lightbulb, Undo2, Cpu, AlertTriangle } from "lucide-react";

export interface PlayVsEngineConfig {
  active: boolean;
  playerColor: "w" | "b";
  skillLevel: number; // 0-20
}

interface EnginePanelProps {
  engineEnabled: boolean;
  onToggleEngine: (enabled: boolean) => void;
  isReady: boolean;
  isThinking: boolean;
  unsupported: boolean;
  unsupportedMessage: string | null;
  depth: number;
  onDepthChange: (depth: number) => void;
  multiPv: number;
  onMultiPvChange: (lines: number) => void;
  lines: EngineLine[];
  currentEval: EngineEval | null;
  onPlayEngineMove: (moveUci: string) => void;
  showBestMoveArrow: boolean;
  onToggleBestMoveArrow: (show: boolean) => void;
  showQualityHints: boolean;
  onToggleQualityHints: (show: boolean) => void;
  playVsEngine: PlayVsEngineConfig;
  onUpdatePlayVsEngine: (config: PlayVsEngineConfig) => void;
  onEngineHint: () => void;
  onTakeBack: () => void;
}

const SKILL_LEVELS = [
  { level: 1, label: "Beginner (~800 Elo)" },
  { level: 5, label: "Casual (~1100 Elo)" },
  { level: 10, label: "Intermediate (~1500 Elo)" },
  { level: 15, label: "Club (~1900 Elo)" },
  { level: 18, label: "Expert (~2200 Elo)" },
  { level: 20, label: "Master / Max (~2600+ Elo)" },
];

export function EnginePanel({
  engineEnabled,
  onToggleEngine,
  isReady,
  isThinking,
  unsupported,
  unsupportedMessage,
  depth,
  onDepthChange,
  multiPv,
  onMultiPvChange,
  lines,
  currentEval,
  onPlayEngineMove,
  showBestMoveArrow,
  onToggleBestMoveArrow,
  showQualityHints,
  onToggleQualityHints,
  playVsEngine,
  onUpdatePlayVsEngine,
  onEngineHint,
  onTakeBack,
}: EnginePanelProps) {
  if (unsupported) {
    return (
      <div className="p-4 rounded-xl bg-[#b3261e]/10 border border-[#b3261e]/30 text-[#f5f3ef] flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#b3261e] font-medium text-[14px]">
          <AlertTriangle size={18} />
          <span>Chess Engine Unavailable</span>
        </div>
        <p className="text-[12px] text-[#dcd8d0]">
          {unsupportedMessage || "Your browser does not support single-threaded WebAssembly Web Workers."}
        </p>
        <p className="text-[11px] text-[#a8a39a]">
          Board editing, move analysis, and position sharing remain fully operational.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#141416] border border-[#2e2e36] rounded-xl overflow-hidden divide-y divide-[#2e2e36]">
      {/* Top Engine Status & Switch */}
      <div className="flex items-center justify-between p-3.5 bg-[#1a1a1e]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Cpu size={18} className={engineEnabled ? "text-[#cfa859]" : "text-[#6e6a64]"} />
            {isThinking && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4e8765] animate-ping" />
            )}
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#f5f3ef] flex items-center gap-2">
              <span>Stockfish 19 WASM</span>
              {isThinking && (
                <span className="text-[10px] text-[#4e8765] font-mono animate-pulse">Thinking...</span>
              )}
            </div>
            <div className="text-[11px] text-[#a8a39a] font-mono">
              {currentEval ? `Eval: ${currentEval.scoreText}` : "Single-thread (client-side)"}
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleEngine(!engineEnabled)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-mono font-medium transition-colors flex items-center gap-1.5 ${
            engineEnabled
              ? "bg-[#cfa859] text-[#0e0e10] hover:bg-[#e0b86a]"
              : "bg-[#222228] text-[#a8a39a] hover:bg-[#2e2e36] hover:text-[#f5f3ef]"
          }`}
        >
          {engineEnabled ? <Pause size={13} /> : <Play size={13} />}
          <span>{engineEnabled ? "Analysis ON" : "Analysis OFF"}</span>
        </button>
      </div>

      {/* Play vs Engine Mode Section */}
      <div className="p-3.5 bg-[#141416] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-mono font-medium uppercase tracking-wider text-[#cfa859]">
            Play vs Engine
          </span>
          <button
            onClick={() =>
              onUpdatePlayVsEngine({
                ...playVsEngine,
                active: !playVsEngine.active,
              })
            }
            className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
              playVsEngine.active
                ? "bg-[#4e8765]/20 border-[#4e8765] text-[#4e8765]"
                : "border-[#2e2e36] text-[#a8a39a] hover:text-[#f5f3ef]"
            }`}
          >
            {playVsEngine.active ? "Active" : "Disabled"}
          </button>
        </div>

        {playVsEngine.active && (
          <div className="space-y-3 pt-1 text-[12px] font-mono">
            {/* Color selection */}
            <div className="flex items-center justify-between">
              <span className="text-[#a8a39a]">Your Color:</span>
              <div className="flex gap-1">
                {(["w", "b"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdatePlayVsEngine({ ...playVsEngine, playerColor: c })}
                    className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                      playVsEngine.playerColor === c
                        ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                        : "bg-[#222228] text-[#dcd8d0] hover:bg-[#2e2e36]"
                    }`}
                  >
                    {c === "w" ? "White" : "Black"}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[#a8a39a]">
                <span>Difficulty:</span>
                <span className="text-[#cfa859]">
                  Level {playVsEngine.skillLevel}
                </span>
              </div>
              <select
                value={playVsEngine.skillLevel}
                onChange={(e) =>
                  onUpdatePlayVsEngine({
                    ...playVsEngine,
                    skillLevel: parseInt(e.target.value, 10),
                  })
                }
                className="w-full bg-[#1a1a1e] border border-[#2e2e36] text-[#f5f3ef] rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-hidden focus:border-[#cfa859]"
              >
                {SKILL_LEVELS.map((s) => (
                  <option key={s.level} value={s.level}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* In-game action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onEngineHint}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#222228] hover:bg-[#2e2e36] text-[#dcd8d0] hover:text-[#cfa859] transition-colors text-[11px]"
                title="Get engine hint for your best move"
              >
                <Lightbulb size={13} />
                <span>Hint</span>
              </button>
              <button
                onClick={onTakeBack}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#222228] hover:bg-[#2e2e36] text-[#dcd8d0] hover:text-[#f5f3ef] transition-colors text-[11px]"
                title="Take back last 2 half-moves"
              >
                <Undo2 size={13} />
                <span>Take Back</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Engine Lines Section (MultiPV) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-[12px] font-mono">
          <span className="text-[#a8a39a]">Lines (MultiPV):</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => onMultiPvChange(n)}
                className={`w-6 h-6 rounded flex items-center justify-center text-[11px] transition-colors ${
                  multiPv === n
                    ? "bg-[#cfa859] text-[#0e0e10] font-bold"
                    : "bg-[#222228] text-[#a8a39a] hover:bg-[#2e2e36]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Engine lines content */}
        {!engineEnabled ? (
          <div className="py-6 text-center text-[#6e6a64] text-[12px] font-mono">
            Enable analysis above to view Stockfish evaluation lines.
          </div>
        ) : lines.length === 0 ? (
          <div className="py-6 text-center text-[#a8a39a] text-[12px] font-mono">
            {isThinking ? "Calculating variations..." : "Waiting for position..."}
          </div>
        ) : (
          <div className="space-y-2">
            {lines.map((line) => (
              <div
                key={line.id}
                className="p-2.5 rounded-lg bg-[#1a1a1e] border border-[#2e2e36] space-y-1.5 hover:border-[#363640] transition-colors"
              >
                <div className="flex items-center justify-between text-[12px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#222228] text-[#cfa859] text-[10px] flex items-center justify-center font-bold">
                      {line.id}
                    </span>
                    <span className="font-semibold text-[#f5f3ef]">
                      {line.scoreText}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#a8a39a]">
                    depth {line.depth}
                  </span>
                </div>

                {/* Principal variation SAN moves */}
                <div className="flex flex-wrap gap-1 text-[11px] font-mono text-[#dcd8d0]">
                  {line.pvSan.slice(0, 7).map((san, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => {
                        if (sIdx === 0 && line.bestMoveUci) {
                          onPlayEngineMove(line.bestMoveUci);
                        }
                      }}
                      className={`px-1 rounded hover:bg-[#2e2e36] hover:text-[#cfa859] transition-colors ${
                        sIdx === 0 ? "text-[#cfa859] font-medium underline" : ""
                      }`}
                      title={sIdx === 0 ? "Click to play this move on the board" : undefined}
                    >
                      {san}
                    </button>
                  ))}
                  {line.pvSan.length > 7 && (
                    <span className="text-[#6e6a64]">...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Depth & Display Toggles */}
      <div className="p-3.5 bg-[#1a1a1e] space-y-3 text-[12px] font-mono">
        {/* Depth Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[#a8a39a]">
            <span>Search Depth:</span>
            <span className="text-[#f5f3ef] font-semibold">{depth} plies</span>
          </div>
          <input
            type="range"
            min="8"
            max="24"
            step="1"
            value={depth}
            onChange={(e) => onDepthChange(parseInt(e.target.value, 10))}
            className="w-full accent-[#cfa859] bg-[#2e2e36] h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Best move arrow & Quality hints toggles */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-[#dcd8d0] hover:text-[#f5f3ef]">
            <input
              type="checkbox"
              checked={showBestMoveArrow}
              onChange={(e) => onToggleBestMoveArrow(e.target.checked)}
              className="rounded accent-[#cfa859]"
            />
            <span>Best-move arrow</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#dcd8d0] hover:text-[#f5f3ef]">
            <input
              type="checkbox"
              checked={showQualityHints}
              onChange={(e) => onToggleQualityHints(e.target.checked)}
              className="rounded accent-[#cfa859]"
            />
            <span>Move quality</span>
          </label>
        </div>
      </div>
    </div>
  );
}
