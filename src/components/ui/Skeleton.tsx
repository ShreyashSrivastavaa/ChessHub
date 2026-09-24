import React from "react";

export interface SkeletonProps {
  className?: string;
  pill?: boolean;
}

export function Skeleton({ className = "", pill = false }: SkeletonProps) {
  return (
    <div
      className={`bg-[#e6e6e6] animate-pulse ${
        pill ? "rounded-[50px]" : "rounded-[16px]"
      } ${className}`}
      style={{ animationDuration: "2.5s" }}
    />
  );
}
