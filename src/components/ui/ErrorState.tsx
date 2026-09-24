import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`border-2 border-[#000000] rounded-[16px] bg-[#ffffff] p-6 md:p-8 flex flex-col items-center text-center max-w-[480px] mx-auto ${className}`}
    >
      <div className="w-[44px] h-[44px] rounded-[50px] border border-[#000000] flex items-center justify-center text-[#B3261E] mb-4">
        <AlertCircle size={22} strokeWidth={1.5} />
      </div>

      <h3 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
        {title}
      </h3>

      <p className="text-[13px] text-[#B3261E] font-[family-name:var(--font-body)] mb-6 max-w-[340px]">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw size={14} strokeWidth={1.5} />
          <span>Try again</span>
        </Button>
      )}
    </div>
  );
}
