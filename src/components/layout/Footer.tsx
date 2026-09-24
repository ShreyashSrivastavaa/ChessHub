import React from "react";
import Link from "next/link";
import { BRAND_CONFIG } from "@/config/brand";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#000000] text-[#ffffff] pt-14 pb-12 mt-auto select-none border-t border-[#1a1a1a]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#1a1a1a]">
          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <span className="text-[20px] font-[family-name:var(--font-heading)] uppercase tracking-[0.06em]">
              {BRAND_CONFIG.name}
            </span>
            <p className="text-[13px] text-[#e6e6e6] leading-[1.6] max-w-[260px] font-[family-name:var(--font-body)]">
              {BRAND_CONFIG.tagline}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[12px] font-[family-name:var(--font-mono)] text-[#e6e6e6]">
              <ShieldCheck size={16} strokeWidth={1.5} className="text-[#e3fc03]" />
              <span>Payments secured by Razorpay</span>
            </div>
          </div>

          {/* Column 1: Academy */}
          <div className="flex flex-col gap-3">
            <span className="text-[16px] font-[family-name:var(--font-mono)] uppercase tracking-[0.04em] text-[#ffffff]">
              Academy
            </span>
            <ul className="flex flex-col gap-2 text-[13px] font-[family-name:var(--font-body)] text-[#ffffff]">
              <li>
                <Link href="/coaches" className="hover:text-[#e3fc03] transition-colors">
                  Coaches (Shreyash & Tapesh)
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-[#e3fc03] transition-colors">
                  Programs & Levels
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#e3fc03] transition-colors">
                  Pricing & 1:1 Plans
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#e3fc03] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#e3fc03] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal */}
          <div className="flex flex-col gap-3">
            <span className="text-[16px] font-[family-name:var(--font-mono)] uppercase tracking-[0.04em] text-[#ffffff]">
              Legal & Policy
            </span>
            <ul className="flex flex-col gap-2 text-[13px] font-[family-name:var(--font-body)] text-[#ffffff]">
              <li>
                <Link href="/terms" className="hover:text-[#e3fc03] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#e3fc03] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#e3fc03] transition-colors">
                  Refund & Reschedule Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col gap-3">
            <span className="text-[16px] font-[family-name:var(--font-mono)] uppercase tracking-[0.04em] text-[#ffffff]">
              Direct Contact
            </span>
            <ul className="flex flex-col gap-2 text-[13px] font-[family-name:var(--font-body)] text-[#ffffff]">
              <li>
                <a
                  href={`mailto:${BRAND_CONFIG.contactEmail}`}
                  className="hover:text-[#e3fc03] transition-colors"
                >
                  {BRAND_CONFIG.contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e3fc03] transition-colors"
                >
                  WhatsApp: {BRAND_CONFIG.whatsappNumber}
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e3fc03] transition-colors">
                  Send a message
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-[family-name:var(--font-mono)] text-[#e6e6e6]">
          <p>© {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved.</p>
          <p className="text-[11px] text-[#e6e6e6]">
            Built with ruthless precision. Voltage Lime on monochrome.
          </p>
        </div>
      </div>
    </footer>
  );
}
