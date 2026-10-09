import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { AdminAvailabilityManager } from "@/components/admin/AdminAvailabilityManager";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage() {
  const session = await requireRole(["ADMIN"]);

  const [slots, rules, blockedDates, pendingCount] = await Promise.all([
    prisma.slot.findMany({
      include: {
        bookings: {
          select: {
            id: true,
            reference: true,
            fullName: true,
            status: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 150,
    }),
    prisma.availabilityRule.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.availabilityDate.findMany({
      orderBy: { date: "asc" },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
  ]);

  const transformedSlots = slots.map((s) => {
    const activeCount = s.bookings.filter(
      (b) => b.status === "PENDING" || b.status === "CONFIRMED"
    ).length;

    return {
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      durationMinutes: s.durationMinutes,
      capacity: s.capacity,
      isBlocked: s.isBlocked,
      isSoldOut: s.isSoldOut,
      activeBookings: activeCount,
      remainingCapacity: Math.max(0, s.capacity - activeCount),
      bookings: s.bookings,
    };
  });

  const adminTabs: NavTabItem[] = [
    { label: "Overview", href: "/admin" },
    { label: "Bookings", href: "/admin/bookings", badge: pendingCount },
    { label: "Availability", href: "/admin/availability" },
    { label: "Audit Log", href: "/admin/audit" },
  ];

  return (
    <DashboardShell
      role="ADMIN"
      userName={session.name}
      title="Manage Availability"
      subtitle="Configure calendar slots, capacities, date overrides, and automated recurring weekly rules"
      tabs={adminTabs}
    >
      <AdminAvailabilityManager
        initialSlots={transformedSlots}
        initialRules={rules}
        initialBlockedDates={blockedDates}
      />
    </DashboardShell>
  );
}
