import React from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({
  children,
  label,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`w-[40px] h-[40px] inline-flex items-center justify-center text-[#000000] hover:text-[#323232] rounded-[50px] transition-colors duration-150 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
