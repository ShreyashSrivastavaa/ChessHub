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
    { label: "COACHES", href: "/coaches" },
    { label: "PROGRAMS", href: "/programs" },
    { label: "PRICING", href: "/pricing" },
    { label: "HOW IT WORKS", href: "/how-it-works" },
    { label: "FAQ", href: "/faq" },
    { label: "CONTACT", href: "/contact" },
  ];

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "COACH"
      ? "/coach"
      : "/app";

  return (
    <header className="w-full bg-[#ffffff] select-none">
      <div className="max-w-[1280px] mx-auto h-[64px] md:h-[80px] px-4 md:px-8 flex items-center justify-between">
        {/* Left: Brand Wordmark */}
        <Link
          href="/"
          className="text-[18px] md:text-[20px] font-[family-name:var(--font-heading)] uppercase tracking-[0.06em] text-[#000000] hover:opacity-80 transition-opacity"
        >
          {BRAND_CONFIG.name}
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] font-[family-name:var(--font-body)] uppercase tracking-[0.04em] text-[#000000] hover-underline-animation"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`${dashboardHref}#notifications`}
                className="relative w-[40px] h-[40px] rounded-[50px] inline-flex items-center justify-center text-[#000000] hover:bg-[#fafafa]"
                aria-label="Notifications"
              >
                <Bell size={18} strokeWidth={1.5} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-[#e3fc03] border border-[#000000]" />
                )}
              </Link>
              <Link
                href={dashboardHref}
                className="h-[36px] px-3 border border-[#000000] rounded-[50px] inline-flex items-center gap-1.5 text-[13px] font-[family-name:var(--font-mono)] uppercase hover:bg-[#fafafa]"
              >
                <User size={14} strokeWidth={1.5} />
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-[40px] h-[40px] rounded-[50px] inline-flex items-center justify-center text-[#000000] hover:bg-[#fafafa]"
              aria-label="Log in to your account"
            >
              <User size={20} strokeWidth={1.5} />
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
            className="lg:hidden w-[40px] h-[40px] rounded-[50px] inline-flex items-center justify-center text-[#000000] hover:bg-[#fafafa]"
            aria-label="Open navigation menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Accessible Mobile Menu Dialog */}
      <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-[#000000]/60 z-50 animate-fade-in" />
          <Dialog.Content className="fixed inset-0 bg-[#ffffff] z-50 flex flex-col p-6 overflow-y-auto">
            <VisuallyHidden.Root>
              <Dialog.Title>Navigation Menu</Dialog.Title>
              <Dialog.Description>Navigation links for mobile view</Dialog.Description>
            </VisuallyHidden.Root>

            <div className="flex items-center justify-between pb-6 border-b border-[#000000]/10">
              <span className="text-[18px] font-[family-name:var(--font-heading)] uppercase tracking-[0.06em]">
                {BRAND_CONFIG.name}
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-[40px] h-[40px] rounded-[50px] inline-flex items-center justify-center text-[#000000] hover:bg-[#fafafa]"
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
                  className="text-[22px] font-[family-name:var(--font-heading)] uppercase tracking-[0.04em] text-[#000000]"
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[22px] font-[family-name:var(--font-heading)] uppercase tracking-[0.04em] text-[#000000]"
                >
                  Dashboard ({user.name})
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[22px] font-[family-name:var(--font-heading)] uppercase tracking-[0.04em] text-[#000000]"
                >
                  Log In / Sign Up
                </Link>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-[#000000]/10 flex flex-col gap-3">
              <Button
                href="/book"
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setMobileMenuOpen(false)}
              >
                Book a class
              </Button>
              <p className="text-[13px] text-[#323232] text-center font-[family-name:var(--font-mono)]">
                {BRAND_CONFIG.tagline}
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
