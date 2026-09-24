import React from "react";
import { Board } from "../chess/Board";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`border border-[#000000] rounded-[16px] bg-[#ffffff] p-8 md:p-12 flex flex-col items-center text-center max-w-[540px] mx-auto ${className}`}
    >
      <div className="w-[140px] h-[140px] mb-6">
        <Board
          highlights={[{ row: 3, col: 3 }]}
          showCoordinates={false}
          className="w-full h-full"
        />
      </div>

      <h3 className="text-[22px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
        {title}
      </h3>
      <p className="text-[16px] text-[#323232] font-[family-name:var(--font-body)] max-w-[380px] mb-6 leading-[1.6]">
        {description}
      </p>

      {actionLabel && (actionHref || onAction) && (
        <Button
          variant="primary"
          href={actionHref}
          onClick={onAction}
          className="min-w-[160px]"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
