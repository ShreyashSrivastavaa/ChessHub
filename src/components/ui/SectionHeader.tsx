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
    <div className={`max-w-[760px] mx-auto text-center flex flex-col items-center gap-4 mb-14 md:mb-20 ${className}`}>
      {tag && (
        <span className="text-[12px] md:text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.1em] text-[#d6d5d0] border border-[#d6d5d0]/30 px-3.5 py-1 rounded-[9999px]">
          {tag}
        </span>
      )}
      <h2 className="text-[36px] sm:text-[48px] md:text-[60px] lg:text-[72px] leading-[1.05] tracking-[-0.015em] font-[family-name:var(--font-heading)] font-light text-[#ffffff]">
        {title}
      </h2>
      {description && (
        <p className="text-[16px] md:text-[17px] leading-[1.5] text-[#d6d5d0] font-[family-name:var(--font-body)] max-w-[560px]">
          {description}
        </p>
      )}
    </div>
  );
}
