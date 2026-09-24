"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BRAND_CONFIG } from "@/config/brand";
import { Button } from "../ui/Button";
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
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-[#ffffff] border-b border-[#000000] select-none">
        <div className="max-w-[1280px] mx-auto h-[64px] px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[18px] font-[family-name:var(--font-heading)] uppercase tracking-[0.06em] text-[#000000]"
            >
              {BRAND_CONFIG.name}
            </Link>
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase px-2 py-0.5 rounded-[50px] bg-[#e6e6e6] text-[#000000]">
              {role}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[13px] font-[family-name:var(--font-mono)] text-[#323232]">
              {userName}
            </span>
            <button
              onClick={handleLogout}
              className="h-[36px] px-3 rounded-[50px] border border-[#000000] inline-flex items-center gap-1.5 text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#000000] hover:bg-[#fafafa]"
            >
              <LogOut size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-8 flex-1 flex flex-col">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#000000]/10 mb-6">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[14px] text-[#323232] font-[family-name:var(--font-body)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
        </div>

        {/* Dashboard Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
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
                    className={`h-[40px] px-4 rounded-[50px] lg:rounded-[16px] inline-flex items-center justify-between text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.04em] whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? "bg-[#e3fc03] text-[#000000] border border-[#000000] font-normal"
                        : "bg-[#ffffff] text-[#323232] border border-[#000000]/15 hover:border-[#000000] hover:text-[#000000]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#000000] text-[#ffffff] text-[10px] flex items-center justify-center font-normal ml-2">
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
