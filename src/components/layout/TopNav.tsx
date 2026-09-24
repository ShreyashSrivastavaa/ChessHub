"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BRAND_CONFIG } from "@/config/brand";
import { Button } from "../ui/Button";
import { User, Menu, X, Bell } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export interface TopNavProps {
  user?: {
    id: string;
    name: string;
    role: "STUDENT" | "COACH" | "ADMIN";
  } | null;
  unreadNotificationsCount?: number;
}

export function TopNav({ user, unreadNotificationsCount = 0 }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Coaches", href: "/coaches" },
    { label: "Programs", href: "/programs" },
    { label: "Pricing", href: "/pricing" },
    { label: "Approach", href: "/how-it-works" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "COACH"
      ? "/coach"
      : "/app";

  return (
    <header className="w-full bg-[#000000] text-[#ffffff] select-none">
      <div className="max-w-[1440px] mx-auto h-[64px] md:h-[80px] px-6 md:px-12 flex items-center justify-between">
        {/* Left: Brand Wordmark */}
        <Link
          href="/"
          className="text-[16px] md:text-[18px] font-[family-name:var(--font-body)] tracking-[0.02em] text-[#ffffff] hover:text-[#d6d5d0] transition-colors"
        >
          {BRAND_CONFIG.name}
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[16px] font-[family-name:var(--font-body)] text-[#ffffff] hover:text-[#d6d5d0] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`${dashboardHref}#notifications`}
                className="relative w-[40px] h-[40px] rounded-[9999px] inline-flex items-center justify-center text-[#ffffff] hover:bg-[#1d1d1d]"
                aria-label="Notifications"
              >
                <Bell size={18} strokeWidth={1.5} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-2 right-2 w-[6px] h-[6px] rounded-full bg-[#ffffff]" />
                )}
              </Link>
              <Link
                href={dashboardHref}
                className="h-[38px] px-4 border border-[#d6d5d0]/30 rounded-[9999px] inline-flex items-center gap-2 text-[14px] font-[family-name:var(--font-body)] hover:bg-[#1d1d1d] text-[#ffffff]"
              >
                <User size={14} strokeWidth={1.5} />
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-[40px] h-[40px] rounded-[9999px] inline-flex items-center justify-center text-[#ffffff] hover:bg-[#1d1d1d]"
              aria-label="Log in to your account"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>
          )}

          {/* Primary CTA Pill */}
          <Button
            href="/book"
            variant="primary"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Book a class
          </Button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-[40px] h-[40px] rounded-[9999px] inline-flex items-center justify-center text-[#ffffff] hover:bg-[#1d1d1d]"
            aria-label="Open navigation menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Accessible Mobile Menu Dialog */}
      <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-[#000000]/80 z-50 animate-fade-in" />
          <Dialog.Content className="fixed inset-0 bg-[#000000] text-[#ffffff] z-50 flex flex-col p-6 overflow-y-auto">
            <VisuallyHidden.Root>
              <Dialog.Title>Navigation Menu</Dialog.Title>
              <Dialog.Description>Navigation links for mobile view</Dialog.Description>
            </VisuallyHidden.Root>

            <div className="flex items-center justify-between pb-6 border-b border-[#1d1d1d]">
              <span className="text-[18px] font-[family-name:var(--font-body)] text-[#ffffff]">
                {BRAND_CONFIG.name}
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-[40px] h-[40px] rounded-[9999px] inline-flex items-center justify-center text-[#ffffff] hover:bg-[#1d1d1d]"
                aria-label="Close navigation menu"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-col py-8 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[26px] font-[family-name:var(--font-heading)] font-light text-[#ffffff]"
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[26px] font-[family-name:var(--font-heading)] font-light text-[#ffffff]"
                >
                  Dashboard ({user.name})
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[26px] font-[family-name:var(--font-heading)] font-light text-[#ffffff]"
                >
                  Log In / Sign Up
                </Link>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-[#1d1d1d] flex flex-col gap-3">
              <Button
                href="/book"
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setMobileMenuOpen(false)}
              >
                Book a class
              </Button>
              <p className="text-[13px] text-[#d6d5d0]/70 text-center font-[family-name:var(--font-body)]">
                {BRAND_CONFIG.tagline}
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
