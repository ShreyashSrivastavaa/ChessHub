import React from "react";

export interface RatingPoint {
  date: string;
  rating: number;
}

export interface RatingSparklineProps {
  data: RatingPoint[];
  width?: number;
  height?: number;
  className?: string;
}

export function RatingSparkline({
  data,
  width = 240,
  height = 48,
  className = "",
}: RatingSparklineProps) {
  if (!data || data.length < 2) return null;

  const ratings = data.map((d) => d.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const range = max - min || 1;

  const padding = 6;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * usableWidth;
    const y = height - padding - ((d.rating - min) / range) * usableHeight;
    return { x, y, rating: d.rating, date: d.date };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, "");

  const lastPoint = points[points.length - 1];

  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[12px] font-[family-name:var(--font-mono)] text-[#d6d5d0]">
        <span>Rating Progression</span>
        <span className="text-[#ffffff]">{lastPoint.rating}</span>
      </div>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Baseline hairline grid */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#d6d5d0"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          opacity="0.2"
        />

        {/* 1px white sparkline */}
        <path
          d={pathD}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ending white dot */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="3.5"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
