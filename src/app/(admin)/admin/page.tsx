import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";

export default async function AdminDashboardPage() {
  const session = await requireRole(["ADMIN"]);

  const [usersCount, bookingsCount, coachesCount, paymentsTotal] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.coach.count(),
    prisma.payment.aggregate({
      where: { status: "CAPTURED" },
      _sum: { amountPaise: true },
    }),
  ]);

  const recentBookings = await prisma.booking.findMany({
    include: { coach: true, student: true, sessionType: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const adminTabs: NavTabItem[] = [
    { label: "Overview", href: "/admin" },
    { label: "Coaches", href: "/admin/coaches" },
    { label: "Session Types", href: "/admin/session-types" },
    { label: "Bookings", href: "/admin/bookings" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Testimonials", href: "/admin/testimonials" },
    { label: "Users", href: "/admin/users" },
  ];

  return (
    <DashboardShell
      role="ADMIN"
      userName={session.name}
      title="Academy Administration"
      subtitle="Superadmin controls for Two Rooks Academy"
      tabs={adminTabs}
    >
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
            Total Users
          </span>
          <span className="text-[28px] font-[family-name:var(--font-mono)] text-[#000000]">
            {usersCount}
          </span>
        </Card>

        <Card>
          <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
            Total Bookings
          </span>
          <span className="text-[28px] font-[family-name:var(--font-mono)] text-[#000000]">
            {bookingsCount}
          </span>
        </Card>

        <Card>
          <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
            Active Coaches
          </span>
          <span className="text-[28px] font-[family-name:var(--font-mono)] text-[#000000]">
            {coachesCount}
          </span>
        </Card>

        <Card>
          <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
            Captured Revenue
          </span>
          <span className="text-[28px] font-[family-name:var(--font-mono)] text-[#000000]">
            ₹{((paymentsTotal._sum.amountPaise || 0) / 100).toLocaleString("en-IN")}
          </span>
        </Card>
      </div>

      <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4 mt-4">
        <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
          Recent Bookings Register
        </span>

        <div className="flex flex-col divide-y divide-[#000000]/10">
          {recentBookings.map((b) => (
            <div key={b.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="text-[15px] font-normal text-[#000000] block">
                  {b.reference} · {b.student.displayName}
                </span>
                <span className="text-[12px] text-[#323232]">
                  Coach {b.coach.displayName} · {b.sessionType.name}
                </span>
              </div>
              <Tag variant={b.status === "CONFIRMED" ? "lime" : "outline"} size="sm">
                {b.status}
              </Tag>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
