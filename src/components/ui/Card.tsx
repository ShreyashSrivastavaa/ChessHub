import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({
  children,
  className = "",
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-[#1d1d1d] text-[#ffffff] border border-[#d6d5d0]/20 rounded-[8px] p-[24px] transition-all duration-200 ${
        hoverable ? "hover:border-[#d6d5d0]/60" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
