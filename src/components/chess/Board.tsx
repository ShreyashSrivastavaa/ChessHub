import React from "react";

export interface BoardHighlight {
  row: number; // 0-7
  col: number; // 0-7
}

export interface BoardProps {
  size?: number;
  highlights?: BoardHighlight[];
  showCoordinates?: boolean;
  className?: string;
}

export function Board({
  size,
  highlights = [
    { row: 4, col: 4 }, // e4
    { row: 2, col: 5 }, // f6
  ],
  showCoordinates = true,
  className = "",
}: BoardProps) {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  const isHighlighted = (r: number, c: number) => {
    return highlights.some((h) => h.row === r && h.col === c);
  };

  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div
      style={style}
      className={`relative aspect-square w-full max-w-[440px] border border-[#2e2e36] rounded-[12px] overflow-hidden bg-[#0e0e10] select-none shadow-[0_12px_40px_rgba(0,0,0,0.5)] ${className}`}
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {ranks.map((rank, rIdx) =>
          files.map((file, cIdx) => {
            const isDark = (rIdx + cIdx) % 2 === 1;
            const highlighted = isHighlighted(rIdx, cIdx);

            return (
              <div
                key={`${file}${rank}`}
                className={`relative flex items-center justify-center transition-colors duration-200 ${
                  highlighted
                    ? "bg-[#cfa859]/30 border border-[#cfa859]/50"
                    : isDark
                    ? "bg-[#141418]"
                    : "bg-[#1f1f26]"
                }`}
              >
                {/* File coordinate on bottom rank */}
                {showCoordinates && rIdx === 7 && (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0.5 right-1 text-[9px] font-[family-name:var(--font-mono)] ${
                      highlighted ? "text-[#cfa859]" : "text-[#a8a39a]/60"
                    }`}
                  >
                    {file}
                  </span>
                )}
                {/* Rank coordinate on first file */}
                {showCoordinates && cIdx === 0 && (
                  <span
                    aria-hidden="true"
                    className={`absolute top-0.5 left-1 text-[9px] font-[family-name:var(--font-mono)] ${
                      highlighted ? "text-[#cfa859]" : "text-[#a8a39a]/60"
                    }`}
                  >
                    {rank}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
