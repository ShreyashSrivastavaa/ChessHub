"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";

export function MobileCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 400px (hero section)
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1d1d1d]/95 backdrop-blur border-t border-[#d6d5d0]/20 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.04em] text-[#ffffff]">
            Live 1:1 Coaching
          </span>
          <span className="text-[11px] text-[#d6d5d0]">
            Shreyash & Tapesnu
          </span>
        </div>
        <Button href="/book" variant="primary" size="sm" className="h-[38px] px-5">
          Book a class
        </Button>
      </div>
    </div>
  );
}
