"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BUSINESS_CONFIG } from "@/config/business";
import { LogOut, Shield } from "lucide-react";

export interface NavTabItem {
  label: string;
  href: string;
  badge?: number;
}

export interface DashboardShellProps {
  role: "STUDENT" | "COACH" | "ADMIN";
  userName: string;
  title: string;
  subtitle?: string;
  tabs: NavTabItem[];
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function DashboardShell({
  role,
  userName,
  title,
  subtitle,
  tabs,
  children,
  headerActions,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] text-[#f5f3ef] flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-[#141418] border-b border-[#2e2e36] select-none sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto h-[64px] px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-[18px] font-[family-name:var(--font-heading)] font-medium text-[#f5f3ef] hover:text-[#cfa859] transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#cfa859]" />
              <span>{BUSINESS_CONFIG.name}</span>
            </Link>
            <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase px-2.5 py-0.5 rounded-full bg-[#cfa859]/10 border border-[#cfa859]/30 text-[#cfa859] flex items-center gap-1">
              <Shield size={11} />
              <span>{role}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[13px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
              {userName}
            </span>
            <button
              onClick={handleLogout}
              className="h-[34px] px-3.5 rounded-full border border-[#2e2e36] inline-flex items-center gap-1.5 text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#dcd8d0] hover:text-[#f5f3ef] hover:border-[#cfa859] hover:bg-[#1a1a1e] transition-colors"
            >
              <LogOut size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-8 md:py-10 flex-1 flex flex-col">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2e2e36] mb-8">
          <div>
            <h1 className="text-[30px] md:text-[38px] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[14px] text-[#a8a39a] font-[family-name:var(--font-body)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
        </div>

        {/* Dashboard Navigation & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          {/* Navigation Tabs */}
          <div className="lg:col-span-3 w-full">
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 scrollbar-none" aria-label="Admin tabs">
              {tabs.map((tab) => {
                const isActive =
                  pathname === tab.href ||
                  (tab.href !== "/admin" && pathname.startsWith(tab.href));

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`h-[42px] px-4 rounded-xl inline-flex items-center justify-between text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.04em] whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? "bg-[#cfa859] text-[#0e0e10] font-semibold shadow-md shadow-[#cfa859]/10"
                        : "bg-[#141418] text-[#dcd8d0] border border-[#2e2e36] hover:border-[#cfa859] hover:text-[#f5f3ef]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-[family-name:var(--font-mono)] ml-2 ${
                          isActive
                            ? "bg-[#0e0e10] text-[#cfa859]"
                            : "bg-[#cfa859]/20 text-[#cfa859] border border-[#cfa859]/40"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Main Content Body */}
          <div className="lg:col-span-9 w-full flex flex-col gap-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
