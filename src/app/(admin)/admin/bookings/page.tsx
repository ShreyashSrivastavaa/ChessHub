import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { AdminBookingsManager } from "@/components/admin/AdminBookingsManager";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const session = await requireRole(["ADMIN"]);
  const now = new Date();

  const [bookings, pendingCount, upcomingSlots] = await Promise.all([
    prisma.booking.findMany({
      include: {
        events: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.slot.findMany({
      where: {
        startsAt: { gte: now },
        isBlocked: false,
      },
      include: {
        bookings: {
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
          select: { id: true },
        },
      },
      orderBy: { startsAt: "asc" },
      take: 50,
    }),
  ]);

  const availableSlotOptions = upcomingSlots
    .map((s) => ({
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      remainingCapacity: Math.max(0, s.capacity - s.bookings.length),
    }))
    .filter((s) => s.remainingCapacity > 0);

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
      title="Manage Bookings"
      subtitle="Search, filter, confirm, reschedule, or cancel student sessions"
      tabs={adminTabs}
    >
      <AdminBookingsManager
        initialBookings={bookings}
        availableSlots={availableSlotOptions}
      />
    </DashboardShell>
  );
}
