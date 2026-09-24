"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BRAND_CONFIG } from "@/config/brand";
import { LogOut } from "lucide-react";

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
    <div className="min-h-screen bg-[#000000] text-[#ffffff] flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-[#000000] border-b border-[#1d1d1d] select-none">
        <div className="max-w-[1440px] mx-auto h-[64px] px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[17px] font-[family-name:var(--font-body)] text-[#ffffff] hover:text-[#d6d5d0]"
            >
              {BRAND_CONFIG.name}
            </Link>
            <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase px-2.5 py-0.5 rounded-[9999px] bg-[#1d1d1d] border border-[#d6d5d0]/30 text-[#d6d5d0]">
              {role}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[13px] font-[family-name:var(--font-mono)] text-[#d6d5d0]">
              {userName}
            </span>
            <button
              onClick={handleLogout}
              className="h-[36px] px-3.5 rounded-[9999px] border border-[#d6d5d0]/30 inline-flex items-center gap-1.5 text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#ffffff] hover:bg-[#1d1d1d]"
            >
              <LogOut size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-10 flex-1 flex flex-col">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1d1d1d] mb-8">
          <div>
            <h1 className="text-[32px] md:text-[44px] font-[family-name:var(--font-heading)] font-light text-[#ffffff]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[15px] text-[#d6d5d0] font-[family-name:var(--font-body)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
        </div>

        {/* Dashboard Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start flex-1">
          {/* Tabs: Mobile horizontal pill scroll / Desktop slim list */}
          <div className="lg:col-span-3 w-full">
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 scrollbar-none">
              {tabs.map((tab) => {
                const isActive =
                  pathname === tab.href ||
                  (tab.href !== "/app" &&
                    tab.href !== "/coach" &&
                    tab.href !== "/admin" &&
                    pathname.startsWith(tab.href));

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`h-[40px] px-4 rounded-[9999px] inline-flex items-center justify-between text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.04em] whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? "bg-[#ffffff] text-[#000000] border-0 font-normal"
                        : "bg-transparent text-[#d6d5d0] border border-[#d6d5d0]/20 hover:border-[#d6d5d0] hover:text-[#ffffff]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-normal ml-2 ${
                        isActive ? "bg-[#000000] text-[#ffffff]" : "bg-[#ffffff] text-[#000000]"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9 w-full flex flex-col gap-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
