import React from "react";
import Link from "next/link";
import { BUSINESS_CONFIG } from "@/config/business";
import { Mail, Phone, ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#0e0e10] text-[#f5f3ef] pt-16 pb-12 mt-auto border-t border-[#2e2e36]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-14 border-b border-[#2e2e36]">
          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#cfa859]" aria-hidden="true" />
              <span className="text-[22px] font-[family-name:var(--font-heading)] font-medium text-[#f5f3ef]">
                {BUSINESS_CONFIG.name}
              </span>
            </div>
            <p className="text-[14px] text-[#a8a39a] leading-[1.6] max-w-[280px] font-[family-name:var(--font-body)]">
              Personalized 1:1 online chess coaching run by Shreyash and Tapesnu.
            </p>
            <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-[#1a1a1e] border border-[#2e2e36] text-[12px] text-[#dcd8d0]">
              <ShieldAlert size={16} className="text-[#cfa859] shrink-0 mt-0.5" />
              <span>
                Payment policy: No online checkout. Students contact coaches directly to arrange payment and confirm sessions.
              </span>
            </div>
          </div>

          {/* Column 1: Coaching & Pricing */}
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-[#cfa859]">
              Coaching & Fees
            </span>
            <ul className="flex flex-col gap-2.5 text-[14px] font-[family-name:var(--font-body)] text-[#dcd8d0]">
              <li className="flex flex-col">
                <span className="text-[#f5f3ef] font-medium">Beginner Coaching</span>
                <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#cfa859]">
                  ₹500 per session
                </span>
              </li>
              <li className="flex flex-col pt-1">
                <span className="text-[#f5f3ef] font-medium">Advanced Coaching</span>
                <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#cfa859]">
                  ₹800 per session
                </span>
              </li>
              <li className="pt-2">
                <Link href="/book" className="text-[#cfa859] hover:underline font-medium">
                  &rarr; Book a session
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-[#cfa859]">
              Quick Links
            </span>
            <ul className="flex flex-col gap-2 text-[14px] font-[family-name:var(--font-body)] text-[#dcd8d0]">
              <li>
                <Link href="/" className="hover:text-[#f5f3ef] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#coaching" className="hover:text-[#f5f3ef] transition-colors">
                  Coaching Plans
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#f5f3ef] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#f5f3ef] transition-colors">
                  About Us (Meet the Coaches)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#f5f3ef] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Direct Contact */}
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-[#cfa859]">
              Direct Contact
            </span>
            <ul className="flex flex-col gap-3 text-[14px] font-[family-name:var(--font-body)] text-[#dcd8d0]">
              <li>
                <a
                  href={`mailto:${BUSINESS_CONFIG.email}`}
                  className="flex items-center gap-2 hover:text-[#cfa859] transition-colors"
                >
                  <Mail size={15} className="text-[#cfa859]" />
                  <span>{BUSINESS_CONFIG.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BUSINESS_CONFIG.phone}`}
                  className="flex items-center gap-2 hover:text-[#cfa859] transition-colors"
                >
                  <Phone size={15} className="text-[#cfa859]" />
                  <span>{BUSINESS_CONFIG.phoneDisplay} ({BUSINESS_CONFIG.contactCoachName})</span>
                </a>
              </li>
              <li className="text-[12px] text-[#a8a39a] leading-relaxed">
                Reach out to discuss customized coaching schedules, student levels, or sibling lessons.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
          <p>© {new Date().getFullYear()} {BUSINESS_CONFIG.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Timezone: {BUSINESS_CONFIG.timezone}</span>
            <span>·</span>
            <Link href="/login" className="hover:text-[#f5f3ef]">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
