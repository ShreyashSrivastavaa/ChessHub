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
        "bg-[#e3fc03] text-[#000000] border-0 rounded-[50px] hover:-translate-y-0.5 active:translate-y-0",
      secondary:
        "bg-[#ffffff] text-[#000000] border border-[#000000] rounded-[50px] hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#fafafa]",
      ghost:
        "bg-transparent text-[#000000] border-0 rounded-[50px] hover-underline-animation p-0",
      inverted:
        "bg-[#000000] text-[#ffffff] border border-[#000000] rounded-[50px] hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#1a1a1a]",
    };

    const sizeStyles = {
      sm: variant === "ghost" ? "text-[13px]" : "h-[36px] px-[18px] text-[13px]",
      md: variant === "ghost" ? "text-[16px]" : "h-[44px] px-[24px] text-[16px]",
      lg: variant === "ghost" ? "text-[18px]" : "h-[52px] px-[32px] text-[16px]",
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
