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
            className="text-[13px] uppercase font-[family-name:var(--font-mono)] tracking-[0.04em] text-[#000000]"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-[46px] px-[20px] bg-[#ffffff] text-[#000000] text-[16px] font-[family-name:var(--font-body)] placeholder:text-[#323232] rounded-[50px] border transition-all duration-150 outline-none ${
              error
                ? "border-2 border-[#000000]"
                : "border border-[#000000] focus:border-2 focus:border-[#000000]"
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
          <p className="text-[13px] text-[#323232] font-[family-name:var(--font-body)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
