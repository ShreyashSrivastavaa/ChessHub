import React from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { getSession } from "@/lib/auth/session";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#ffffff]">
      <TopNav user={session} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <MobileCtaBar />
      <Footer />
    </div>
  );
}
