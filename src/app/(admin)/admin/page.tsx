import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await requireRole(["ADMIN"]);
  const now = new Date();

  const [
    totalRequests,
    pendingCount,
    confirmedCount,
    cancelledCount,
    completedCount,
    upcomingCount,
    beginnerCount,
    advancedCount,
    recentBookings,
    weekSlots,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({
      where: {
        startsAt: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    prisma.booking.count({ where: { level: "beginner" } }),
    prisma.booking.count({ where: { level: "advanced" } }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    // Slots for the current week schedule view
    prisma.slot.findMany({
      where: {
        startsAt: {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      },
      include: {
        bookings: {
          select: {
            id: true,
            reference: true,
            fullName: true,
            status: true,
            level: true,
          },
        },
      },
      orderBy: { startsAt: "asc" },
    }),
  ]);

  const adminTabs: NavTabItem[] = [
    { label: "Overview", href: "/admin" },
    { label: "Bookings", href: "/admin/bookings", badge: pendingCount },
    { label: "Availability", href: "/admin/availability" },
    { label: "Audit Log", href: "/admin/audit" },
  ];

  // Group current week slots by date for schedule view
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(weekStart, i)); // Mon-Sat

  return (
    <DashboardShell
      role="ADMIN"
      userName={session.name}
      title="Academy Dashboard"
      subtitle="Operational overview, active requests, and coaching schedules for Shreyash & Tapesnu"
      tabs={adminTabs}
    >
      {/* 1. KEY METRICS STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-[#141418] border border-[#2e2e36] flex flex-col">
          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
            Total Requests
          </span>
          <span className="text-[26px] font-[family-name:var(--font-mono)] font-semibold text-[#f5f3ef] mt-1">
            {totalRequests}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#141418] border border-[#cfa859]/40 flex flex-col">
          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#cfa859]">
            Pending Action
          </span>
          <span className="text-[26px] font-[family-name:var(--font-mono)] font-semibold text-[#cfa859] mt-1">
            {pendingCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#141418] border border-[#2e5a44]/50 flex flex-col">
          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#4e8765]">
            Confirmed
          </span>
          <span className="text-[26px] font-[family-name:var(--font-mono)] font-semibold text-[#4e8765] mt-1">
            {confirmedCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#141418] border border-[#2e2e36] flex flex-col">
          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
            Upcoming
          </span>
          <span className="text-[26px] font-[family-name:var(--font-mono)] font-semibold text-[#f5f3ef] mt-1">
            {upcomingCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#141418] border border-[#2e2e36] flex flex-col">
          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
            Completed
          </span>
          <span className="text-[26px] font-[family-name:var(--font-mono)] font-semibold text-[#f5f3ef] mt-1">
            {completedCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#141418] border border-[#2e2e36] flex flex-col">
          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
            Cancelled
          </span>
          <span className="text-[26px] font-[family-name:var(--font-mono)] font-semibold text-[#6e6a64] mt-1">
            {cancelledCount}
          </span>
        </div>
      </div>

      {/* 2. PROGRAM BREAKDOWN & RECENT BOOKINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Beginner vs Advanced Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col gap-5">
          <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#cfa859]">
            Coaching Program Distribution
          </span>

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between text-[14px] mb-1.5">
                <span className="text-[#f5f3ef] font-medium">Beginner Coaching (₹500)</span>
                <span className="font-[family-name:var(--font-mono)] text-[#cfa859]">{beginnerCount} requests</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1a1a1e] overflow-hidden">
                <div
                  className="h-full bg-[#4e8765] rounded-full"
                  style={{
                    width: `${totalRequests > 0 ? (beginnerCount / totalRequests) * 100 : 50}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[14px] mb-1.5">
                <span className="text-[#f5f3ef] font-medium">Advanced Coaching (₹800)</span>
                <span className="font-[family-name:var(--font-mono)] text-[#cfa859]">{advancedCount} requests</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1a1a1e] overflow-hidden">
                <div
                  className="h-full bg-[#cfa859] rounded-full"
                  style={{
                    width: `${totalRequests > 0 ? (advancedCount / totalRequests) * 100 : 50}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1a1a1e] border border-[#2e2e36] text-[13px] text-[#dcd8d0] mt-2">
            <span className="text-[#f5f3ef] font-medium block mb-1">Direct Contact Policy Reminder</span>
            Bookings enter as <strong>Pending</strong>. Coaches contact the student directly via email or WhatsApp to discuss payment arrangements before marking <strong>Confirmed</strong>.
          </div>
        </div>

        {/* Recent Requests Register */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2e2e36]">
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#cfa859]">
              Recent Booking Requests
            </span>
            <Link
              href="/admin/bookings"
              className="text-[12px] font-[family-name:var(--font-mono)] text-[#cfa859] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-[#2e2e36]">
            {recentBookings.length === 0 ? (
              <div className="py-8 text-center text-[#a8a39a] text-[14px]">
                No booking requests submitted yet.
              </div>
            ) : (
              recentBookings.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#cfa859] font-medium">
                        {b.reference}
                      </span>
                      <span className="text-[14px] text-[#f5f3ef] font-medium">{b.fullName}</span>
                    </div>
                    <span className="text-[12px] text-[#a8a39a]">
                      {b.level.toUpperCase()} · {b.date} at {b.timeSlot} · ₹{b.priceRupees}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-[family-name:var(--font-mono)] font-medium uppercase ${
                      b.status === "CONFIRMED"
                        ? "bg-[#2e5a44]/30 text-[#4e8765] border border-[#2e5a44]"
                        : b.status === "PENDING"
                        ? "bg-[#cfa859]/20 text-[#cfa859] border border-[#cfa859]/50"
                        : b.status === "COMPLETED"
                        ? "bg-[#1a1a1e] text-[#dcd8d0]"
                        : "bg-[#b3261e]/20 text-[#ff6b6b]"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. WEEKLY SCHEDULE / CALENDAR VIEW */}
      <div className="p-6 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2e2e36]">
          <div>
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#cfa859] block mb-1">
              Weekly Operational Schedule
            </span>
            <span className="text-[18px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef]">
              {format(weekStart, "MMMM d")} – {format(addDays(weekStart, 5), "MMMM d, yyyy")}
            </span>
          </div>
          <Link
            href="/admin/availability"
            className="text-[13px] font-[family-name:var(--font-mono)] text-[#cfa859] hover:underline"
          >
            Manage Slots & Rules →
          </Link>
        </div>

        {/* 6-Day Column Grid (Mon - Sat) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {weekDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const daySlots = weekSlots.filter((s) => s.date === dateStr);
            const isToday = isSameDay(day, now);

            return (
              <div
                key={dateStr}
                className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
                  isToday
                    ? "bg-[#1a1a1e] border-[#cfa859]/50"
                    : "bg-[#0e0e10] border-[#2e2e36]"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#2e2e36]">
                  <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
                    {format(day, "EEE, MMM d")}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#cfa859] uppercase font-bold">
                      Today
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 min-h-[120px]">
                  {daySlots.length === 0 ? (
                    <span className="text-[12px] text-[#6e6a64] py-4 text-center">No slots</span>
                  ) : (
                    daySlots.map((slot) => {
                      const activeBookings = slot.bookings.filter(
                        (b) => b.status === "PENDING" || b.status === "CONFIRMED"
                      );
                      const isBooked = activeBookings.length > 0;

                      return (
                        <div
                          key={slot.id}
                          className={`p-2 rounded-lg border text-[11px] font-[family-name:var(--font-mono)] flex flex-col gap-1 ${
                            isBooked
                              ? "bg-[#2e5a44]/20 border-[#2e5a44] text-[#4e8765]"
                              : slot.isBlocked
                              ? "bg-[#141418] border-[#2e2e36] text-[#6e6a64] line-through"
                              : "bg-[#1a1a1e] border-[#2e2e36] text-[#dcd8d0]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{slot.startTime}</span>
                            <span>{isBooked ? `${activeBookings.length}/${slot.capacity}` : "Open"}</span>
                          </div>
                          {isBooked && (
                            <span className="truncate text-[#f5f3ef]">
                              {activeBookings[0].fullName} ({activeBookings[0].reference})
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
