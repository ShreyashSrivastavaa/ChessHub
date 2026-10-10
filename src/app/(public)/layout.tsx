import React from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#ffffff]">
      <TopNav />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <MobileCtaBar />
      <Footer />
    </div>
  );
}
