import React, { Suspense } from "react";
import { ChessHubBookingFlow } from "@/components/booking/ChessHubBookingFlow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a Session — Chess Hub",
  description:
    "Schedule your 1:1 online chess coaching session with Shreyash or Tapesnu. Choose Beginner (₹500) or Advanced (₹800).",
};

export default function BookPage() {
  return (
    <div className="w-full bg-[#0e0e10] text-[#f5f3ef] min-h-[calc(100vh-140px)]">
      <Suspense
        fallback={
          <div className="max-w-[1280px] mx-auto px-4 py-20 text-center text-[#a8a39a]">
            Loading booking calendar...
          </div>
        }
      >
        <ChessHubBookingFlow />
      </Suspense>
    </div>
  );
}
