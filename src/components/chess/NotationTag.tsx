import React from "react";

export interface NotationTagProps {
  label: string;
  theme?: "default" | "lime";
  className?: string;
}

export function NotationTag({
  label,
  theme = "default",
  className = "",
}: NotationTagProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-[50px] text-[12px] font-[family-name:var(--font-mono)] tracking-tight ${
        theme === "lime"
          ? "bg-[#e3fc03] text-[#000000]"
          : "bg-[#ffffff] text-[#000000] border border-[#000000]"
      } ${className}`}
    >
      {label}
    </span>
  );
}
