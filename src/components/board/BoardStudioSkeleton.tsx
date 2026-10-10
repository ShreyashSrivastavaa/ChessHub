import React from "react";
import { BoardSkeleton } from "./BoardSkeleton";

export function BoardStudioSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Top Header / Studio Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e36]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] md:text-[32px] font-light font-[family-name:var(--font-heading)] text-[#f5f3ef] tracking-tight">
              Chess Board Studio
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-[#cfa859]/30 bg-[#cfa859]/10 text-[11px] font-mono text-[#cfa859]">
              Coach & Analysis
            </span>
          </div>
          <p className="text-[13px] text-[#a8a39a] font-[family-name:var(--font-body)] mt-0.5">
            Interactive analysis board with client-side Stockfish 19 WASM engine, position editor, and teaching tools.
          </p>
        </div>

        {/* Top actions skeleton placeholder */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-9 h-9 rounded-lg border border-[#2e2e36] bg-[#1a1a1e]" />
          <div className="w-32 h-9 rounded-lg border border-[#2e2e36] bg-[#1a1a1e]" />
          <div className="w-24 h-9 rounded-lg border border-[#2e2e36] bg-[#1a1a1e]" />
          <div className="w-9 h-9 rounded-lg border border-[#2e2e36] bg-[#1a1a1e]" />
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Board + Eval Bar */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4">
          <div className="w-full h-[46px] rounded-xl bg-[#141416] border border-[#2e2e36]" />

          <div className="relative w-full flex items-stretch justify-center gap-2 sm:gap-3 max-w-[620px]">
            {/* Attached Eval Bar skeleton */}
            <div className="shrink-0 flex items-stretch">
              <div className="w-7 sm:w-8 rounded-md bg-[#1a1a1e] border border-[#2e2e36]" />
            </div>

            {/* Chessboard Box */}
            <div
              className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#2e2e36] bg-[#0e0e10] shadow-2xl select-none"
              style={{ maxHeight: "min(600px, 80vh)" }}
            >
              <BoardSkeleton />
            </div>
          </div>

          <div className="w-full max-w-[620px] h-4 text-[11px] font-mono text-[#a8a39a] px-1 flex justify-between">
            <span>Right-click drag to draw arrows</span>
          </div>
        </div>

        {/* Right: Tabbed Panels */}
        <div className="lg:col-span-5 flex flex-col h-[650px] max-h-[85vh]">
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#1a1a1e] border border-[#2e2e36] mb-3 h-[42px]" />
          <div className="flex-1 rounded-xl bg-[#141416] border border-[#2e2e36] p-4" />
        </div>
      </div>
    </div>
  );
}
