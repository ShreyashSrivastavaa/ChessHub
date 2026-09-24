import React from "react";

export interface BoardHighlight {
  row: number; // 0-7
  col: number; // 0-7
}

export interface BoardProps {
  size?: number; // width/height in px or full responsive
  highlights?: BoardHighlight[];
  showCoordinates?: boolean;
  className?: string;
  pieces?: Record<string, string>; // e.g., "e4": "knight", "e5": "pawn"
}

export function Board({
  size,
  highlights = [
    { row: 4, col: 4 }, // e4
    { row: 2, col: 5 }, // f6 or Nf3
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
      className={`relative aspect-square w-full max-w-[440px] border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff] select-none ${className}`}
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
                    ? "bg-[#e3fc03]"
                    : isDark
                    ? "bg-[#e6e6e6]"
                    : "bg-[#ffffff]"
                }`}
              >
                {/* File coordinate on bottom rank */}
                {showCoordinates && rIdx === 7 && (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0.5 right-1 text-[9px] font-[family-name:var(--font-mono)] ${
                      highlighted
                        ? "text-[#000000]"
                        : isDark
                        ? "text-[#323232]"
                        : "text-[#323232]"
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
                      highlighted
                        ? "text-[#000000]"
                        : isDark
                        ? "text-[#323232]"
                        : "text-[#323232]"
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
