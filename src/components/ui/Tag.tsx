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
    "inline-flex items-center gap-1.5 font-[family-name:var(--font-mono)] rounded-[50px] uppercase tracking-[0.04em] whitespace-nowrap select-none";

  const variants = {
    lime: "bg-[#e3fc03] text-[#000000] border-0",
    outline: "bg-[#ffffff] text-[#000000] border border-[#000000]",
    concrete: "bg-[#e6e6e6] text-[#000000] border-0",
    cancelled: "bg-[#ffffff] text-[#323232] border border-dashed border-[#000000] line-through",
  };

  const sizes = {
    sm: "h-[22px] px-[8px] text-[11px]",
    md: "h-[28px] px-[12px] text-[13px]",
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
