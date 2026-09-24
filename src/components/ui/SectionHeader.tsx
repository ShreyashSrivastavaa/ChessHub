import React from "react";

export interface SectionHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  tag,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`max-w-[640px] mx-auto text-center flex flex-col items-center gap-3 mb-10 md:mb-14 ${className}`}>
      {tag && (
        <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-[#323232] border border-[#000000] px-3 py-1 rounded-[50px]">
          {tag}
        </span>
      )}
      <h2 className="text-[28px] md:text-[38px] leading-[1.2] tracking-[-0.02em] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
        {title}
      </h2>
      {description && (
        <p className="text-[16px] leading-[1.6] text-[#323232] font-[family-name:var(--font-body)]">
          {description}
        </p>
      )}
    </div>
  );
}
