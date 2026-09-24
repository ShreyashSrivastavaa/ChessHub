import React, { forwardRef } from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "inverted";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: string;
  rel?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      href,
      target,
      rel,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-[family-name:var(--font-body)] font-normal select-none transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variantStyles = {
      primary:
        "bg-[#ffffff] text-[#000000] border-0 rounded-[9999px] hover:opacity-90 active:opacity-100",
      secondary:
        "bg-transparent text-[#ffffff] border border-[#d6d5d0] rounded-[9999px] hover:bg-[#1d1d1d] active:bg-[#1d1d1d]",
      ghost:
        "bg-transparent text-[#ffffff] border-0 rounded-[9999px] hover-underline-animation p-0",
      inverted:
        "bg-[#1d1d1d] text-[#ffffff] border border-[#d6d5d0]/30 rounded-[9999px] hover:border-[#d6d5d0] hover:bg-[#252525]",
    };

    const sizeStyles = {
      sm: variant === "ghost" ? "text-[14px]" : "h-[38px] px-[20px] text-[14px]",
      md: variant === "ghost" ? "text-[16px]" : "h-[46px] px-[24px] text-[16px]",
      lg: variant === "ghost" ? "text-[17px]" : "h-[54px] px-[32px] text-[16px]",
    };

    const widthStyle = fullWidth ? "w-full" : "";
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim();

    if (href && !disabled) {
      return (
        <Link href={href} target={target} rel={rel} className={combinedClassName}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={combinedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
