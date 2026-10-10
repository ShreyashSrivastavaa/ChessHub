import React from "react";

export function BoardSkeleton() {
  return (
    <div
      className="w-full h-full grid grid-cols-8 grid-rows-8 bg-[#141418] select-none"
      aria-label="Loading chessboard..."
    >
      {Array.from({ length: 64 }).map((_, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const isDark = (row + col) % 2 === 1;
        return (
          <div
            key={i}
            className={isDark ? "bg-[#141418]" : "bg-[#222228]"}
          />
        );
      })}
    </div>
  );
}
