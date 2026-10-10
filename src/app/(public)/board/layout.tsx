import React from "react";
import { JetBrains_Mono } from "next/font/google";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
  preload: false,
});

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${mono.variable} min-h-screen`}>{children}</div>;
}
