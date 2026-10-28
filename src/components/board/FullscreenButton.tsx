"use client";

import React from "react";
import { Maximize2, Minimize2 } from "lucide-react";

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
  className?: string;
}

export function FullscreenButton({
  isFullscreen,
  onToggle,
  className = "",
}: FullscreenButtonProps) {
  const label = isFullscreen ? "Exit Fullscreen (Shift+F)" : "Fullscreen (Shift+F)";

  return (
    <div className={`relative group inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        title={label}
        className={`p-2 rounded-lg border transition-all duration-150 flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-[#cfa859]/60 ${
          isFullscreen
            ? "border-[#cfa859] bg-[#cfa859]/15 text-[#cfa859] hover:bg-[#cfa859]/25 shadow-[0_0_10px_rgba(207,168,89,0.2)]"
            : "border-[#2e2e36] bg-[#1a1a1e] text-[#a8a39a] hover:text-[#f5f3ef] hover:bg-[#222228] hover:border-[#3e3e48]"
        }`}
      >
        {isFullscreen ? (
          <Minimize2 size={16} aria-hidden="true" />
        ) : (
          <Maximize2 size={16} aria-hidden="true" />
        )}
      </button>

      {/* Accessible visual tooltip on hover */}
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-8 right-0 hidden group-hover:block z-50 px-2 py-1 rounded bg-[#141416] border border-[#2e2e36] text-[11px] font-mono text-[#f5f3ef] shadow-lg whitespace-nowrap"
      >
        {label}
      </span>
    </div>
  );
}
