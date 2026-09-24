import React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "lime" | "outline" | "concrete" | "cancelled";
  size?: "sm" | "md";
}

export function Tag({
  children,
  className = "",
  variant = "outline",
  size = "md",
  ...props
}: TagProps) {
  const base =
    "inline-flex items-center gap-1.5 font-[family-name:var(--font-mono)] rounded-[9999px] uppercase tracking-[0.04em] whitespace-nowrap select-none";

  const variants = {
    lime: "bg-[#ffffff] text-[#000000] border-0",
    outline: "bg-transparent text-[#ffffff] border border-[#d6d5d0]",
    concrete: "bg-[#1d1d1d] text-[#ffffff] border border-[#d6d5d0]/30",
    cancelled: "bg-transparent text-[#d6d5d0]/60 border border-dashed border-[#d6d5d0]/40 line-through",
  };

  const sizes = {
    sm: "h-[24px] px-[10px] text-[11px]",
    md: "h-[30px] px-[14px] text-[13px]",
  };

  return (
    <span
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
