import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] uppercase font-[family-name:var(--font-mono)] tracking-[0.06em] text-[#d6d5d0]"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-[46px] px-[20px] bg-[#1d1d1d] text-[#ffffff] text-[16px] font-[family-name:var(--font-body)] placeholder:text-[#d6d5d0]/50 rounded-[9999px] border transition-all duration-150 outline-none ${
              error
                ? "border border-[#B3261E]"
                : "border border-[#d6d5d0]/40 focus:border-[#ffffff]"
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <div className="flex items-center gap-1.5 text-[13px] text-[#B3261E] font-[family-name:var(--font-body)]">
            <AlertCircle size={14} strokeWidth={1.5} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p className="text-[13px] text-[#d6d5d0]/70 font-[family-name:var(--font-body)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
