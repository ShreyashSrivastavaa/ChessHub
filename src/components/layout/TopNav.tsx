"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BUSINESS_CONFIG } from "@/config/business";
import { Button } from "../ui/Button";
import { User, Menu, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { ChessHubLogo } from "../ui/ChessHubLogo";

export interface TopNavProps {
  user?: {
    id: string;
    name: string;
    role: "STUDENT" | "COACH" | "ADMIN";
  } | null;
}

export function TopNav({ user: initialUser }: TopNavProps) {
  const [user, setUser] = useState(initialUser ?? null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser);
      return;
    }
    // Client-side session fetch prevents dynamic deopt on marketing pages
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, [initialUser]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Board", href: "/board" },
    { label: "Coaching", href: "/#coaching" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0e0e10]/95 backdrop-blur-md border-b border-[#2e2e36] text-[#f5f3ef]">
      <div className="max-w-[1440px] mx-auto h-[68px] px-6 md:px-12 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <ChessHubLogo size="md" withTagline={false} />

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[14px] font-[family-name:var(--font-body)] text-[#dcd8d0] hover:text-[#f5f3ef] hover-underline-animation transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#cfa859]/40 bg-[#cfa859]/10 text-[12px] font-[family-name:var(--font-mono)] text-[#cfa859] hover:bg-[#cfa859]/20"
            >
              <User size={13} />
              <span>Admin</span>
            </Link>
          )}

          {/* Primary CTA */}
          <Button
            href="/book"
            variant="primary"
            size="sm"
            className="hidden sm:inline-flex !bg-[#cfa859] hover:!bg-[#e0b86a] !text-[#0e0e10] !font-medium"
          >
            Book a Session
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-[40px] h-[40px] rounded-full inline-flex items-center justify-center text-[#f5f3ef] hover:bg-[#1a1a1e] transition-colors"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Accessible Mobile Menu Dialog */}
      <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-[#0e0e10]/85 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed inset-0 bg-[#0e0e10] text-[#f5f3ef] z-50 flex flex-col p-6 overflow-y-auto">
            <VisuallyHidden.Root>
              <Dialog.Title>Navigation Menu</Dialog.Title>
              <Dialog.Description>ChessHub navigation menu for mobile devices</Dialog.Description>
            </VisuallyHidden.Root>

            <div className="flex items-center justify-between pb-6 border-b border-[#2e2e36]">
              <ChessHubLogo size="md" withTagline={true} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-[40px] h-[40px] rounded-full inline-flex items-center justify-center text-[#f5f3ef] hover:bg-[#1a1a1e] transition-colors"
                aria-label="Close navigation menu"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-col py-8 gap-5" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[22px] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef] hover:text-[#cfa859] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {user?.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[18px] font-[family-name:var(--font-mono)] text-[#cfa859] pt-4"
                >
                  → Admin Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[14px] font-[family-name:var(--font-mono)] text-[#a8a39a] pt-4"
                >
                  Admin Login
                </Link>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-[#2e2e36] flex flex-col gap-4">
              <Button
                href="/book"
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setMobileMenuOpen(false)}
                className="!bg-[#cfa859] hover:!bg-[#e0b86a] !text-[#0e0e10] !font-medium"
              >
                Book a Session
              </Button>
              <p className="text-[12px] text-[#a8a39a] text-center font-[family-name:var(--font-mono)]">
                {BUSINESS_CONFIG.tagline}
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
