import React from "react";

export type ChessPieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

export interface PieceIconProps {
  piece: ChessPieceType;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function PieceIcon({
  piece,
  size = 24,
  className = "",
  strokeWidth = 1.5,
}: PieceIconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (piece) {
    case "king":
      return (
        <svg {...commonProps}>
          {/* Base */}
          <path d="M5 20h14" />
          <path d="M6 17h12" />
          {/* Body */}
          <path d="M7 17l1-7 4 3 4-3 1 7" />
          {/* Cross */}
          <path d="M12 4v4" />
          <path d="M10 6h4" />
        </svg>
      );
    case "queen":
      return (
        <svg {...commonProps}>
          {/* Base */}
          <path d="M5 20h14" />
          <path d="M6 17h12" />
          {/* Crown */}
          <path d="M6 17l-1-9 4.5 4 2.5-6 2.5 6 4.5-4-1 9" />
          <circle cx="5" cy="8" r="0.8" fill="currentColor" />
          <circle cx="12" cy="6" r="0.8" fill="currentColor" />
          <circle cx="19" cy="8" r="0.8" fill="currentColor" />
        </svg>
      );
    case "rook":
      return (
        <svg {...commonProps}>
          {/* Base */}
          <path d="M5 20h14" />
          <path d="M6 17h12" />
          {/* Stem */}
          <path d="M7 17l1-8h8l1 8" />
          {/* Battlements */}
          <path d="M7 9V5h2.5v2h3V5h2.5v2H17V5h1.5v4" />
        </svg>
      );
    case "bishop":
      return (
        <svg {...commonProps}>
          {/* Base */}
          <path d="M5 20h14" />
          <path d="M7 17h10" />
          {/* Miter */}
          <path d="M12 4a5 5 0 0 0-5 8c1 2 2 5 2 5h6s1-3 2-5a5 5 0 0 0-5-8z" />
          {/* Slash/cross */}
          <path d="M11 9l2 2" />
          <circle cx="12" cy="4" r="0.8" fill="currentColor" />
        </svg>
      );
    case "knight":
      return (
        <svg {...commonProps}>
          {/* Base */}
          <path d="M5 20h14" />
          <path d="M6 17h12" />
          {/* Head & Mane */}
          <path d="M8 17s-.5-4 1-6l4-5c.5-.7 1.5-.7 2 0l1 1.5c-1 1-1.5 2-1 3.5l3.5 1-2 5" />
          <circle cx="11" cy="9" r="0.8" fill="currentColor" />
        </svg>
      );
    case "pawn":
    default:
      return (
        <svg {...commonProps}>
          {/* Base */}
          <path d="M6 20h12" />
          <path d="M8 17h8" />
          {/* Body */}
          <path d="M9 17c.5-4 1.5-6 1.5-7h3c0 1 1 3 1.5 7" />
          {/* Head */}
          <circle cx="12" cy="7" r="3" />
        </svg>
      );
  }
}
