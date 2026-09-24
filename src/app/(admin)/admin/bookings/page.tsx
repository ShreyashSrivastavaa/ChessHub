import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { format } from "date-fns";

export default async function AdminBookingsPage() {
  const session = await requireRole(["ADMIN"]);

  const bookings = await prisma.booking.findMany({
    include: {
      coach: true,
      student: true,
      sessionType: true,
      bookedByUser: true,
    },
    orderBy: { createdAt: "desc" },
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
      title="Master Bookings Register"
      subtitle="Complete chronological bookings database across all coaches"
      tabs={adminTabs}
    >
      <div className="border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff]">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#fafafa] border-b border-[#000000] text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
          <span className="col-span-3">Booking Ref / Time</span>
          <span className="col-span-3">Student & Account</span>
          <span className="col-span-3">Coach & Format</span>
          <span className="col-span-3 text-right">Status</span>
        </div>

        <div className="divide-y divide-[#000000]/10">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center hover:bg-[#fafafa]/50"
            >
              <div className="md:col-span-3">
                <span className="text-[15px] font-[family-name:var(--font-mono)] text-[#000000] block font-normal">
                  {b.reference}
                </span>
                <span className="text-[12px] text-[#323232] font-[family-name:var(--font-mono)]">
                  {format(b.startsAt, "PP HH:mm")} IST
                </span>
              </div>

              <div className="md:col-span-3">
                <span className="text-[15px] font-[family-name:var(--font-body)] text-[#000000] block">
                  {b.student.displayName}
                </span>
                <span className="text-[12px] text-[#323232]">
                  Booked by {b.bookedByUser.name} ({b.bookedByUser.email})
                </span>
              </div>

              <div className="md:col-span-3 text-[14px]">
                <span className="text-[#000000] block">Coach {b.coach.displayName}</span>
                <span className="text-[12px] text-[#323232]">{b.sessionType.name}</span>
              </div>

              <div className="md:col-span-3 flex md:justify-end">
                <Tag
                  variant={
                    b.status === "CONFIRMED"
                      ? "lime"
                      : b.status === "COMPLETED"
                      ? "concrete"
                      : b.status === "CANCELLED"
                      ? "cancelled"
                      : "outline"
                  }
                  size="sm"
                >
                  {b.status}
                </Tag>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
